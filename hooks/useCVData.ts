
import { useState } from 'react';
import { CVData, PersonalDetails, Experience, Education } from '../types';

const initialCVData: CVData = {
  personal: {
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '123-456-7890',
    address: '123 Main St, Anytown, USA',
    linkedin: 'linkedin.com/in/janedoe',
    website: 'janedoe.com',
  },
  experience: [
    {
      id: crypto.randomUUID(),
      jobTitle: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      location: 'San Francisco, CA',
      startDate: '2020-01',
      endDate: 'Present',
      responsibilities: '- Led development of a new client-facing web application.\n- Mentored junior engineers.\n- Improved application performance by 20%.',
    },
  ],
  education: [
    {
      id: crypto.randomUUID(),
      degree: 'B.S. in Computer Science',
      institution: 'State University',
      location: 'Anytown, USA',
      startDate: '2016-08',
      endDate: '2020-05',
      details: 'GPA: 3.8, Magna Cum Laude',
    },
  ],
  skills: 'React, TypeScript, Node.js, Python, AWS, Docker, SQL',
};

export const useCVData = () => {
  const [cvData, setCvData] = useState<CVData>(initialCVData);

  const updatePersonal = (field: keyof PersonalDetails, value: string) => {
    setCvData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: crypto.randomUUID(),
          jobTitle: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          responsibilities: '',
        },
      ],
    }));
  };

  const updateExperience = (id: string, field: keyof Omit<Experience, 'id'>, value: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp),
    }));
  };

  const removeExperience = (id: string) => {
    setCvData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  };
  
  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: crypto.randomUUID(),
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          details: '',
        },
      ],
    }));
  };

  const updateEducation = (id: string, field: keyof Omit<Education, 'id'>, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu),
    }));
  };

  const removeEducation = (id: string) => {
    setCvData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  };

  const updateSkills = (value: string) => {
    setCvData(prev => ({ ...prev, skills: value }));
  };

  return {
    cvData,
    updatePersonal,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    updateSkills,
  };
};
