
export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  website: string;
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;

  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string;
}

export interface Project {
  id: string;
  name: string;
  technologies: string;
  link: string;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  date: string;
}

export interface CVData {
  personal: PersonalDetails;
  experience: Experience[];
  education: Education[];
  skills: string;
  projects: Project[];
  certifications: Certification[];
  professionalNarrative: string;
  videoUrl: string;
}

export type SectionId = 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'video' | 'professionalNarrative';

export type CVDataFromAI = Omit<CVData, 'experience' | 'education' | 'projects' | 'certifications'> & {
    experience: Omit<Experience, 'id'>[];
    education: Omit<Education, 'id'>[];
    projects: Omit<Project, 'id'>[];
    certifications: Omit<Certification, 'id'>[];
}
