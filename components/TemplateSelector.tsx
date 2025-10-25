
import React from 'react';

export interface Template {
  id: string;
  name: string;
  description: string;
  longDescription: string;
}

const templates: Template[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'A clean, professional single-column layout.',
    longDescription: 'Ideal for tech, startups, and modern industries. Features a clean, single-column layout that emphasizes skills and recent achievements. Designed for readability on any device.'
  },
  {
    id: 'two-column-professional',
    name: 'Two-Column Pro',
    description: 'A modern layout with a sidebar for key info.',
    longDescription: 'A professional two-column layout that separates contact details and skills into a sidebar for quick scanning, while giving ample space for detailed experience and education history.'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'A stylish layout for roles in design, marketing, etc.',
    longDescription: 'Perfect for designers, marketers, and creative professionals. This layout uses more visual flair to highlight a portfolio or key projects. Designed to be memorable and stand out.'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'A traditional, formal layout for conservative fields.',
    longDescription: 'Best suited for traditional industries like law, finance, or academia. Follows a formal structure with a clear chronological order, prioritizing professionalism over visual embellishments.'
  },
  {
    id: 'eu-cv',
    name: 'EU CV',
    description: 'A standard, minimal European format.',
    longDescription: 'Follows the standard European CV format. A clean, structured, and comprehensive layout ideal for applications within the EU. Focuses on clarity and detailed information.'
  },
  {
    id: 'ai-content-editor',
    name: 'AI Content Editor',
    description: 'Highlights AI skills and content creation experience.',
    longDescription: 'Tailored for roles in AI content, prompt engineering, and digital strategy. This template emphasizes technical skills alongside creative content portfolios, showcasing a blend of analytical and artistic abilities.'
  },
  {
    id: 'social-media-creative',
    name: 'Social Media Creative',
    description: 'Visually engaging, perfect for social media roles.',
    longDescription: 'A vibrant, visually-driven template for social media managers, content creators, and digital marketers. It\'s designed to highlight engagement metrics, successful campaigns, and platform-specific expertise in a modern, stylish format.'
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Data-dense, for engineering and IT roles.',
    longDescription: 'A clean, information-rich template for technical roles like software engineering. Prioritizes skills, projects, and tools in a highly scannable format.'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Elegant and simple, focusing on typography.',
    longDescription: 'A sophisticated, minimalist design that uses typography and white space to create a polished look. Perfect for roles where clarity and elegance are key.'
  }
];

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (id: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onTemplateChange }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Choose a Template</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="relative group">
            <button
              onClick={() => onTemplateChange(template.id)}
              className={`w-full h-full p-4 border rounded-lg text-left transition-all duration-200 ${
                selectedTemplate === template.id
                  ? 'border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              aria-pressed={selectedTemplate === template.id}
            >
              <p className="font-semibold text-gray-900">{template.name}</p>
              <p className="text-sm text-gray-600">{template.description}</p>
            </button>
            <div 
              role="tooltip"
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-sm text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-20"
            >
              {template.longDescription}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};