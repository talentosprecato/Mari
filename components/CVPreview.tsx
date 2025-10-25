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

const CVPreviewStyles = () => (
    <style>{`
        :root {
            /* Default Theme Variables */
            --cv-bg-color: #fff;
            --cv-text-color: #374151; /* gray-700 */
            --cv-primary-color: #4f46e5; /* indigo-600 */
            --cv-secondary-color: #4b5563; /* gray-600 */
            --cv-link-color: #4f46e5;
            --cv-border-color: #e5e7eb; /* gray-200 */
            
            --cv-font-sans: 'Inter', system-ui, sans-serif;
            --cv-font-serif: 'Lora', Georgia, serif;
            --cv-font-mono: 'Roboto Mono', monospace;

            --cv-font-size: 16px;
            --cv-line-height: 1.6;
            --cv-heading-font-weight: 700;
            --cv-heading-line-height: 1.2;
            --cv-heading-letter-spacing: -0.025em;
        }

        /* Template Specific Variables */
        .template-modern {
            --cv-primary-color: #4f46e5; /* indigo-600 */
            --cv-font-sans: 'Inter', sans-serif;
        }
        .template-creative {
            --cv-primary-color: #db2777; /* pink-600 */
            --cv-secondary-color: #16a34a; /* green-600 */
            --cv-font-sans: 'Inter', sans-serif;
            --cv-heading-letter-spacing: -0.01em;
        }
        .template-classic {
            --cv-primary-color: #111827; /* gray-900 */
            --cv-secondary-color: #374151;
            --cv-font-sans: 'Lora', serif;
            --cv-font-serif: 'Lora', serif;
            --cv-line-height: 1.5;
        }
        .template-ai-content-editor {
            --cv-primary-color: #0d9488; /* teal-600 */
            --cv-font-sans: 'Inter', sans-serif;
            --cv-font-mono: 'Roboto Mono', monospace;
        }
        .template-social-media-creative {
            --cv-primary-color: #c026d3; /* fuchsia-600 */
            --cv-secondary-color: #ea580c; /* orange-600 */
            --cv-font-sans: 'Inter', sans-serif;
            --cv-heading-font-weight: 800;
        }
        .template-technical {
            --cv-primary-color: #2563eb; /* blue-600 */
            --cv-font-sans: 'Inter', sans-serif;
            --cv-font-mono: 'Roboto Mono', monospace;
            --cv-font-size: 15px;
        }
        .template-minimalist {
            --cv-primary-color: #1f2937; /* gray-800 */
            --cv-secondary-color: #6b7280; /* gray-500 */
            --cv-font-sans: 'Inter', sans-serif;
            --cv-line-height: 1.7;
        }

        /* General CV element styling using variables */
        .cv-preview-content {
            background-color: var(--cv-bg-color);
            color: var(--cv-text-color);
            font-family: var(--cv-font-sans);
            font-size: var(--cv-font-size);
            line-height: var(--cv-line-height);
        }

        .cv-preview-content h1 {
            color: var(--cv-primary-color);
            font-family: var(--cv-font-sans);
            font-weight: 800;
            font-size: 2.25em;
            margin-bottom: 0.25em;
            line-height: var(--cv-heading-line-height);
            letter-spacing: var(--cv-heading-letter-spacing);
        }

        .cv-preview-content h2 {
            color: var(--cv-primary-color);
            font-family: var(--cv-font-sans);
            font-weight: var(--cv-heading-font-weight);
            font-size: 1.5em;
            margin-top: 1.5em;
            margin-bottom: 0.75em;
            padding-bottom: 0.25em;
            border-bottom: 2px solid var(--cv-border-color);
            line-height: var(--cv-heading-line-height);
        }

        .cv-preview-content h3 {
            color: var(--cv-secondary-color);
            font-family: var(--cv-font-sans);
            font-weight: 600;
            font-size: 1.2em;
            margin-top: 1em;
            margin-bottom: 0.5em;
        }

        .cv-preview-content p,
        .cv-preview-content ul,
        .cv-preview-content ol {
            margin-bottom: 1em;
        }

        .cv-preview-content a {
            color: var(--cv-link-color);
            text-decoration: none;
        }
        .cv-preview-content a:hover {
            text-decoration: underline;
        }

        .cv-preview-content strong {
            font-weight: 600;
            color: var(--cv-secondary-color);
        }
        .template-classic .cv-preview-content strong {
            color: var(--cv-primary-color);
        }

        .cv-preview-content ul {
            list-style-type: disc;
            padding-left: 1.5em;
        }
        .cv-preview-content ul li::marker {
            color: var(--cv-primary-color);
        }

        .cv-preview-content hr {
            border-top: 1px solid var(--cv-border-color);
            margin: 2em 0;
        }

        .cv-preview-content blockquote {
            border-left: 4px solid var(--cv-primary-color);
            padding-left: 1em;
            margin-left: 0;
            font-style: italic;
            color: var(--cv-secondary-color);
        }

        .cv-preview-content code {
            background-color: #f3f4f6; /* gray-100 */
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            border-radius: 3px;
            font-family: var(--cv-font-mono);
        }
        .template-ai-content-editor .cv-preview-content code,
        .template-technical .cv-preview-content code {
            background-color: #e5e7eb; /* gray-200 */
            color: #1e293b; /* slate-800 */
        }

        .template-creative .cv-preview-content h2 {
            border-image: linear-gradient(to right, var(--cv-primary-color), var(--cv-secondary-color)) 1;
            border-width: 0 0 3px 0;
            border-style: solid;
        }
        
        .video-presentation-section {
            margin-bottom: 1em;
        }
        .video-presentation-section video {
            width: 100%;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            background-color: #000;
            margin-top: 0.5em;
        }
    `}</style>
);

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
        <div ref={previewRef} className="cv-preview-content">
            {videoUrl && (
                 <div className="video-presentation-section">
                    <h2>Video Presentation</h2>
                    <video key={videoUrl} controls src={videoUrl} />
                </div>
            )}
            <div
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        </div>
    )
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md sticky top-24">
        <CVPreviewStyles />
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
        
        <div className={`template-${selectedTemplate}`}>
            <div className="min-h-[600px] border-t pt-6 mt-6">
                {renderContent()}
            </div>
        </div>
    </div>
  );
};