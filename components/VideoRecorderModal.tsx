
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CVData } from '../types';
import { generateVideoScript } from '../services/geminiService';
import { MagicWandIcon } from './icons';

interface VideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (videoBlob: Blob) => void;
  cvData: CVData;
  language: string;
}

const filters = [
    { id: 'none', name: 'None' },
    { id: 'grayscale(1)', name: 'Grayscale' },
    { id: 'sepia(1)', name: 'Sepia' },
    { id: 'saturate(2)', name: 'Vibrant' },
    { id: 'hue-rotate(180deg) contrast(1.2)', name: 'Invert' },
];

export const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({ isOpen, onClose, onSave, cvData, language }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState(40);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [script, setScript] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isTeleprompterVisible, setIsTeleprompterVisible] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<number | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const drawVideoOnCanvas = useCallback(() => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 3) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.filter = selectedFilter;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    }
    animationFrameIdRef.current = requestAnimationFrame(drawVideoOnCanvas);
  }, [selectedFilter]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
             animationFrameIdRef.current = requestAnimationFrame(drawVideoOnCanvas);
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please ensure you have given permission.");
      onClose();
    }
  }, [onClose, drawVideoOnCanvas]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setIsRecording(false);
      setRecordedBlob(null);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setCountdown(40);
      setScript(null);
      setIsTeleprompterVisible(false);
      setSelectedFilter('none');
    }
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  const handleStartRecording = () => {
    if (!canvasRef.current || !stream) return;
    
    const canvasStream = canvasRef.current.captureStream(30);
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
        canvasStream.addTrack(audioTracks[0]);
    }

    setRecordedBlob(null);
    chunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(canvasStream, { mimeType: 'video/webm' });
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);

    setCountdown(40);
    countdownIntervalRef.current = window.setInterval(() => {
        setCountdown(prev => prev - 1);
    }, 1000);

    setTimeout(() => {
        if(mediaRecorderRef.current?.state === 'recording') {
            handleStopRecording();
        }
    }, 40000);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
  };

  const handleRetake = () => {
    setRecordedBlob(null);
    setCountdown(40);
  };
  
  const handleSave = () => {
    if (recordedBlob) {
      onSave(recordedBlob);
    }
  };

  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    setScript(null);
    try {
      const generatedScript = await generateVideoScript(cvData, language);
      setScript(generatedScript);
      setIsTeleprompterVisible(true);
    } catch (e) {
      console.error(e);
      alert("Failed to generate script. Please try again.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  if (!isOpen) {
    return null;
  }
  
  const videoSrc = recordedBlob ? URL.createObjectURL(recordedBlob) : undefined;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <header className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Record Video Presentation</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </header>
        <main className="p-6">
            <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden shadow-inner">
                 <video ref={videoRef} autoPlay muted playsInline className="absolute w-full h-full object-cover opacity-0 pointer-events-none"></video>
                 <canvas ref={canvasRef} className={`w-full h-full object-cover transition-opacity duration-300 ${recordedBlob ? 'opacity-0' : 'opacity-100'}`}></canvas>
                 {recordedBlob && <video key={videoSrc} src={videoSrc} controls autoPlay playsInline className="w-full h-full object-cover"></video>}
                 {isRecording && <div className="absolute top-4 right-4 text-white bg-red-600 rounded-full px-3 py-1 text-sm font-bold animate-pulse">REC</div>}
                 {isRecording && <div className="absolute bottom-4 left-4 text-white bg-black/50 rounded-md px-2 py-1 text-sm">0:{String(countdown).padStart(2, '0')}</div>}
                 {isTeleprompterVisible && (
                    <div className="absolute inset-0 bg-black/60 p-6 flex flex-col items-center justify-start overflow-hidden">
                        <div className="w-full h-full overflow-y-auto scrollbar-hide">
                            <div className={`text-white text-xl font-semibold whitespace-pre-wrap text-center transition-transform duration-[40s] linear ${isRecording ? '-translate-y-full' : 'translate-y-0'}`}>
                                {script}
                            </div>
                        </div>
                        <button onClick={() => setIsTeleprompterVisible(false)} className="absolute top-2 right-2 text-white bg-black/50 rounded-full w-6 h-6 flex items-center justify-center text-lg z-10">&times;</button>
                    </div>
                )}
            </div>
        </main>

        {!recordedBlob && (
        <div className="px-6 pb-4 border-b space-y-4">
            <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Filters & Lenses</label>
                <div className="flex flex-wrap gap-2">
                    {filters.map(f => (
                        <button key={f.id} onClick={() => setSelectedFilter(f.id)}
                            className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${selectedFilter === f.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                            {f.name}
                        </button>
                    ))}
                </div>
            </div>
             <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">AI Tools</label>
                <button 
                    onClick={handleGenerateScript}
                    disabled={isGeneratingScript}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                    {isGeneratingScript ? (
                        <>
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Script...
                        </>
                    ) : (
                       <>
                        <MagicWandIcon className="w-5 h-5 mr-2" /> Generate AI Script & Teleprompter
                       </>
                    )}
                </button>
            </div>
        </div>
        )}

         <footer className="p-4 bg-gray-50 flex justify-between items-center">
          <div>
            {!isRecording && !recordedBlob && <span className="text-sm text-gray-500">Max 40 seconds.</span>}
          </div>
          <div className="flex space-x-4">
            {isRecording ? (
                <button onClick={handleStopRecording} className="px-6 py-2 border rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">Stop</button>
            ) : recordedBlob ? (
                <>
                    <button onClick={handleRetake} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Retake</button>
                    <button onClick={handleSave} className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Save</button>
                </>
            ) : (
                <>
                    <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleStartRecording} className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Record</button>
                </>
            )}
          </div>
        </footer>
      </div>
       <style>{`
        @keyframes fade-in-scale {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
