// Adapted from https://github.com/mckaywrigley/chatbot-ui/blob/main/db/storage/files.ts

'use server';
import { createClient } from '@/utils/supabase/server';
import { toast } from 'sonner';
import { checkFileSize } from '@/utils/utils';

export const uploadFile = async (
  file: File,
  payload: {
    name: string;
    user_id: string;
    file_id: string;
  },
) => {
  try {
    checkFileSize(file);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('An unknown error occurred.');
    }
  }

  const filePath = `${payload.user_id}/${payload.file_id}`;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from('files')
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error('Error uploading file');
    }

    return filePath;
  } catch (err) {
    console.error('Upload file error:', err);
    throw new Error('Error uploading file');
  }
};

export const deleteFileFromStorage = async (filePath: string) => {
  const supabase = await createClient();
  const { error } = await supabase.storage.from('files').remove([filePath]);

  if (error) {
    toast.error('Failed to remove file!');
    return;
  }
};

export const getFileFromStorage = async (filePath: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('files')
    .createSignedUrl(filePath, 60 * 60 * 24); // 24hrs

  if (error) {
    console.error(
      `Error creating signed URL for file with path: ${filePath}`,
      error,
    );
    throw new Error('Error creating signed URL for file');
  }

  return data.signedUrl;
};
