
import React, { useEffect, useState } from 'react';
import { TemplateSelector } from './TemplateSelector';

// This is a global function from the 'marked' library loaded in index.html
declare global {
    interface Window {
        marked: {
            parse(markdown: string): string;
        };
    }
}

interface CVPreviewProps {
  markdownContent: string;
  isLoading: boolean;
  error: string | null;
  selectedTemplate: string;
  onTemplateChange: (id: string) => void;
}

const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-6 bg-gray-300 rounded-md w-1/3"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
        <div className="h-6 bg-gray-300 rounded-md w-1/4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
         <div className="h-6 bg-gray-300 rounded-md w-1/4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
    </div>
);

const Placeholder = () => (
    <div className="text-center text-gray-500">
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">AI Generated CV</h3>
            <p className="mt-1 text-sm text-gray-500">Fill out the form and click "Generate" to see your professional CV here.</p>
        </div>
    </div>
)


export const CVPreview: React.FC<CVPreviewProps> = ({ markdownContent, isLoading, error, selectedTemplate, onTemplateChange }) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (markdownContent) {
      const parsedHtml = window.marked.parse(markdownContent);
      setHtmlContent(parsedHtml);
    } else {
      setHtmlContent('');
    }
  }, [markdownContent]);

  const renderContent = () => {
    if(isLoading) return <LoadingSkeleton />;
    if(error) return <div className="text-center text-red-600 bg-red-50 p-4 rounded-md">{error}</div>;
    if(!markdownContent && !isLoading) return <Placeholder />;

    return (
        <div
          className="prose prose-indigo max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    )
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md sticky top-24">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">CV Preview</h2>
        
        <TemplateSelector 
            selectedTemplate={selectedTemplate}
            onTemplateChange={onTemplateChange}
        />

        <div className="min-h-[600px] border-t pt-6 mt-6">
            {renderContent()}
        </div>
    </div>
  );
};
