
import React, { useEffect, useState, useRef } from 'react';
import { TemplateSelector } from './TemplateSelector';
import { DownloadIcon, SparklesIcon } from './icons';

// This is a global function from the 'marked' library loaded in index.html
declare global {
    interface Window {
        marked: {
            parse(markdown: string): string;
        };
        jspdf: any;
        html2canvas: any;
    }
}

interface CVPreviewProps {
  markdownContent: string;
  isLoading: boolean;
  error: string | null;
  selectedTemplate: string;
  onTemplateChange: (id: string) => void;
  onGenerate: () => void;
  videoUrl?: string;
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


export const CVPreview: React.FC<CVPreviewProps> = ({ markdownContent, isLoading, error, selectedTemplate, onTemplateChange, onGenerate, videoUrl }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (markdownContent) {
      const parsedHtml = window.marked.parse(markdownContent);
      setHtmlContent(parsedHtml);
    } else {
      setHtmlContent('');
    }
  }, [markdownContent]);

  const handleExportPDF = async () => {
    if (!previewRef.current || !markdownContent) return;

    setIsExporting(true);
    try {
        const { jsPDF } = window.jspdf;
        const canvas = await window.html2canvas(previewRef.current, {
            scale: 2, // Higher scale for better quality
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
            position -= pdf.internal.pageSize.getHeight();
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }
        
        pdf.save('cv.pdf');

    } catch (err) {
        console.error("Failed to export PDF", err);
        alert("Sorry, there was an error exporting the PDF. Please try again.");
    } finally {
        setIsExporting(false);
    }
  };


  const renderContent = () => {
    if(isLoading) return <LoadingSkeleton />;
    if(error) return <div className="text-center text-red-600 bg-red-50 p-4 rounded-md">{error}</div>;
    if(!markdownContent && !isLoading) return <Placeholder />;

    return (
        <div ref={previewRef} className="space-y-4">
            {videoUrl && (
                 <div className="not-prose">
                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Video Presentation</h2>
                    <video key={videoUrl} controls src={videoUrl} className="w-full rounded-lg shadow-md bg-black" />
                </div>
            )}
            <div
              className="prose prose-indigo max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        </div>
    )
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md sticky top-24">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-2xl font-bold text-gray-900">CV Preview</h2>
            <div className="flex items-center space-x-3">
                <button
                    onClick={handleExportPDF}
                    disabled={!markdownContent || isLoading || isExporting}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                    {isExporting ? 'Exporting...' : <><DownloadIcon className="w-5 h-5 mr-2" /> Export PDF</>}
                </button>
                 <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
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
                            Generate
                        </>
                    )}
                </button>
            </div>
        </div>
        
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
