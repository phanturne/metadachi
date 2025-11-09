import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateEmbeddings } from "./embeddings";
import { extractTextFromFile, isFileTypeSupported } from "./file-extractor";
import { generateSummary } from "./summarizer";
import { splitTextIntoChunks } from "./text-splitter";
import { extractTextFromUrl } from "./url-extractor";

/**
 * Process a source: chunk text, generate embeddings, and create summary
 */
export async function processSource(
  sourceId: string,
  supabaseClient?: SupabaseClient,
) {
  const supabase = supabaseClient || (await createClient());

  // Fetch the source
  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .select("*")
    .eq("id", sourceId)
    .single();

  if (sourceError || !source) {
    throw new Error(`Source not found: ${sourceError?.message}`);
  }

  // Update status to processing
  await supabase
    .from("sources")
    .update({ status: "processing" })
    .eq("id", sourceId);

  try {
    let content: string;

    // Handle different source types
    if (source.source_type === "text") {
      // Text source: use content directly
      if (!source.content) {
        throw new Error("Text source must have content");
      }
      content = source.content;
    } else if (source.source_type === "file") {
      // File source: download and extract text
      if (!source.file_path) {
        throw new Error("File source must have file_path");
      }
      if (!source.file_type) {
        throw new Error("File source must have file_type");
      }

      // Check if file type is supported
      if (!isFileTypeSupported(source.file_type, source.file_path)) {
        throw new Error(
          `Unsupported file type: ${source.file_type}. Supported types: PDF, DOCX, TXT, MD`,
        );
      }

      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("sources")
        .download(source.file_path);

      if (downloadError || !fileData) {
        throw new Error(
          `Failed to download file: ${downloadError?.message || "File not found"}`,
        );
      }

      // Convert Blob to Buffer
      const arrayBuffer = await fileData.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      // Extract text from file
      content = await extractTextFromFile(
        fileBuffer,
        source.file_type,
        source.file_path,
      );

      // Update source content with extracted text (optional, for caching)
      // This allows the extracted text to be stored for future reference
      await supabase.from("sources").update({ content }).eq("id", sourceId);
    } else if (source.source_type === "url") {
      // URL source: fetch and extract text from URL
      if (!source.source_url) {
        throw new Error("URL source must have source_url");
      }

      // Extract text from URL
      content = await extractTextFromUrl(source.source_url);

      // Update source content with extracted text (optional, for caching)
      // This allows the extracted text to be stored for future reference
      await supabase.from("sources").update({ content }).eq("id", sourceId);
    } else {
      throw new Error(
        `Unsupported source type: ${source.source_type}. Only 'text', 'file', and 'url' sources are supported`,
      );
    }

    if (!content || content.trim().length === 0) {
      throw new Error("No content extracted from source");
    }

    // Step 1: Split text into chunks
    const chunks = await splitTextIntoChunks(content, {
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    if (chunks.length === 0) {
      throw new Error("No chunks generated from source content");
    }

    // Step 2: Generate embeddings for all chunks in batch
    const chunkTexts = chunks.map((chunk) => chunk.content);
    const embeddings = await generateEmbeddings(chunkTexts);

    if (embeddings.length !== chunks.length) {
      throw new Error("Mismatch between chunks and embeddings");
    }

    // Step 3: Store chunks with embeddings
    const chunkInserts = chunks.map((chunk, index) => ({
      source_id: sourceId,
      content: chunk.content,
      chunk_index: index,
      token_count: chunk.tokenCount,
      embedding: embeddings[index],
      metadata: {},
    }));

    // Delete existing chunks for this source
    await supabase.from("source_chunks").delete().eq("source_id", sourceId);

    // Insert new chunks
    const { error: chunksError } = await supabase
      .from("source_chunks")
      .insert(chunkInserts);

    if (chunksError) {
      throw new Error(`Failed to insert chunks: ${chunksError.message}`);
    }

    // Step 4: Generate summary
    const summary = await generateSummary(content);

    // Step 5: Store summary (upsert)
    const { error: summaryError } = await supabase
      .from("source_summaries")
      .upsert(
        {
          source_id: sourceId,
          summary: summary.summary,
          key_points: summary.keyPoints,
          topics: summary.topics,
          word_count: summary.wordCount,
        },
        {
          onConflict: "source_id",
        },
      );

    if (summaryError) {
      throw new Error(`Failed to insert summary: ${summaryError.message}`);
    }

    // Step 6: Update source status to ready
    await supabase
      .from("sources")
      .update({ status: "ready" })
      .eq("id", sourceId);

    return {
      success: true,
      chunksCount: chunks.length,
      summary,
    };
  } catch (error) {
    // Update status to error
    await supabase
      .from("sources")
      .update({
        status: "error",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      })
      .eq("id", sourceId);

    throw error;
  }
}
