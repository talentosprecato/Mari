
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface VideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (videoBlob: Blob) => void;
}

export const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({ isOpen, onClose, onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState(40);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<number | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please ensure you have given permission.");
      onClose();
    }
  }, [onClose]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      // Reset state when closed
      setIsRecording(false);
      setRecordedBlob(null);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setCountdown(40);
    }
    // Cleanup on unmount
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  const handleStartRecording = () => {
    if (!stream) return;
    setRecordedBlob(null);
    chunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(stream);
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

  if (!isOpen) {
    return null;
  }
  
  const videoSrc = recordedBlob ? URL.createObjectURL(recordedBlob) : undefined;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Record Video Presentation</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </header>
        <main className="p-6">
            <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden shadow-inner">
                 <video ref={videoRef} autoPlay muted={!recordedBlob} playsInline className={`w-full h-full object-cover ${recordedBlob ? 'hidden' : ''}`}></video>
                 {recordedBlob && <video src={videoSrc} controls autoPlay playsInline className="w-full h-full"></video>}
                 {isRecording && <div className="absolute top-4 right-4 text-white bg-red-600 rounded-full px-3 py-1 text-sm font-bold animate-pulse">REC</div>}
                 {isRecording && <div className="absolute bottom-4 left-4 text-white bg-black/50 rounded-md px-2 py-1 text-sm">0:{String(countdown).padStart(2, '0')}</div>}
            </div>
        </main>
         <footer className="p-4 bg-gray-50 border-t flex justify-between items-center">
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
    </div>
  );
};
