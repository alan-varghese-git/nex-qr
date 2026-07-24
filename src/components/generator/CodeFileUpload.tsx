import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

interface CodeFileUploadProps {
  onCodeExtracted: (code: string) => void;
  currentCode: string;
}

const CodeFileUpload: React.FC<CodeFileUploadProps> = ({ onCodeExtracted, currentCode }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['.c', '.cpp', '.java', '.py', '.js', '.ts', '.html', '.css', '.l', '.y', '.txt', '.json', '.xml'];

  const processFile = (file: File) => {
    setError(null);
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      setError(`Unsupported file type: ${extension}. Allowed: ${allowedExtensions.join(', ')}`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        setFileName(file.name);
        onCodeExtracted(content);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file content.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div 
        className={`w-full border-2 border-dashed rounded-xl p-6 transition-all ${
          isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-border bg-muted/30 dark:bg-black/20 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <div className={`p-3 rounded-full ${isDragging ? 'bg-primary/20 text-primary' : 'bg-background text-muted-foreground'}`}>
            <UploadCloud size={24} />
          </div>
          <div>
            <p className="text-sm font-medium">Drag & drop your source code file here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse from your computer</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 mt-2 bg-background border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            Select File
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            accept=".c,.cpp,.java,.py,.js,.ts,.html,.css,.l,.y,.txt,.json,.xml"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
          <AlertCircle size={16} />
          <p>{error}</p>
        </div>
      )}

      {fileName && !error && (
        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium">Successfully loaded: {fileName}</span>
          </div>
          <button 
            onClick={() => {
              setFileName(null);
              onCodeExtracted('');
            }}
            className="text-xs text-green-700 hover:underline font-medium"
          >
            Clear
          </button>
        </div>
      )}
      
      <div className="pt-2 border-t mt-4 relative">
        <label className="block text-xs font-medium text-muted-foreground mb-2">Or paste code manually</label>
        <textarea 
          value={currentCode} 
          onChange={e => onCodeExtracted(e.target.value)}
          className="w-full p-4 border rounded-xl bg-muted/30 dark:bg-black/20 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 backdrop-blur-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-colors shadow-sm font-mono text-sm min-h-[120px]" 
          autoComplete="new-password" 
          data-form-type="other" 
          spellCheck="false" 
          onKeyDown={(e) => { if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault(); }}
          placeholder="def hello_world():&#10;    print('Hello World')" 
        />
      </div>
    </div>
  );
};

export default CodeFileUpload;
