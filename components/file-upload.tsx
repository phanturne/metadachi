import { Button } from '@/components/ui/button';
import { cn, formatFileSize } from '@/lib/utils';
import { FileText, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/html',
] as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

export type FileUploadProps = {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
  className?: string;
};

export function FileUpload({
  onFileSelect,
  selectedFile,
  disabled = false,
  className,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File) => {
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type as AllowedFileType)) {
      toast.error('Unsupported file type. Please upload a text file, PDF, or Word document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast.error('File size too large. Please upload a file smaller than 10MB.');
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
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

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  return (
    <div
      className={cn(
        'relative min-h-[150px] rounded-lg border-2 border-dashed transition-all',
        selectedFile ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50',
        isDragging && 'border-primary bg-primary/10 scale-[1.02]',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      onClick={() => !disabled && !selectedFile && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={ALLOWED_FILE_TYPES.join(',')}
        className="hidden"
        disabled={disabled}
      />

      <div className="absolute inset-0 flex items-center justify-center p-6">
        {selectedFile ? (
          <div className="flex w-full max-w-[90%] items-center gap-4">
            <div className="bg-primary/10 flex-shrink-0 rounded-lg p-2">
              <FileText className="text-primary h-6 w-6" />
            </div>
            <div className="min-w-0 flex-grow">
              <div className="truncate text-sm font-medium">{selectedFile.name}</div>
              <div className="text-muted-foreground text-xs">
                {formatFileSize(selectedFile.size)}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                onFileSelect(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={disabled}
              className="hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="bg-muted/50 rounded-full p-3">
              <Upload
                className={cn(
                  'text-muted-foreground h-6 w-6 transition-transform',
                  isDragging && 'scale-110'
                )}
              />
            </div>
            <div className="text-sm font-medium">Click or drop your file here</div>
            <div className="text-muted-foreground text-xs">
              Supports PDF, Word, Text, Markdown, and HTML files
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
