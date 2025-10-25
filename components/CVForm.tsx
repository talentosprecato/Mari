
import React from 'react';
import { CVData, PersonalDetails, Experience, Education } from '../types';
import { PlusIcon, TrashIcon, SparklesIcon } from './icons';

interface CVFormProps {
  cvData: CVData;
  onPersonalChange: (field: keyof PersonalDetails, value: string) => void;
  onAddExperience: () => void;
  onUpdateExperience: (id: string, field: keyof Omit<Experience, 'id'>, value: string) => void;
  onRemoveExperience: (id: string) => void;
  onAddEducation: () => void;
  onUpdateEducation: (id: string, field: keyof Omit<Education, 'id'>, value: string) => void;
  onRemoveEducation: (id: string) => void;
  onSkillsChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">{title}</h3>
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
  onAddEducation,
  onUpdateEducation,
  onRemoveEducation,
  onSkillsChange,
  onGenerate,
  isLoading,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-8 sticky top-24">
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

      <Section title="Work Experience">
        {cvData.experience.map((exp, index) => (
          <div key={exp.id} className="p-4 border rounded-md space-y-4 relative">
             <button
              onClick={() => onRemoveExperience(exp.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <Input label="Job Title" value={exp.jobTitle} onChange={(e) => onUpdateExperience(exp.id, 'jobTitle', e.target.value)} />
            <Input label="Company" value={exp.company} onChange={(e) => onUpdateExperience(exp.id, 'company', e.target.value)} />
            <Input label="Location" value={exp.location} onChange={(e) => onUpdateExperience(exp.id, 'location', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" type="month" value={exp.startDate} onChange={(e) => onUpdateExperience(exp.id, 'startDate', e.target.value)} />
                <Input label="End Date" type="month" value={exp.endDate} onChange={(e) => onUpdateExperience(exp.id, 'endDate', e.target.value)} />
            </div>
            <Textarea label="Responsibilities" value={exp.responsibilities} onChange={(e) => onUpdateExperience(exp.id, 'responsibilities', e.target.value)} />
          </div>
        ))}
        <button onClick={onAddExperience} className="w-full flex items-center justify-center py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <PlusIcon className="w-5 h-5 mr-2" /> Add Experience
        </button>
      </Section>
      
      <Section title="Education">
        {cvData.education.map((edu, index) => (
          <div key={edu.id} className="p-4 border rounded-md space-y-4 relative">
            <button
              onClick={() => onRemoveEducation(edu.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <Input label="Degree / Certificate" value={edu.degree} onChange={(e) => onUpdateEducation(edu.id, 'degree', e.target.value)} />
            <Input label="Institution" value={edu.institution} onChange={(e) => onUpdateEducation(edu.id, 'institution', e.target.value)} />
            <Input label="Location" value={edu.location} onChange={(e) => onUpdateEducation(edu.id, 'location', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" type="month" value={edu.startDate} onChange={(e) => onUpdateEducation(edu.id, 'startDate', e.target.value)} />
                <Input label="End Date" type="month" value={edu.endDate} onChange={(e) => onUpdateEducation(edu.id, 'endDate', e.target.value)} />
            </div>
            <Input label="Details (e.g., GPA, Honors)" value={edu.details} onChange={(e) => onUpdateEducation(edu.id, 'details', e.target.value)} />
          </div>
        ))}
         <button onClick={onAddEducation} className="w-full flex items-center justify-center py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <PlusIcon className="w-5 h-5 mr-2" /> Add Education
        </button>
      </Section>

      <Section title="Skills">
        <Textarea label="List your skills (comma-separated)" value={cvData.skills} onChange={(e) => onSkillsChange(e.target.value)} />
      </Section>

      <div className="pt-4">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Generate CV with AI
            </>
          )}
        </button>
      </div>
    </div>
  );
};
