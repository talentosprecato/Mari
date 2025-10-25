
import { useState, useEffect, useCallback, useRef } from 'react';
import { CVData, PersonalDetails, Experience, Education, Project, Certification } from '../types';

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
  projects: [
    {
        id: crypto.randomUUID(),
        name: 'AI CV Editor',
        technologies: 'React, TypeScript, Gemini API, Tailwind CSS',
        link: 'https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/applications/web',
        description: '- Developed a web application that uses AI to generate and enhance professional CVs.\n- Implemented drag-and-drop for section reordering.\n- Integrated Gemini API for content generation and parsing.'
    }
  ],
  certifications: [
    {
        id: crypto.randomUUID(),
        name: 'Google Cloud Certified - Professional Cloud Architect',
        issuingOrganization: 'Google Cloud',
        date: '2022-08',
    }
  ],
  professionalNarrative: 'I am a passionate developer driven by creating elegant and efficient solutions to complex problems. My journey through various projects has taught me the importance of collaboration, continuous learning, and user-centric design.',
};

const LOCAL_STORAGE_KEY = 'ai-cv-editor-data';

export const useCVData = () => {
  const [cvData, setCvData] = useState<CVData>(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Basic validation to ensure the loaded data has the expected structure
        if (parsed.personal && parsed.experience && parsed.education && parsed.projects && parsed.certifications) {
            return { ...initialCVData, ...parsed };
        }
      }
    } catch (error) {
      console.error("Failed to parse CV data from localStorage", error);
    }
    return initialCVData;
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus('saving');
    const handler = setTimeout(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cvData));
            setSaveStatus('saved');
        } catch (error) {
            console.error("Failed to save CV data to localStorage", error);
            setSaveStatus('error');
        }
    }, 1000); // Debounce saves by 1 second

    return () => {
        clearTimeout(handler);
    };
  }, [cvData]);

  // Effect to clear the status message after a couple of seconds
  useEffect(() => {
    if (saveStatus === 'saved' || saveStatus === 'error') {
        const timer = setTimeout(() => {
            setSaveStatus('idle');
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [saveStatus]);
  
  const loadCVData = (newData: CVData) => {
    setCvData(newData);
  };

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
  
  const reorderExperience = useCallback((startIndex: number, endIndex: number) => {
    setCvData(prev => {
        const newExperience = Array.from(prev.experience);
        const [removed] = newExperience.splice(startIndex, 1);
        newExperience.splice(endIndex, 0, removed);
        return { ...prev, experience: newExperience };
    });
  }, []);


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

  const reorderEducation = useCallback((startIndex: number, endIndex: number) => {
    setCvData(prev => {
        const newEducation = Array.from(prev.education);
        const [removed] = newEducation.splice(startIndex, 1);
        newEducation.splice(endIndex, 0, removed);
        return { ...prev, education: newEducation };
    });
  }, []);

  const addProject = () => {
    setCvData(prev => ({
        ...prev,
        projects: [
            ...prev.projects,
            {
                id: crypto.randomUUID(),
                name: '',
                technologies: '',
                link: '',
                description: '',
            },
        ],
    }));
  };

  const updateProject = (id: string, field: keyof Omit<Project, 'id'>, value: string) => {
      setCvData(prev => ({
          ...prev,
          projects: prev.projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj),
      }));
  };

  const removeProject = (id: string) => {
      setCvData(prev => ({ ...prev, projects: prev.projects.filter(proj => proj.id !== id) }));
  };

  const reorderProject = useCallback((startIndex: number, endIndex: number) => {
      setCvData(prev => {
          const newProjects = Array.from(prev.projects);
          const [removed] = newProjects.splice(startIndex, 1);
          newProjects.splice(endIndex, 0, removed);
          return { ...prev, projects: newProjects };
      });
  }, []);

  const addCertification = () => {
      setCvData(prev => ({
          ...prev,
          certifications: [
              ...prev.certifications,
              {
                  id: crypto.randomUUID(),
                  name: '',
                  issuingOrganization: '',
                  date: '',
              },
          ],
      }));
  };

  const updateCertification = (id: string, field: keyof Omit<Certification, 'id'>, value: string) => {
      setCvData(prev => ({
          ...prev,
          certifications: prev.certifications.map(cert => cert.id === id ? { ...cert, [field]: value } : cert),
      }));
  };

  const removeCertification = (id: string) => {
      setCvData(prev => ({ ...prev, certifications: prev.certifications.filter(cert => cert.id !== id) }));
  };

  const reorderCertification = useCallback((startIndex: number, endIndex: number) => {
      setCvData(prev => {
          const newCertifications = Array.from(prev.certifications);
          const [removed] = newCertifications.splice(startIndex, 1);
          newCertifications.splice(endIndex, 0, removed);
          return { ...prev, certifications: newCertifications };
      });
  }, []);


  const updateSkills = (value: string) => {
    setCvData(prev => ({ ...prev, skills: value }));
  };

  const updateProfessionalNarrative = (value: string) => {
    setCvData(prev => ({ ...prev, professionalNarrative: value }));
  };

  return {
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
    addProject,
    updateProject,
    removeProject,
    reorderProject,
    addCertification,
    updateCertification,
    removeCertification,
    reorderCertification,
    updateSkills,
    updateProfessionalNarrative,
  };
};
