
import React, { useState, useCallback } from 'react';
import { CVForm } from './components/CVForm';
import { CVPreview } from './components/CVPreview';
import { useCVData } from './hooks/useCVData';
import { generateCV, parseAndEnhanceCVFromFile } from './services/geminiService';
import { CVData, SectionId } from './types';
import { GithubIcon, SparklesIcon, CheckCircleIcon, XCircleIcon } from './components/icons';
import { EnhancePreviewModal } from './components/EnhancePreviewModal';
import { LanguageSelector } from './components/LanguageSelector';

const SaveStatusIndicator: React.FC<{ status: 'idle' | 'saving' | 'saved' | 'error' }> = ({ status }) => {
    const visible = status !== 'idle';
    
    // Use 'saved' config for layout calculations when idle to prevent shift
    const placeholderConfig = {
        icon: <CheckCircleIcon className="h-4 w-4" />,
        text: 'Saved',
        className: 'text-green-500',
    };
    
    const statusConfig = {
        saving: {
            icon: <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
            text: 'Saving...',
            className: 'text-gray-500',
        },
        saved: placeholderConfig,
        error: {
            icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
            text: 'Save error',
            className: 'text-red-500',
        },
    };

    const currentStatus = status === 'idle' ? placeholderConfig : statusConfig[status];

    return (
        <div className={`flex items-center justify-center space-x-2 text-sm font-medium w-24 transition-opacity duration-300 ${currentStatus.className} ${visible ? 'opacity-100' : 'opacity-0'}`}>
            {currentStatus.icon}
            <span>{currentStatus.text}</span>
        </div>
    );
};


const App: React.FC = () => {
  const { 
    cvData, 
    saveStatus,
    loadCVData, 
    updatePersonal, 
    addExperience, 
    updateExperience, 
    removeExperience, 
    reorderExperience,
    addEducation, 
    updateEducation, 
    removeEducation, 
    reorderEducation,
    updateSkills,
    addProject,
    updateProject,
    removeProject,
    reorderProject,
    addCertification,
    updateCertification,
    removeCertification,
    reorderCertification,
    updateProfessionalNarrative,
    updateVideoUrl
  } = useCVData();
  const [generatedMd, setGeneratedMd] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  const [sections, setSections] = useState<SectionId[]>(['personal', 'experience', 'education', 'skills', 'projects', 'certifications', 'video', 'professionalNarrative']);
  const [language, setLanguage] = useState('en');
  
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showEnhancePreviewModal, setShowEnhancePreviewModal] = useState(false);
  const [pendingEnhancedData, setPendingEnhancedData] = useState<CVData | null>(null);
  const [enhancedPreviewMd, setEnhancedPreviewMd] = useState('');


  const handleGenerateCV = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const markdown = await generateCV(cvData as CVData, selectedTemplate, sections, language);
      setGeneratedMd(markdown);
    } catch (e) {
      setError('Failed to generate CV. Please check your API key and try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [cvData, selectedTemplate, sections, language]);
  
  const handleEnhanceCV = useCallback(async (file: File) => {
    setIsEnhancing(true);
    setError(null);
    setEnhancedPreviewMd('');
    try {
        const result = await parseAndEnhanceCVFromFile(file, language);
        const processedData: CVData = {
            ...result,
            experience: result.experience.map(exp => ({ ...exp, id: crypto.randomUUID() })),
            education: result.education.map(edu => ({ ...edu, id: crypto.randomUUID() })),
            projects: result.projects.map(proj => ({...proj, id: crypto.randomUUID()})),
            certifications: result.certifications.map(cert => ({...cert, id: crypto.randomUUID()})),
            videoUrl: result.videoUrl || '',
        };
        setPendingEnhancedData(processedData);

        const markdownPreview = await generateCV(processedData, 'modern', ['personal', 'experience', 'education', 'skills', 'projects', 'certifications', 'video', 'professionalNarrative'], language);
        setEnhancedPreviewMd(markdownPreview);
        setShowEnhancePreviewModal(true);

    } catch (e) {
        setError('Failed to parse and enhance CV. The AI could not understand the format. Please try again with a different file.');
        console.error(e);
    } finally {
        setIsEnhancing(false);
    }
  }, [language]);

  const handleAcceptEnhancement = () => {
    if (pendingEnhancedData) {
        loadCVData(pendingEnhancedData);
    }
    setShowEnhancePreviewModal(false);
    setPendingEnhancedData(null);
    setEnhancedPreviewMd('');
  };

  const handleCancelEnhancement = () => {
    setShowEnhancePreviewModal(false);
    setPendingEnhancedData(null);
    setEnhancedPreviewMd('');
  };


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
                <SparklesIcon className="w-8 h-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI CV Editor</h1>
                <SaveStatusIndicator status={saveStatus} />
            </div>
            <div className="flex items-center space-x-4">
                <LanguageSelector selectedLanguage={language} onLanguageChange={setLanguage} />
                <a href="https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/applications/web" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                    <GithubIcon className="w-7 h-7" />
                </a>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <CVForm
          cvData={cvData}
          onPersonalChange={updatePersonal}
          onAddExperience={addExperience}
          onUpdateExperience={updateExperience}
          onRemoveExperience={removeExperience}
          onReorderExperience={reorderExperience}
          onAddEducation={addEducation}
          onUpdateEducation={updateEducation}
          onRemoveEducation={removeEducation}
          onReorderEducation={reorderEducation}
          onSkillsChange={updateSkills}
          onAddProject={addProject}
          onUpdateProject={updateProject}
          onRemoveProject={removeProject}
          onReorderProject={reorderProject}
          onAddCertification={addCertification}
          onUpdateCertification={updateCertification}
          onRemoveCertification={removeCertification}
          onReorderCertification={reorderCertification}
          onProfessionalNarrativeChange={updateProfessionalNarrative}
          onVideoUrlChange={updateVideoUrl}
          sections={sections}
          onSectionOrderChange={setSections}
          onEnhanceCV={handleEnhanceCV}
          isEnhancing={isEnhancing}
        />
        <CVPreview 
          markdownContent={generatedMd} 
          isLoading={isLoading} 
          error={error}
          selectedTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
          onGenerate={handleGenerateCV}
          videoUrl={cvData.videoUrl}
        />
      </main>

      <EnhancePreviewModal
        isOpen={showEnhancePreviewModal}
        markdownContent={enhancedPreviewMd}
        onAccept={handleAcceptEnhancement}
        onCancel={handleCancelEnhancement}
      />
    </div>
  );
};

export default App;
