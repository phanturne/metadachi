'use client';

import { useState, useEffect } from 'react';
import type { FileRow } from '@/supabase/queries/file';
import { Button } from '../ui/button';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const FilePicker = ({
  onFileSelect,
  show,
}: {
  onFileSelect: (files: string[]) => void;
  show: boolean;
}) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const {
    data: files,
    error,
    isLoading,
  } = useSWR<FileRow[]>('/api/files', fetcher);

  const handleFileSelect = (file: FileRow) => {
    // Add event prevention
    event?.preventDefault();
    event?.stopPropagation();

    setSelectedFiles((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(file.id)) {
        return prevSelectedFiles.filter((id) => id !== file.id);
      } else {
        return [...prevSelectedFiles, file.id];
      }
    });
  };

  useEffect(() => {
    onFileSelect(selectedFiles);
  }, [selectedFiles, onFileSelect]);

  if (!show) return null;
  if (isLoading) return <div className="p-4">Loading files...</div>;
  if (error) return <div className="p-4">Error loading files</div>;
  if (!files?.length) return <div className="p-4">No files found</div>;

  return (
    <div className="p-4 bg-gray-100 border-b border-gray-300">
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {files.map((file) => (
          <Button
            key={file.id}
            className={`p-2 border rounded cursor-pointer hover:bg-gray-200 ${
              selectedFiles.includes(file.id) ? 'bg-blue-200' : ''
            }`}
            onClick={(event) => handleFileSelect(file)}
          >
            {file.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FilePicker;
