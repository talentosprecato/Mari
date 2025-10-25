
import React, { useRef, useState, useCallback } from 'react';
import { CVData, PersonalDetails, Experience, Education, SectionId, Project, Certification } from '../types';
import { PlusIcon, TrashIcon, SparklesIcon, DragHandleIcon, UploadIcon, FileIcon, XCircleIcon, RecordIcon, VideoPlusIcon, CameraIcon, BriefcaseIcon } from './icons';
import { VideoRecorderModal } from './VideoRecorderModal';

interface CVFormProps {
  cvData: CVData;
  onPersonalChange: (field: keyof Omit<PersonalDetails, 'photo'>, value: string) => void;
  onPhotoChange: (base64: string) => void;
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
  onOpenJobModal: () => void;
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

const renderVideoPreview = (url: string) => {
    if (!url) return null;

    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
        const videoId = youtubeMatch[1];
        return (
            <iframe
              className='max-h-full max-w-full rounded-md shadow-inner w-full h-full'
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded YouTube Video"
            ></iframe>
        );
    }
    
    if (url.startsWith('blob:') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg')) {
        return <video key={url} controls src={url} className='max-h-full max-w-full rounded-md shadow-inner'></video>;
    }

    // Fallback for other URLs
    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4 rounded-md">
            <div className='text-center'>
                <p className="text-sm text-gray-700">Video link added:</p>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">{url}</a>
            </div>
        </div>
    );
};


