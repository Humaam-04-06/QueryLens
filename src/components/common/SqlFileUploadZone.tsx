import React, { useState, useRef } from 'react';
import { readSqlFile, formatBytes } from '../../utils/fileUpload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faFileCode, 
  faXmark, 
  faCircleCheck, 
  faTriangleExclamation 
} from '@fortawesome/free-solid-svg-icons';

interface SqlFileUploadZoneProps {
  onFileLoaded: (content: string, filename: string) => void;
  loadedFilename?: string;
  onClear?: () => void;
  compact?: boolean;
  className?: string;
}

export const SqlFileUploadZone: React.FC<SqlFileUploadZoneProps> = ({
  onFileLoaded,
  loadedFilename,
  onClear,
  compact = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const result = await readSqlFile(file);
      setFileSize(result.sizeBytes);
      onFileLoaded(result.content, result.filename);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read SQL file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const triggerBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileSize(null);
    setErrorMessage(null);
    if (onClear) onClear();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (compact) {
    return (
      <div className={`relative inline-block ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".sql,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={triggerBrowse}
          disabled={isLoading}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/40 transition flex items-center gap-1.5 shadow-sm"
          title="Upload .sql file from your computer"
        >
          <FontAwesomeIcon icon={faUpload} className="text-cyan-400 text-xs" />
          <span>{isLoading ? 'Reading...' : 'Upload .sql'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".sql,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {loadedFilename ? (
        /* Loaded File Confirmation Pill */
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between shadow-glow-cyan/20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faFileCode} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-cyan-200 truncate">{loadedFilename}</span>
                <FontAwesomeIcon icon={faCircleCheck} className="text-[11px] text-emerald-400 shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400">
                {fileSize ? formatBytes(fileSize) : 'Loaded'} • Ready for analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={triggerBrowse}
              className="text-[11px] px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition font-medium"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
              title="Remove uploaded file"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
      ) : (
        /* Drag-and-Drop Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerBrowse}
          className={`cursor-pointer p-5 rounded-xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10 shadow-glow-cyan'
              : 'border-slate-800 hover:border-cyan-500/50 hover:bg-dark-900/60 bg-dark-950/40'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 text-cyan-400 border border-slate-700/60 flex items-center justify-center">
            <FontAwesomeIcon icon={faUpload} className="text-base" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">
              Drag & Drop your <span className="text-cyan-400 font-mono">.sql</span> or <span className="text-cyan-400 font-mono">.txt</span> file here
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              or <span className="text-cyan-400 underline underline-offset-2">browse from your computer</span> (up to 5MB)
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
