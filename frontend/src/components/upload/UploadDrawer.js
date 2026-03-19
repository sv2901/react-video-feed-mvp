import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Video, CheckCircle2 } from 'lucide-react';
import { useVideo } from '../../context/VideoContext';
import { ProcessingPipeline } from './ProcessingPipeline';
import { cn } from '../../lib/utils';

export function UploadDrawer({ isOpen, onClose }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef(null);
  const { uploadVideo, isUploading, uploadProgress, processingState } = useVideo();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      await handleUpload(file);
    }
  }, []);

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUpload(file);
    }
  }, []);

  const handleUpload = async (file) => {
    try {
      await uploadVideo(file);
      setUploadComplete(true);
      setTimeout(() => {
        setUploadComplete(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={handleClose}
            data-testid="upload-backdrop"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 rounded-t-3xl max-h-[85vh] overflow-hidden"
            data-testid="upload-drawer"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <h2 className="text-xl font-bold text-white font-heading">Upload Video</h2>
              <button
                onClick={handleClose}
                disabled={isUploading}
                className={cn(
                  "w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center transition-all duration-300",
                  isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-700"
                )}
                data-testid="close-upload-btn"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 pb-8 safe-bottom">
              {uploadComplete ? (
                /* Success State */
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                  data-testid="upload-success"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white font-heading mb-1">Upload Complete!</h3>
                  <p className="text-zinc-400 text-sm">Your video is now live</p>
                </motion.div>
              ) : isUploading || processingState ? (
                /* Processing State */
                <div className="py-4" data-testid="upload-processing">
                  <ProcessingPipeline 
                    currentStage={processingState || 'uploading'} 
                    progress={uploadProgress} 
                  />
                </div>
              ) : (
                /* Upload Zone */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "drop-zone rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[280px]",
                    isDragging && "active"
                  )}
                  data-testid="upload-drop-zone"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="file-input"
                  />

                  <motion.div
                    animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                    className={cn(
                      "w-20 h-20 rounded-full flex items-center justify-center mb-5 transition-all duration-300",
                      isDragging ? "gradient-accent" : "bg-zinc-800"
                    )}
                  >
                    {isDragging ? (
                      <Video className="w-10 h-10 text-white" />
                    ) : (
                      <Upload className="w-10 h-10 text-zinc-400" />
                    )}
                  </motion.div>

                  <h3 className="text-lg font-semibold text-white font-heading mb-2">
                    {isDragging ? 'Drop to upload' : 'Upload a video'}
                  </h3>
                  <p className="text-zinc-400 text-sm text-center mb-4">
                    Drag and drop or tap to select
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-400 text-xs">MP4</span>
                    <span className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-400 text-xs">MOV</span>
                    <span className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-400 text-xs">WEBM</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
