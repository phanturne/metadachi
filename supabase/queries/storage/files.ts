// Adapted from https://github.com/mckaywrigley/chatbot-ui/blob/main/db/storage/files.ts

'use server';
import { DEFAULT_FILE_SIZE_LIMIT } from '@/utils/constants';
import { createClient } from '@/utils/supabase/server';
import { toast } from 'sonner';

export const uploadFile = async (
  file: File,
  payload: {
    name: string;
    user_id: string;
    file_id: string;
  },
) => {
  const SIZE_LIMIT = Number(
    process.env.NEXT_PUBLIC_USER_FILE_SIZE_LIMIT || DEFAULT_FILE_SIZE_LIMIT,
  );

  if (file.size > SIZE_LIMIT) {
    throw new Error(
      `File must be less than ${Math.floor(SIZE_LIMIT / 1000000)}MB`,
    );
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
