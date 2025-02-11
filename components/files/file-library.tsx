'use client';

import { useState } from 'react';
import type { FileRow } from '@/supabase/queries/file';
import { createFileAndEmbed } from '@/supabase/queries/embedding';

interface FileLibraryProps {
  initialFiles: FileRow[];
  userId: string;
}

export function FileLibrary({ initialFiles, userId }: FileLibraryProps) {
  const [files, setFiles] = useState<FileRow[]>(initialFiles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const fileRecord = {
        name: file.name,
        user_id: userId,
        file_path: '',
      };
      const uploadedFile = await createFileAndEmbed(file, fileRecord);
      setFiles((prevFiles) => [...prevFiles, uploadedFile]);
    } catch (err) {
      setError('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Files</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="mt-4">
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files) handleFileUpload(e.target.files[0]);
          }}
          className="mb-4"
        />
        <ul>
          {files.map((file) => (
            <li key={file.id} className="mb-2">
              {file.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
