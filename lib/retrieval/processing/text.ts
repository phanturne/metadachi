// Adapted from https://github.com/mckaywrigley/chatbot-ui/blob/main/lib/retrieval/processing/txt.ts

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { CHUNK_OVERLAP, CHUNK_SIZE } from '@/utils/constants';
import { encode } from 'gpt-tokenizer';
import type { FileChunk } from '@/supabase/queries/file';
import { createHash } from 'node:crypto';

export async function processTxt(input: string): Promise<FileChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const texts = await splitter.splitText(input);

  const chunks: FileChunk[] = texts.map((text) => {
    const content = text.trim();
    const tokens = encode(content).length;
    const hash = createHash('sha256').update(content).digest('hex');

    return {
      content,
      tokens,
      hash,
    };
  });

  return chunks;
}
