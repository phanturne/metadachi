/**
 * Splits text into chunks of approximately equal size, trying to break at sentence boundaries
 * @param text The text to split into chunks
 * @param maxChunkSize Maximum size of each chunk (default: 1000 characters)
 * @returns Array of text chunks
 */
export function splitTextIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const chunks: string[] = []
  let currentChunk = ""

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = ""
      }
      // If a single sentence is longer than maxChunkSize, split it into words
      if (sentence.length > maxChunkSize) {
        const words = sentence.split(/\s+/)
        let tempChunk = ""
        for (const word of words) {
          if (tempChunk.length + word.length + 1 > maxChunkSize) {
            chunks.push(tempChunk.trim())
            tempChunk = word
          } else {
            tempChunk += (tempChunk ? " " : "") + word
          }
        }
        if (tempChunk) {
          currentChunk = tempChunk
        }
      } else {
        currentChunk = sentence
      }
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }

  return chunks
} 