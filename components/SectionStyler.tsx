import React, { useState } from 'react';
import { SectionStyles, SectionStyle, StylableSection, BorderStyle, SpacingStyle } from '../types';
import { BorderIcon, ColorPaletteIcon, SpacingIcon } from './icons';

interface SectionStylerProps {
    styles: SectionStyles;
    onChange: (sectionId: StylableSection, field: keyof SectionStyle, value: string) => void;
}

const sectionNames: Record<StylableSection, string> = {
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certifications: 'Certifications',
    professionalNarrative: 'Professional Narrative',
};

const colors = [
    { name: 'Transparent', value: 'transparent' },
    { name: 'Stone', value: '#f5f5f4' }, // stone-100
    { name: 'Sky', value: '#f0f9ff' }, // sky-50
    { name: 'Slate', value: '#f1f5f9' }, // slate-100
];

const borderOptions: { id: BorderStyle; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'top', label: 'Top' },
    { id: 'bottom', label: 'Bottom' },
    { id: 'full', label: 'Full' },
];

const spacingOptions: { id: SpacingStyle; label: string }[] = [
    { id: 'small', label: 'S' },
    { id: 'medium', label: 'M' },
    { id: 'large', label: 'L' },
];

const SectionControls: React.FC<{
    sectionId: StylableSection,
    style: SectionStyle,
    onChange: (field: keyof SectionStyle, value: string) => void
}> = ({ sectionId, style, onChange }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
            <div>
                <label className="flex items-center text-xs font-medium text-stone-600 mb-1.5">
                    <BorderIcon className="w-4 h-4 mr-1.5" />
                    Border
                </label>
                <div className="flex space-x-1 rounded-md bg-stone-200 p-1">
                    {borderOptions.map(option => (
                        <button
                            key={option.id}
                            onClick={() => onChange('border', option.id)}
                            className={`w-full rounded py-1 text-xs font-semibold transition-colors ${
                                style.border === option.id
                                    ? 'bg-white shadow-sm text-indigo-600'
                                    : 'text-stone-600 hover:bg-stone-300'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                 <label className="flex items-center text-xs font-medium text-stone-600 mb-1.5">
                    <ColorPaletteIcon className="w-4 h-4 mr-1.5" />
                    Background
                </label>
                <div className="flex space-x-2 items-center">
                    {colors.map(color => (
                        <button
                            key={color.value}
                            onClick={() => onChange('backgroundColor', color.value)}
                            className={`w-6 h-6 rounded-full border-2 transition-transform transform hover:scale-110 ${
                                style.backgroundColor === color.value ? 'ring-2 ring-indigo-500 ring-offset-2 border-white' : 'border-stone-200'
                            }`}
                            style={{ backgroundColor: color.value === 'transparent' ? '#fff' : color.value }}
                            title={color.name}
                        >
                           {color.value === 'transparent' && <div className="w-full h-full bg-transparent rounded-full border-2 border-stone-200 bg-clip-content p-0.5"><div className="w-full h-full bg-red-500 rounded-full transform rotate-45" style={{clipPath: 'polygon(0 0, 100% 0, 100% 2px, 0 2px)'}}></div></div>}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                 <label className="flex items-center text-xs font-medium text-stone-600 mb-1.5">
                    <SpacingIcon className="w-4 h-4 mr-1.5" />
                    Spacing
                </label>
                <div className="flex space-x-1 rounded-md bg-stone-200 p-1">
                    {spacingOptions.map(option => (
                        <button
                            key={option.id}
                            onClick={() => onChange('spacing', option.id)}
                            className={`w-full rounded py-1 text-xs font-semibold transition-colors ${
                                style.spacing === option.id
                                    ? 'bg-white shadow-sm text-indigo-600'
                                    : 'text-stone-600 hover:bg-stone-300'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


export const SectionStyler: React.FC<SectionStylerProps> = ({ styles, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mt-6 border border-stone-200 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 bg-stone-50 rounded-t-lg hover:bg-stone-100"
            >
                <h3 className="text-lg font-semibold text-stone-800">Section Styling</h3>
                <svg
                    className={`w-5 h-5 text-stone-600 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 space-y-4">
                    {Object.entries(styles).map(([sectionId, style]) => (
                        <div key={sectionId} className="p-3 border rounded-md bg-white">
                            <p className="font-semibold text-stone-700 mb-3">{sectionNames[sectionId as StylableSection]}</p>
                            <SectionControls
                                sectionId={sectionId as StylableSection}
                                style={style}
                                onChange={(field, value) => onChange(sectionId as StylableSection, field, value)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};