
import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { Download, CheckCircle, AlertCircle } from 'lucide-react';

export type DownloadStatus = 'idle' | 'downloading' | 'success' | 'error';

interface DownloadProgressProps {
  status: DownloadStatus;
  fileName: string;
  progress?: number;
  onClose?: () => void;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({ 
  status, 
  fileName,
  progress = 0,
  onClose
}) => {
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    if (status === 'downloading') {
      setShowAnimation(true);
    }
    
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);
  
  if (status === 'idle') return null;
  
  return (
    <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 animate-fade-in">
      <div className="bg-background/95 backdrop-blur-sm border rounded-xl shadow-lg p-4 w-full max-w-md">
        <div className="flex items-center mb-2">
          {status === 'downloading' && (
            <div className="mr-3 bg-primary/20 p-2 rounded-full animate-pulse">
              <Download className="h-5 w-5 text-primary" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="mr-3 bg-green-500/20 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          )}
          
          {status === 'error' && (
            <div className="mr-3 bg-destructive/20 p-2 rounded-full">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-medium text-sm truncate">
              {status === 'downloading' && 'Downloading...'}
              {status === 'success' && 'Download Complete'}
              {status === 'error' && 'Download Failed'}
            </h3>
            <p className="text-muted-foreground text-xs truncate">{fileName}</p>
          </div>
        </div>
        
        {status === 'downloading' && (
          <Progress value={progress} className="h-1.5" />
        )}
      </div>
    </div>
  );
};

export default DownloadProgress;
