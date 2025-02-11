'use client';

import { useState, useEffect } from 'react';
import { type FileRow, getFilesByUserId } from '@/supabase/queries/file';
import { useSession } from '@/hooks/use-session';
import { Button } from '../ui/button';

const FilePicker = ({
  onFileSelect,
  show,
}: {
  onFileSelect: (files: string[]) => void;
  show: boolean;
}) => {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const { session } = useSession();

  useEffect(() => {
    const fetchFiles = async () => {
      if (!session?.user?.id) {
        console.error('User not logged in');
        return;
      }

      try {
        const data = await getFilesByUserId({ userId: session.user.id });
        setFiles(data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, [session]);

  const handleFileSelect = (file: FileRow) => {
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

  return (
    <div className="p-4 bg-gray-100 border-b border-gray-300">
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {files.map((file) => (
          <Button
            key={file.id}
            className={`p-2 border rounded cursor-pointer hover:bg-gray-200 ${selectedFiles.includes(file.id) ? 'bg-blue-200' : ''}`}
            onClick={() => handleFileSelect(file)}
          >
            {file.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FilePicker;
