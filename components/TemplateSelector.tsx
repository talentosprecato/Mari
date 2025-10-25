
import React from 'react';

export interface Template {
  id: string;
  name: string;
  description: string;
}

const templates: Template[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'A clean, professional single-column layout.',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'A stylish layout for roles in design, marketing, etc.',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'A traditional, formal layout for conservative fields.',
  },
];

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (id: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onTemplateChange }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Choose a Template</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={`p-4 border rounded-lg text-left transition-all duration-200 ${
              selectedTemplate === template.id
                ? 'border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            aria-pressed={selectedTemplate === template.id}
          >
            <p className="font-semibold text-gray-900">{template.name}</p>
            <p className="text-sm text-gray-600">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
