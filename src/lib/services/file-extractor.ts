import mammoth from "mammoth";

/**
 * Extract text from PDF using pdf-parse
 */
async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse =
      "default" in pdfParseModule ? pdfParseModule.default : pdfParseModule;
    const data = await pdfParse(buffer);
    return data.text.trim();
  } catch (error) {
    throw new Error(
      `Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Extract text content from a file buffer based on file type
 */
export async function extractTextFromFile(
  fileBuffer: Buffer,
  fileType: string,
  fileName?: string,
): Promise<string> {
  const mimeType = fileType.toLowerCase();
  const extension = fileName?.split(".").pop()?.toLowerCase() || "";

  // Handle PDF files
  if (mimeType === "application/pdf" || extension === "pdf") {
    try {
      return await extractTextFromPdfBuffer(fileBuffer);
    } catch (error) {
      throw new Error(
        `Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Handle Word documents (DOCX)
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === "docx"
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } catch (error) {
      throw new Error(
        `Failed to extract text from DOCX: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Handle plain text files
  if (
    mimeType === "text/plain" ||
    mimeType.startsWith("text/") ||
    extension === "txt"
  ) {
    try {
      return fileBuffer.toString("utf-8");
    } catch (error) {
      throw new Error(
        `Failed to extract text from plain text file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Handle markdown files
  if (mimeType === "text/markdown" || extension === "md") {
    try {
      return fileBuffer.toString("utf-8");
    } catch (error) {
      throw new Error(
        `Failed to extract text from markdown file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Unsupported file type
  throw new Error(
    `Unsupported file type: ${fileType}. Supported types: PDF, DOCX, TXT, MD`,
  );
}

/**
 * Check if a file type is supported for text extraction
 */
export function isFileTypeSupported(
  fileType: string,
  fileName?: string,
): boolean {
  const mimeType = fileType.toLowerCase();
  const extension = fileName?.split(".").pop()?.toLowerCase() || "";

  const supportedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
  ];

  const supportedExtensions = ["pdf", "docx", "txt", "md"];

  return (
    supportedMimeTypes.includes(mimeType) ||
    supportedExtensions.includes(extension)
  );
}
