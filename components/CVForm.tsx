
import React, { useRef, useState, useCallback } from 'react';
import { CVData, PersonalDetails, Experience, Education, SectionId, Project, Certification } from '../types';
import { PlusIcon, TrashIcon, SparklesIcon, DragHandleIcon, UploadIcon, FileIcon, XCircleIcon, RecordIcon, VideoPlusIcon } from './icons';
import { VideoRecorderModal } from './VideoRecorderModal';

interface CVFormProps {
  cvData: CVData;
  onPersonalChange: (field: keyof PersonalDetails, value: string) => void;
  onAddExperience: () => void;
  onUpdateExperience: (id: string, field: keyof Omit<Experience, 'id'>, value: string) => void;
  onRemoveExperience: (id: string) => void;
  onReorderExperience: (startIndex: number, endIndex: number) => void;
  onAddEducation: () => void;
  onUpdateEducation: (id: string, field: keyof Omit<Education, 'id'>, value: string) => void;
  onRemoveEducation: (id: string) => void;
  onReorderEducation: (startIndex: number, endIndex: number) => void;
  onSkillsChange: (value: string) => void;
  onAddProject: () => void;
  onUpdateProject: (id: string, field: keyof Omit<Project, 'id'>, value: string) => void;
  onRemoveProject: (id: string) => void;
  onReorderProject: (startIndex: number, endIndex: number) => void;
  onAddCertification: () => void;
  onUpdateCertification: (id: string, field: keyof Omit<Certification, 'id'>, value: string) => void;
  onRemoveCertification: (id: string) => void;
  onReorderCertification: (startIndex: number, endIndex: number) => void;
  onProfessionalNarrativeChange: (value: string) => void;
  onVideoUrlChange: (url: string) => void;
  sections: SectionId[];
  onSectionOrderChange: (sections: SectionId[]) => void;
  onEnhanceCV: (file: File) => void;
  isEnhancing: boolean;
  language: string;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4 bg-white p-4 rounded-md border">
    <div className="flex items-center justify-between border-b pb-2 cursor-grab active:cursor-grabbing">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <DragHandleIcon className="w-6 h-6 text-gray-400" />
    </div>
    {children}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      {...props}
      rows={4}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>
);

