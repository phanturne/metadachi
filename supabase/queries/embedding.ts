// Adapted from https://github.com/mckaywrigley/chatbot-ui/tree/main/app/api/retrieval

'use server';

import { createClient } from '@/utils/supabase/server';
import type { Database } from '../types';
import { processTxt } from '@/lib/retrieval/processing/text';
import {
  deleteFileById,
  type FileChunk,
  updateFile,
  type FileInsert,
} from './file';
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { toast } from 'sonner';
import { uploadFile } from './storage/files';
import { checkFileSize } from '@/utils/utils';

export type Embedding = Database['public']['Tables']['embedding']['Row'];
export type EmbeddingInsert =
  Database['public']['Tables']['embedding']['Insert'];

export async function upsertEmbeddings({
  embeddings,
}: {
  embeddings: EmbeddingInsert[];
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('embedding').upsert(embeddings);

  if (error) {
    console.error('Failed to upsert embeddings in database', error);
    throw error;
  }

  return data;
}

export async function getEmbeddingsByUserId({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('embedding')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to get embeddings by user id from database', error);
    throw error;
  }

  return data;
}

export async function getEmbeddingById({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('embedding')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to get embedding by id from database', error);
    throw error;
  }

  return data;
}

export async function deleteEmbeddingById({ id }: { id: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('embedding').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete embedding by id from database', error);
    throw error;
  }
}

export async function matchEmbeddings({
  queryEmbedding,
  matchCount,
  fileIds,
}: {
  queryEmbedding: any;
  matchCount?: number;
  fileIds?: string[];
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('match_embeddings', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    file_ids: fileIds,
  });

  if (error) {
    console.error('Failed to match embeddings in database', error);
    throw error;
  }

  return data;
}

export const createFileAndEmbed = async (
  file: File,
  fileRecord: FileInsert,
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

  const updatedFile = await updateFile({
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
    const fileExtension = updatedFile.name.split('.').pop()?.toLowerCase();

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
      file_id: updatedFile.id,
      user_id: updatedFile.user_id,
      content: chunk.content,
      embedding: JSON.stringify(embeddings[index]),
      hash: chunk.hash,
      tokens: chunk.tokens,
    }));
    await upsertEmbeddings({ embeddings: embeddingObjects });

    // Calculate total tokens
    const totalTokens = chunks.reduce((acc, chunk) => acc + chunk.tokens, 0);

    // Update file row with token count
    const finalFile = await updateFile({
      id: updatedFile.id,
      file: { ...updatedFile, tokens: totalTokens },
    });

    return finalFile;
  } catch (error) {
    console.error('Error processing file:', error);
    toast.error(`Failed to process file.`, {
      duration: 10000,
    });
    await deleteFileById({ id: updatedFile.id });
    throw error;
  }
};

export const handleRetrieval = async (
  userInput: string,
  sourceCount: number,
  fileIds: string[] = [],
) => {
  const uniqueFileIds = [...new Set(fileIds)];

  try {
    // Process user input into chunks
    const chunks = await processTxt(userInput);

    // Generate embeddings for the chunks
    const { embeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: chunks.map((chunk) => chunk.content),
    });

    // Call matchEmbeddings function
    const fileItems = await matchEmbeddings({
      queryEmbedding: embeddings[0],
      matchCount: sourceCount,
      fileIds: uniqueFileIds,
    });

    const mostSimilarChunks = fileItems?.sort(
      (a, b) => b.similarity - a.similarity,
    );

    return mostSimilarChunks;
  } catch (error: any) {
    console.error('Error retrieving:', error);
    throw error;
  }
};
