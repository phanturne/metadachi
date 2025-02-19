'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { deleteFileById, type FileRow } from '@/supabase/queries/file';
import { createFileAndEmbed } from '@/supabase/queries/embedding';
import { checkFileSize } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileIcon, Loader2, UploadIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AppHeader } from '../app-header';

interface FileLibraryProps {
  initialFiles: FileRow[];
  userId: string;
}

export function FileLibrary({ initialFiles, userId }: FileLibraryProps) {
  const [files, setFiles] = useState<FileRow[]>(initialFiles);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setLoading(true);
      try {
        for (const file of acceptedFiles) {
          try {
            checkFileSize(file);
          } catch (error: unknown) {
            if (error instanceof Error) {
              toast.error(error.message);
            } else {
              toast.error('An unknown error occurred.');
            }
            continue;
          }
          const fileRecord = {
            name: file.name,
            user_id: userId,
            file_path: '',
          };
          const uploadedFile = await createFileAndEmbed(file, fileRecord);
          setFiles((prevFiles) => [...prevFiles, uploadedFile]);
          toast.success(`${file.name} has been added to your library.`);
        }
      } catch (err) {
        toast.error(
          'There was an error uploading your file. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFileById({ id: fileId });
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      toast.info('The file has been removed from your library.');
    } catch (err) {
      toast.error('There was an error deleting your file. Please try again.');
    }
  };

  return (
    <div>
      <AppHeader />
      <div className="mx-auto px-8 pb-4 md:pb-6">
        <h1 className="text-3xl font-bold mb-6">File Library</h1>
        <Card className="mb-8">
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition `}
            >
              <input {...getInputProps()} />
              {loading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <UploadIcon className="h-10 w-10 text-blue-500" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {isDragActive
                      ? 'Drop the files here ...'
                      : 'Drag & drop some files here, or click to select files'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileIcon className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(file.id)}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {files.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No files in your library yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