export const CVForm: React.FC<CVFormProps> = ({
  cvData,
  onPersonalChange,
  onAddExperience,
  onUpdateExperience,
  onRemoveExperience,
  onReorderExperience,
  onAddEducation,
  onUpdateEducation,
  onRemoveEducation,
  onReorderEducation,
  onSkillsChange,
  onAddProject,
  onUpdateProject,
  onRemoveProject,
  onReorderProject,
  onAddCertification,
  onUpdateCertification,
  onRemoveCertification,
  onReorderCertification,
  onProfessionalNarrativeChange,
  onVideoUrlChange,
  sections,
  onSectionOrderChange,
  onEnhanceCV,
  isEnhancing,
  language,
}) => {
  const sectionDragItem = useRef<number | null>(null);
  const sectionDragOverItem = useRef<number | null>(null);
  const [isSectionDragging, setIsSectionDragging] = useState(false);
  
  const expDragItem = useRef<number | null>(null);
  const expDragOverItem = useRef<number | null>(null);
  
  const eduDragItem = useRef<number | null>(null);
  const eduDragOverItem = useRef<number | null>(null);

  const projDragItem = useRef<number | null>(null);
  const projDragOverItem = useRef<number | null>(null);

  const certDragItem = useRef<number | null>(null);
  const certDragOverItem = useRef<number | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [isVideoRecorderOpen, setIsVideoRecorderOpen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        setSelectedFile(event.target.files[0]);
    }
  };

  const handleEnhanceClick = () => {
    if (selectedFile) {
        onEnhanceCV(selectedFile);
    }
  };

  const handleSectionDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    sectionDragItem.current = position;
    setIsSectionDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragEnter = (_e: React.DragEvent<HTMLDivElement>, position: number) => {
    sectionDragOverItem.current = position;
  };
  
  const handleSectionDrop = () => {
    if (sectionDragItem.current === null || sectionDragOverItem.current === null) return;
    const newSections = [...sections];
    const dragItemContent = newSections[sectionDragItem.current];
    newSections.splice(sectionDragItem.current, 1);
    newSections.splice(sectionDragOverItem.current, 0, dragItemContent);
    onSectionOrderChange(newSections);
  };
  
  const handleSectionDragEnd = () => {
    sectionDragItem.current = null;
    sectionDragOverItem.current = null;
    setIsSectionDragging(false);
  };

  const createDragHandlers = (
    itemRef: React.MutableRefObject<number | null>,
    overItemRef: React.MutableRefObject<number | null>,
    reorderFn: (start: number, end: number) => void
  ) => ({
    onDragStart: (e: React.DragEvent<HTMLDivElement>, position: number) => {
        itemRef.current = position;
        e.dataTransfer.effectAllowed = 'move';
    },
    onDragEnter: (_e: React.DragEvent<HTMLDivElement>, position: number) => {
        overItemRef.current = position;
    },
    onDrop: () => {
        if (itemRef.current !== null && overItemRef.current !== null) {
            reorderFn(itemRef.current, overItemRef.current);
        }
        itemRef.current = null;
        overItemRef.current = null;
    },
    onDragEnd: () => {
        itemRef.current = null;
        overItemRef.current = null;
    },
  });

  const expDragHandlers = createDragHandlers(expDragItem, expDragOverItem, onReorderExperience);
  const eduDragHandlers = createDragHandlers(eduDragItem, eduDragOverItem, onReorderEducation);
  const projDragHandlers = createDragHandlers(projDragItem, projDragOverItem, onReorderProject);
  const certDragHandlers = createDragHandlers(certDragItem, certDragOverItem, onReorderCertification);

  const handleVideoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setVideoError(null);
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 40) {
            setVideoError('Video must be 40 seconds or less.');
        } else {
            const videoUrl = URL.createObjectURL(file);
            onVideoUrlChange(videoUrl);
        }
    };

    video.onerror = () => {
        setVideoError('Could not load video metadata. The file might be corrupted or in an unsupported format.');
        if (video.src) {
          window.URL.revokeObjectURL(video.src);
        }
    };
    
    video.src = URL.createObjectURL(file);
    event.target.value = ''; // Reset file input
  }, [onVideoUrlChange]);

  const handleSaveRecordedVideo = (videoBlob: Blob) => {
    const videoUrl = URL.createObjectURL(videoBlob);
    onVideoUrlChange(videoUrl);
    setIsVideoRecorderOpen(false);
  };

  const sectionComponents: Record<SectionId, React.ReactNode> = {
    personal: (
      <Section title="Personal Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" value={cvData.personal.fullName} onChange={(e) => onPersonalChange('fullName', e.target.value)} />
          <Input label="Email" type="email" value={cvData.personal.email} onChange={(e) => onPersonalChange('email', e.target.value)} />
          <Input label="Phone" value={cvData.personal.phone} onChange={(e) => onPersonalChange('phone', e.target.value)} />
          <Input label="Address" value={cvData.personal.address} onChange={(e) => onPersonalChange('address', e.target.value)} />
          <Input label="LinkedIn Profile URL" value={cvData.personal.linkedin} onChange={(e) => onPersonalChange('linkedin', e.target.value)} />
          <Input label="Website/Portfolio URL" value={cvData.personal.website} onChange={(e) => onPersonalChange('website', e.target.value)} />
        </div>
      </Section>
    ),
    experience: (
      <Section title="Work Experience">
        {cvData.experience.map((exp, index) => (
          <div key={exp.id} 
            draggable
            onDragStart={(e) => expDragHandlers.onDragStart(e, index)}
            onDragEnter={(e) => expDragHandlers.onDragEnter(e, index)}
            onDrop={expDragHandlers.onDrop}
            onDragEnd={expDragHandlers.onDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="p-4 border rounded-md space-y-4 relative bg-gray-50/50">
                <div className="absolute top-2 right-2 flex items-center space-x-2">
                    <div className="cursor-grab active:cursor-grabbing text-gray-400">
                        <DragHandleIcon className="w-5 h-5" />
                    </div>
                    <button onClick={() => onRemoveExperience(exp.id)} className="text-gray-400 hover:text-red-500">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
                <Input label="Job Title" value={exp.jobTitle} onChange={(e) => onUpdateExperience(exp.id, 'jobTitle', e.target.value)} />
                <Input label="Company" value={exp.company} onChange={(e) => onUpdateExperience(exp.id, 'company', e.target.value)} />
                <Input label="Location" value={exp.location} onChange={(e) => onUpdateExperience(exp.id, 'location', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Start Date" type="month" value={exp.startDate} onChange={(e) => onUpdateExperience(exp.id, 'startDate', e.target.value)} />
                    <Input label="End Date" type="month" value={exp.endDate} onChange={(e) => onUpdateExperience(exp.id, 'endDate', e.target.value)} />
                </div>
                <Textarea label="Responsibilities" value={exp.responsibilities} onChange={(e) => onUpdateExperience(exp.id, 'responsibilities', e.target.value)} />
            </div>
          </div>
        ))}
        <button onClick={onAddExperience} className="w-full flex items-center justify-center py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <PlusIcon className="w-5 h-5 mr-2" /> Add Experience
        </button>
      </Section>
    ),
    education: (
      <Section title="Education">
        {cvData.education.map((edu, index) => (
          <div key={edu.id}
            draggable
            onDragStart={(e) => eduDragHandlers.onDragStart(e, index)}
            onDragEnter={(e) => eduDragHandlers.onDragEnter(e, index)}
            onDrop={eduDragHandlers.onDrop}
            onDragEnd={eduDragHandlers.onDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="p-4 border rounded-md space-y-4 relative bg-gray-50/50">
                <div className="absolute top-2 right-2 flex items-center space-x-2">
                    <div className="cursor-grab active:cursor-grabbing text-gray-400">
                        <DragHandleIcon className="w-5 h-5" />
                    </div>
                    <button onClick={() => onRemoveEducation(edu.id)} className="text-gray-400 hover:text-red-500">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
                <Input label="Degree / Certificate" value={edu.degree} onChange={(e) => onUpdateEducation(edu.id, 'degree', e.target.value)} />
                <Input label="Institution" value={edu.institution} onChange={(e) => onUpdateEducation(edu.id, 'institution', e.target.value)} />
                <Input label="Location" value={edu.location} onChange={(e) => onUpdateEducation(edu.id, 'location', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Start Date" type="month" value={edu.startDate} onChange={(e) => onUpdateEducation(edu.id, 'startDate', e.target.value)} />
                    <Input label="End Date" type="month" value={edu.endDate} onChange={(e) => onUpdateEducation(edu.id, 'endDate', e.target.value)} />
                </div>
                <Input label="Details (e.g., GPA, Honors)" value={edu.details} onChange={(e) => onUpdateEducation(edu.id, 'details', e.target.value)} />
            </div>
          </div>
        ))}
         <button onClick={onAddEducation} className="w-full flex items-center justify-center py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <PlusIcon className="w-5 h-5 mr-2" /> Add Education
        </button>
      </Section>
    ),
    skills: (
      <Section title="Skills">
        <Textarea label="List your skills (comma-separated)" value={cvData.skills} onChange={(e) => onSkillsChange(e.target.value)} />
      </Section>
    ),
    projects: (
        <Section title="Projects">
          {cvData.projects.map((proj, index) => (
            <div key={proj.id} 
              draggable
              onDragStart={(e) => projDragHandlers.onDragStart(e, index)}
              onDragEnter={(e) => projDragHandlers.onDragEnter(e, index)}
              onDrop={projDragHandlers.onDrop}
              onDragEnd={projDragHandlers.onDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="p-4 border rounded-md space-y-4 relative bg-gray-50/50">
                  <div className="absolute top-2 right-2 flex items-center space-x-2">
                      <div className="cursor-grab active:cursor-grabbing text-gray-400">
                          <DragHandleIcon className="w-5 h-5" />
                      </div>
                      <button onClick={() => onRemoveProject(proj.id)} className="text-gray-400 hover:text-red-500">
                          <TrashIcon className="w-5 h-5" />
                      </button>
                  </div>
                  <Input label="Project Name" value={proj.name} onChange={(e) => onUpdateProject(proj.id, 'name', e.target.value)} />
                  <Input label="Technologies Used (comma-separated)" value={proj.technologies} onChange={(e) => onUpdateProject(proj.id, 'technologies', e.target.value)} />
                  <Input label="Project Link" value={proj.link} onChange={(e) => onUpdateProject(proj.id, 'link', e.target.value)} />
                  <Textarea label="Description" value={proj.description} onChange={(e) => onUpdateProject(proj.id, 'description', e.target.value)} />
              </div>
            </div>
          ))}
          <button onClick={onAddProject} className="w-full flex items-center justify-center py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <PlusIcon className="w-5 h-5 mr-2" /> Add Project
          </button>
        </Section>
      ),
      certifications: (
        <Section title="Certifications">
          {cvData.certifications.map((cert, index) => (
            <div key={cert.id} 
              draggable
              onDragStart={(e) => certDragHandlers.onDragStart(e, index)}
              onDragEnter={(e) => certDragHandlers.onDragEnter(e, index)}
              onDrop={certDragHandlers.onDrop}
              onDragEnd={certDragHandlers.onDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="p-4 border rounded-md space-y-4 relative bg-gray-50/50">
                  <div className="absolute top-2 right-2 flex items-center space-x-2">
                      <div className="cursor-grab active:cursor-grabbing text-gray-400">
                          <DragHandleIcon className="w-5 h-5" />
                      </div>
                      <button onClick={() => onRemoveCertification(cert.id)} className="text-gray-400 hover:text-red-500">
                          <TrashIcon className="w-5 h-5" />
                      </button>
                  </div>
                  <Input label="Certification Name" value={cert.name} onChange={(e) => onUpdateCertification(cert.id, 'name', e.target.value)} />
                  <Input label="Issuing Organization" value={cert.issuingOrganization} onChange={(e) => onUpdateCertification(cert.id, 'issuingOrganization', e.target.value)} />
                  <Input label="Date Issued" type="month" value={cert.date} onChange={(e) => onUpdateCertification(cert.id, 'date', e.target.value)} />
              </div>
            </div>
          ))}
          <button onClick={onAddCertification} className="w-full flex items-center justify-center py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <PlusIcon className="w-5 h-5 mr-2" /> Add Certification
          </button>
        </Section>
      ),
    professionalNarrative: (
      <Section title="Professional Narrative">
        <Textarea 
          label="What has made you the professional you are today / Cosa ti ha reso il professionista che sei oggi" 
          value={cvData.professionalNarrative} 
          onChange={(e) => onProfessionalNarrativeChange(e.target.value)}
          rows={6}
        />
      </Section>
    ),
    video: (
        <Section title="Video Presentation">
            <div className='space-y-4'>
                <p className='text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200'>
                    <strong>Your Video Intro (40s max):</strong> Introduce yourself by briefly covering your main expertise, a key achievement, and your professional passion. You can either record directly or upload an existing video.
                </p>

                {cvData.videoUrl ? (
                    <div className='space-y-3'>
                        <video key={cvData.videoUrl} controls src={cvData.videoUrl} className='w-full rounded-md shadow-inner bg-black'></video>
                        <button onClick={() => onVideoUrlChange('')} className="w-full flex items-center justify-center py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50">
                            <TrashIcon className="w-5 h-5 mr-2" /> Remove Video
                        </button>
                    </div>
                ) : (
                    <div className='text-center'>
                         <input
                            type="file"
                            ref={videoInputRef}
                            onChange={handleVideoUpload}
                            accept="video/*"
                            className="hidden"
                        />
                        <div className='flex space-x-4'>
                             <button onClick={() => setIsVideoRecorderOpen(true)} className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <RecordIcon className="w-5 h-5 mr-2" /> Record Video
                            </button>
                             <button onClick={() => videoInputRef.current?.click()} className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <VideoPlusIcon className="w-5 h-5 mr-2" /> Upload Video
                            </button>
                        </div>
                        {videoError ? (
                           <p className="text-red-500 text-sm mt-2">{videoError}</p>
                        ) : (
                           <p className="text-xs text-gray-500 mt-2">Max 40 seconds.</p>
                        )}
                    </div>
                )}
            </div>
        </Section>
    )
  };

  return (
    <>
    <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
      <div className="space-y-8">
        
        <details className="group border rounded-md" open>
            <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                <h3 className="text-xl font-semibold text-gray-800">Import & Enhance Existing CV</h3>
                <div className="group-open:rotate-45 transform transition-transform">
                    <PlusIcon className="w-6 h-6"/>
                </div>
            </summary>
            <div className="p-4 border-t space-y-4">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                 />
                {!selectedFile ? (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <UploadIcon className="w-8 h-8 text-gray-400 mb-2"/>
                        <span>Click to upload a file</span>
                        <span className="text-xs text-gray-500">PDF or DOCX</span>
                    </button>
                 ) : (
                    <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                        <div className="flex items-center space-x-2 overflow-hidden">
                            <FileIcon className="w-6 h-6 text-gray-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</span>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-red-600">
                           <XCircleIcon className="w-6 h-6"/>
                        </button>
                    </div>
                 )}
                
                <button
                    onClick={handleEnhanceClick}
                    disabled={isEnhancing || !selectedFile}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                     {isEnhancing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Preview...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Enhance with AI
                        </>
                    )}
                </button>
            </div>
        </details>
        
        {sections.map((sectionId, index) => (
          <div
            key={sectionId}
            draggable
            onDragStart={(e) => handleSectionDragStart(e, index)}
            onDragEnter={(e) => handleSectionDragEnter(e, index)}
            onDragEnd={handleSectionDragEnd}
            onDrop={handleSectionDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`transition-opacity ${isSectionDragging && sectionDragItem.current === index ? 'opacity-40' : 'opacity-100'}`}
          >
            {sectionComponents[sectionId]}
          </div>
        ))}
      </div>
    </div>
    <VideoRecorderModal 
        isOpen={isVideoRecorderOpen} 
        onClose={() => setIsVideoRecorderOpen(false)}
        onSave={handleSaveRecordedVideo}
        cvData={cvData}
        language={language}
    />
    </>
  );
};
