// Adapted from https://github.com/mckaywrigley/chatbot-ui/blob/main/db/files.ts

'use server';

import { createClient } from '@/utils/supabase/server';
import type { Database } from '../types';
import { uploadFile } from './storage/files';
import { toast } from 'sonner';
import { embedMany } from 'ai';
import { processTxt } from '@/lib/retrieval/processing/text';
import { openai } from '@ai-sdk/openai';
import { upsertEmbeddings } from './embedding';

export type FileRow = Database['public']['Tables']['file']['Row'];
export type FileInsert = Database['public']['Tables']['file']['Insert'];
export interface FileChunk {
  content: string;
  tokens: number;
  hash: string;
}

export async function saveFile(fileData: FileInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('file')
    .insert(fileData)
    .select('*')
    .single();

  if (error) {
    console.error('Failed to save file in database', error);
    return { data: null, error };
  }

  return { data, error };
}

export async function getFilesByUserId({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('file')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to get files by user id from database', error);
    throw error;
  }

  return data;
}

export async function getFileById({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('file')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to get file by id from database', error);
    throw error;
  }

  return data;
}

export async function deleteFileById({ id }: { id: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('file').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete file by id from database', error);
    throw error;
  }
}

export async function updateFile({
  id,
  file,
}: { id: string; file: FileInsert }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('file')
    .update(file)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Failed to update file in database', error);
    throw error;
  }

  return data;
}

export const createFileAndEmbed = async (
  file: File,
  fileRecord: FileInsert,
) => {
  const validFilename = fileRecord.name
    .replace(/[^a-z0-9.]/gi, '_')
    .toLowerCase();
  const extension = file.name.split('.').pop();
  const extensionIndex = validFilename.lastIndexOf('.');
  const baseName = validFilename.substring(
    0,
    extensionIndex < 0 ? undefined : extensionIndex,
  );
  const maxBaseNameLength = 100 - (extension?.length || 0) - 1;
  if (baseName.length > maxBaseNameLength) {
    fileRecord.name = `${baseName.substring(0, maxBaseNameLength)}.${extension}`;
  } else {
    fileRecord.name = `${baseName}.${extension}`;
  }

  const supabase = await createClient();
  const { data: createdFile, error } = await supabase
    .from('file')
    .insert([fileRecord])
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const filePath = await uploadFile(file, {
    name: createdFile.name,
    user_id: createdFile.user_id,
    file_id: createdFile.name,
  });

  await updateFile({
    id: createdFile.id,
    file: {
      ...createdFile,
      file_path: filePath,
    },
  });

  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder('utf-8').decode(arrayBuffer);

    // Extract file extension
    const fileExtension = createdFile.name.split('.').pop()?.toLowerCase();

    // Process files based on file type
    let chunks: FileChunk[] = [];
    if (fileExtension === 'txt') {
      chunks = await processTxt(text);
    } else {
      throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    // Generate embeddings
    const { embeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: chunks.map((chunk) => chunk.content),
    });

    // Upsert embeddings
    const embeddingObjects = chunks.map((chunk, index) => ({
      file_id: createdFile.id,
      user_id: createdFile.user_id,
      content: chunk.content,
      embedding: JSON.stringify(embeddings[index]),
      hash: chunk.hash,
      tokens: chunk.tokens,
    }));
    await upsertEmbeddings({ embeddings: embeddingObjects });

    // Calculate total tokens
    const totalTokens = chunks.reduce((acc, chunk) => acc + chunk.tokens, 0);

    // Update file row with token count
    const updatedFile = await updateFile({
      id: createdFile.id,
      file: { ...createdFile, tokens: totalTokens },
    });

    return updatedFile;
  } catch (error) {
    console.error('Error processing file:', error);
    toast.error(`Failed to process file.`, {
      duration: 10000,
    });
    await deleteFileById({ id: createdFile.id });
    throw error;
  }
};
