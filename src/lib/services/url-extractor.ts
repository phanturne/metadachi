import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

/**
 * Extract text content from a URL
 * Uses Mozilla Readability to extract main content from web pages
 */
export async function extractTextFromUrl(url: string): Promise<string> {
  try {
    // Validate URL
    const urlObj = new URL(url);

    // Fetch the URL content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      // Set a timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch URL: ${response.status} ${response.statusText}`,
      );
    }

    // Get content type to handle different response types
    const contentType = response.headers.get("content-type") || "";

    // Handle PDFs from URLs
    if (contentType.includes("application/pdf")) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Import pdf-parse dynamically to avoid issues
      const pdfParseModule = await import("pdf-parse");
      const pdfParse =
        "default" in pdfParseModule ? pdfParseModule.default : pdfParseModule;
      const data = await pdfParse(buffer);
      return data.text.trim();
    }

    // Handle HTML content
    if (contentType.includes("text/html")) {
      const html = await response.text();

      // Use JSDOM to parse HTML
      const dom = new JSDOM(html, {
        url: urlObj.href,
      });

      // Use Mozilla Readability to extract readable content
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (article) {
        // Return the readable text content
        return article.textContent.trim();
      }

      // Fallback: extract text from body if Readability fails
      const body = dom.window.document.body;
      if (body) {
        return body.textContent?.trim() || "";
      }

      throw new Error("Failed to extract content from HTML");
    }

    // Handle plain text content
    if (contentType.includes("text/plain")) {
      return (await response.text()).trim();
    }

    // Fallback: try to parse as text (for unknown content types)
    // Note: This will only work if the response hasn't been consumed yet
    try {
      const text = await response.text();
      if (text.trim().length > 0) {
        return text.trim();
      }
      throw new Error("Empty response body");
    } catch (error) {
      throw new Error(
        `Unsupported content type: ${contentType}. Supported types: HTML, PDF, plain text. ${error instanceof Error ? error.message : ""}`,
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === "AbortError" || error.message.includes("timeout")) {
        throw new Error("Request timeout: URL took too long to respond");
      }
      if (error.message.includes("Invalid URL")) {
        throw new Error(`Invalid URL format: ${url}`);
      }
      throw new Error(`Failed to extract text from URL: ${error.message}`);
    }
    throw new Error(
      `Failed to extract text from URL: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
