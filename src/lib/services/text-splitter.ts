import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export interface TextChunk {
  content: string;
  chunkIndex: number;
  tokenCount?: number;
}

/**
 * Split text into chunks using LangChain's RecursiveCharacterTextSplitter
 */
export async function splitTextIntoChunks(
  text: string,
  options?: {
    chunkSize?: number;
    chunkOverlap?: number;
  },
): Promise<TextChunk[]> {
  const chunkSize = options?.chunkSize ?? 1000;
  const chunkOverlap = options?.chunkOverlap ?? 200;

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: ["\n\n", "\n", ". ", " ", ""],
  });

  const documents = await splitter.createDocuments([text]);

  // Estimate token count (rough approximation: 1 token ≈ 4 characters)
  const chunks: TextChunk[] = documents.map((doc, index) => ({
    content: doc.pageContent,
    chunkIndex: index,
    tokenCount: Math.ceil(doc.pageContent.length / 4),
  }));

  return chunks;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}