export const CVForm: React.FC<CVFormProps> = ({
  cvData,
  onPersonalChange,
  onPhotoChange,
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
  onOpenJobModal,
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
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [isVideoRecorderOpen, setIsVideoRecorderOpen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');


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
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            setVideoError('File size should not exceed 50MB.');
            return;
        }
        setVideoError(null);
        const url = URL.createObjectURL(file);
        onVideoUrlChange(url);
    }
  };
  
  const handleVideoUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrlInput(e.target.value);
  };
  
  const handleVideoUrlInputBlur = () => {
    if(videoUrlInput) {
        onVideoUrlChange(videoUrlInput);
    }
  };
  
  const handleVideoSave = (videoBlob: Blob) => {
    const url = URL.createObjectURL(videoBlob);
    onVideoUrlChange(url);
    setIsVideoRecorderOpen(false);
  };


  const sectionsMap: Record<SectionId, React.ReactNode> = {
    personal: (
      <Section title="Personal Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" value={cvData.personal.fullName} onChange={(e) => onPersonalChange('fullName', e.target.value)} />
            <Input label="Email" type="email" value={cvData.personal.email} onChange={(e) => onPersonalChange('email', e.target.value)} />
            <Input label="Phone" type="tel" value={cvData.personal.phone} onChange={(e) => onPersonalChange('phone', e.target.value)} />
            <Input label="Address" value={cvData.personal.address} onChange={(e) => onPersonalChange('address', e.target.value)} />
            <Input label="LinkedIn Profile URL" value={cvData.personal.linkedin} onChange={(e) => onPersonalChange('linkedin', e.target.value)} />
            <Input label="Website/Portfolio URL" value={cvData.personal.website} onChange={(e) => onPersonalChange('website', e.target.value)} />
        </div>
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
            <div className="flex items-center space-x-4">
                {cvData.personal.photo ? (
                    <img src={cvData.personal.photo} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <CameraIcon className="w-8 h-8" />
                    </div>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoChange} ref={photoInputRef} className="hidden" />
                <button
                    onClick={() => photoInputRef.current?.click()}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    {cvData.personal.photo ? 'Change Photo' : 'Upload Photo'}
                </button>
                 {cvData.personal.photo && (
                    <button onClick={() => onPhotoChange('')} className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                )}
            </div>
        </div>
      </Section>
    ),
    experience: (
      <Section title="Work Experience">
        <div className="space-y-4">
          {cvData.experience.map((exp, index) => (
            <div key={exp.id} 
                draggable 
                onDragStart={(e) => expDragHandlers.onDragStart(e, index)}
                onDragEnter={(e) => expDragHandlers.onDragEnter(e, index)}
                onDragEnd={expDragHandlers.onDragEnd}
                onDrop={expDragHandlers.onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="p-4 border rounded-md bg-gray-50/50"
            >
              <div className="flex justify-between items-start mb-2">
                  <div className='flex items-center gap-2'>
                    <div className="cursor-grab active:cursor-grabbing text-gray-400">
                        <DragHandleIcon className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-md text-gray-800">{exp.jobTitle || 'New Position'}</h4>
                  </div>
                <button onClick={() => onRemoveExperience(exp.id)} className="text-gray-400 hover:text-red-500">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Job Title" value={exp.jobTitle} onChange={(e) => onUpdateExperience(exp.id, 'jobTitle', e.target.value)} />
                <Input label="Company" value={exp.company} onChange={(e) => onUpdateExperience(exp.id, 'company', e.target.value)} />
                <Input label="Location" value={exp.location} onChange={(e) => onUpdateExperience(exp.id, 'location', e.target.value)} />
                <div className="flex space-x-2">
                    <Input label="Start Date" type="month" value={exp.startDate} onChange={(e) => onUpdateExperience(exp.id, 'startDate', e.target.value)} />
                    <Input label="End Date" type="month" value={exp.endDate} onChange={(e) => onUpdateExperience(exp.id, 'endDate', e.target.value)} />
                </div>
              </div>
              <div className="mt-4">
                <Textarea label="Responsibilities" value={exp.responsibilities} onChange={(e) => onUpdateExperience(exp.id, 'responsibilities', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
        <button onClick={onAddExperience} className="mt-4 flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
          <PlusIcon className="w-5 h-5" />
          <span>Add Experience</span>
        </button>
      </Section>
    ),
    education: (
      <Section title="Education">
        <div className="space-y-4">
          {cvData.education.map((edu, index) => (
             <div key={edu.id} 
                draggable 
                onDragStart={(e) => eduDragHandlers.onDragStart(e, index)}
                onDragEnter={(e) => eduDragHandlers.onDragEnter(e, index)}
                onDragEnd={eduDragHandlers.onDragEnd}
                onDrop={eduDragHandlers.onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="p-4 border rounded-md bg-gray-50/50"
             >
                <div className="flex justify-between items-start mb-2">
                  <div className='flex items-center gap-2'>
                      <div className="cursor-grab active:cursor-grabbing text-gray-400">
                          <DragHandleIcon className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-md text-gray-800">{edu.degree || 'New Education'}</h4>
                  </div>
                  <button onClick={() => onRemoveEducation(edu.id)} className="text-gray-400 hover:text-red-500">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Degree / Qualification" value={edu.degree} onChange={(e) => onUpdateEducation(edu.id, 'degree', e.target.value)} />
                  <Input label="Institution" value={edu.institution} onChange={(e) => onUpdateEducation(edu.id, 'institution', e.target.value)} />
                  <Input label="Location" value={edu.location} onChange={(e) => onUpdateEducation(edu.id, 'location', e.target.value)} />
                  <div className="flex space-x-2">
                    <Input label="Start Date" type="month" value={edu.startDate} onChange={(e) => onUpdateEducation(edu.id, 'startDate', e.target.value)} />
                    <Input label="End Date" type="month" value={edu.endDate} onChange={(e) => onUpdateEducation(edu.id, 'endDate', e.target.value)} />
                   </div>
                </div>
                <div className="mt-4">
                    <Input label="Details (e.g., GPA, Honors)" value={edu.details} onChange={(e) => onUpdateEducation(edu.id, 'details', e.target.value)} />
                </div>
            </div>
          ))}
        </div>
        <button onClick={onAddEducation} className="mt-4 flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
          <PlusIcon className="w-5 h-5" />
          <span>Add Education</span>
        </button>
      </Section>
    ),
    skills: (
      <Section title="Skills">
        <Textarea label="Skills (comma-separated)" value={cvData.skills} onChange={(e) => onSkillsChange(e.target.value)} />
      </Section>
    ),
    projects: (
        <Section title="Projects">
            <div className="space-y-4">
                {cvData.projects.map((proj, index) => (
                    <div key={proj.id}
                        draggable
                        onDragStart={(e) => projDragHandlers.onDragStart(e, index)}
                        onDragEnter={(e) => projDragHandlers.onDragEnter(e, index)}
                        onDragEnd={projDragHandlers.onDragEnd}
                        onDrop={projDragHandlers.onDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="p-4 border rounded-md bg-gray-50/50"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className='flex items-center gap-2'>
                                <div className="cursor-grab active:cursor-grabbing text-gray-400">
                                    <DragHandleIcon className="w-5 h-5" />
                                </div>
                                <h4 className="font-semibold text-md text-gray-800">{proj.name || 'New Project'}</h4>
                            </div>
                            <button onClick={() => onRemoveProject(proj.id)} className="text-gray-400 hover:text-red-500">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Project Name" value={proj.name} onChange={(e) => onUpdateProject(proj.id, 'name', e.target.value)} />
                            <Input label="Technologies Used" value={proj.technologies} onChange={(e) => onUpdateProject(proj.id, 'technologies', e.target.value)} />
                        </div>
                         <div className="mt-4">
                            <Input label="Project Link" value={proj.link} onChange={(e) => onUpdateProject(proj.id, 'link', e.target.value)} />
                        </div>
                        <div className="mt-4">
                            <Textarea label="Description" value={proj.description} onChange={(e) => onUpdateProject(proj.id, 'description', e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onAddProject} className="mt-4 flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                <PlusIcon className="w-5 h-5" />
                <span>Add Project</span>
            </button>
        </Section>
    ),
    certifications: (
        <Section title="Certifications">
            <div className="space-y-4">
                {cvData.certifications.map((cert, index) => (
                    <div key={cert.id}
                        draggable
                        onDragStart={(e) => certDragHandlers.onDragStart(e, index)}
                        onDragEnter={(e) => certDragHandlers.onDragEnter(e, index)}
                        onDragEnd={certDragHandlers.onDragEnd}
                        onDrop={certDragHandlers.onDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="p-4 border rounded-md bg-gray-50/50"
                    >
                        <div className="flex justify-between items-start mb-2">
                             <div className='flex items-center gap-2'>
                                <div className="cursor-grab active:cursor-grabbing text-gray-400">
                                    <DragHandleIcon className="w-5 h-5" />
                                </div>
                                <h4 className="font-semibold text-md text-gray-800">{cert.name || 'New Certification'}</h4>
                            </div>
                            <button onClick={() => onRemoveCertification(cert.id)} className="text-gray-400 hover:text-red-500">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Certification Name" value={cert.name} onChange={(e) => onUpdateCertification(cert.id, 'name', e.target.value)} />
                            <Input label="Issuing Organization" value={cert.issuingOrganization} onChange={(e) => onUpdateCertification(cert.id, 'issuingOrganization', e.target.value)} />
                        </div>
                         <div className="mt-4">
                            <Input label="Date" type="month" value={cert.date} onChange={(e) => onUpdateCertification(cert.id, 'date', e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onAddCertification} className="mt-4 flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                <PlusIcon className="w-5 h-5" />
                <span>Add Certification</span>
            </button>
        </Section>
    ),
    professionalNarrative: (
        <Section title="Professional Narrative">
            <Textarea 
                label="What has made you the professional you are today?" 
                value={cvData.professionalNarrative} 
                onChange={(e) => onProfessionalNarrativeChange(e.target.value)} 
                rows={6}
            />
        </Section>
    ),
    video: (
      <Section title="Video Presentation">
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-start'>
            <div className='space-y-4'>
                <p className='text-sm text-gray-600'>Add a short video introduction to make your application stand out. You can record a new video, upload a file, or paste a link from services like YouTube or Loom.</p>
                {/* FIX: The Input component requires a 'label' prop. The separate <label> was incorrect. */}
                <Input 
                    label="Video Link"
                    type="url"
                    placeholder="e.g., https://www.youtube.com/watch?v=..."
                    value={videoUrlInput}
                    onChange={handleVideoUrlInputChange}
                    onBlur={handleVideoUrlInputBlur}
                 />
                 <div className="relative flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">Or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <div className='flex items-center space-x-3'>
                    <button onClick={() => setIsVideoRecorderOpen(true)} className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <RecordIcon className="w-5 h-5" />
                        <span>Record Video</span>
                    </button>
                    <input type="file" accept="video/*" onChange={handleVideoFileChange} ref={videoInputRef} className="hidden" />
                    <button onClick={() => videoInputRef.current?.click()} className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <VideoPlusIcon className="w-5 h-5" />
                        <span>Upload File</span>
                    </button>
                </div>
                {videoError && <p className="text-sm text-red-600">{videoError}</p>}
            </div>
            <div className='w-full aspect-video bg-gray-100 rounded-md overflow-hidden'>
                {renderVideoPreview(cvData.videoUrl)}
            </div>
        </div>
      </Section>
    ),
    jobSearch: (
      <Section title="Job Opportunity Finder">
        <p className="text-sm text-gray-600 mb-4">Launch the job finder to discover relevant opportunities based on your CV and target locations.</p>
        <button
            onClick={onOpenJobModal}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
            <BriefcaseIcon className="w-5 h-5 mr-2" />
            Launch Job Finder
        </button>
      </Section>
    )
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-md border space-y-3">
        <div className="flex items-center space-x-2">
            <SparklesIcon className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-semibold text-gray-800">Enhance with AI</h3>
        </div>
        <p className="text-sm text-gray-600">Have an existing CV? Upload a PDF, DOCX, or text file, and let AI parse and populate the form for you.</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
             <div className="flex-1">
                <label htmlFor="file-upload" className="sr-only">Choose file</label>
                <div className="flex rounded-md shadow-sm">
                    <div 
                        onClick={() => fileInputRef.current?.click()} 
                        className="px-3 inline-flex items-center border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md cursor-pointer hover:bg-gray-100"
                    >
                        <UploadIcon className="w-5 h-5 mr-2" />
                        Browse
                    </div>
                    <div className="relative flex-1">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" className="sr-only" id="file-upload" />
                        <div className="block w-full px-3 py-2 border border-gray-300 rounded-r-md text-sm text-gray-700 truncate">
                            {selectedFile ? (
                                <span className='flex items-center'>
                                    <FileIcon className='w-4 h-4 mr-2 text-gray-500' />
                                    {selectedFile.name}
                                </span>
                            ) : "No file selected"}
                        </div>
                         {selectedFile && (
                            <button onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <button
                onClick={handleEnhanceClick}
                disabled={!selectedFile || isEnhancing}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
                {isEnhancing ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Enhancing...
                    </>
                ) : "Enhance"}
            </button>
        </div>
      </div>

      {sections.map((sectionId, index) => (
        <div
          key={sectionId}
          draggable
          onDragStart={(e) => handleSectionDragStart(e, index)}
          onDragEnter={(e) => handleSectionDragEnter(e, index)}
          onDragEnd={handleSectionDragEnd}
          onDrop={handleSectionDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`transition-opacity ${isSectionDragging && sectionDragItem.current === index ? 'opacity-30' : 'opacity-100'}`}
        >
          {sectionsMap[sectionId]}
        </div>
      ))}
      <VideoRecorderModal
        isOpen={isVideoRecorderOpen}
        onClose={() => setIsVideoRecorderOpen(false)}
        onSave={handleVideoSave}
        cvData={cvData}
        language={language}
      />
    </div>
  );
};
