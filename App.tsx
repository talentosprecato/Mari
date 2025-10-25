
import React, { useState, useCallback } from 'react';
import { CVForm } from './components/CVForm';
import { CVPreview } from './components/CVPreview';
import { useCVData } from './hooks/useCVData';
import { generateCV } from './services/geminiService';
import { CVData } from './types';
import { GithubIcon, SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const { cvData, updatePersonal, addExperience, updateExperience, removeExperience, addEducation, updateEducation, removeEducation, updateSkills } = useCVData();
  const [generatedMd, setGeneratedMd] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');

  const handleGenerateCV = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const markdown = await generateCV(cvData as CVData, selectedTemplate);
      setGeneratedMd(markdown);
    } catch (e) {
      setError('Failed to generate CV. Please check your API key and try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [cvData, selectedTemplate]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
                <SparklesIcon className="w-8 h-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI CV Editor</h1>
            </div>
            <a href="https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/applications/web" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                <GithubIcon className="w-7 h-7" />
            </a>
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
          onAddEducation={addEducation}
          onUpdateEducation={updateEducation}
          onRemoveEducation={removeEducation}
          onSkillsChange={updateSkills}
          onGenerate={handleGenerateCV}
          isLoading={isLoading}
        />
        <CVPreview 
          markdownContent={generatedMd} 
          isLoading={isLoading} 
          error={error}
          selectedTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
        />
      </main>
    </div>
  );
};

export default App;
