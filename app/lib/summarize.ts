import { openai as aiOpenai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Firecrawl API configuration
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const FIRECRAWL_BASE_URL = 'https://api.firecrawl.dev';

// Types for Firecrawl v1 API integration
interface FirecrawlV1Response {
  success: boolean;
  data?: {
    content?: string;
    markdown?: string;
    metadata?: {
      title?: string;
      description?: string;
      author?: string;
      publishedDate?: string;
      language?: string;
      siteName?: string;
    };
    links?: string[];
    images?: string[];
  };
  error?: string;
}

interface FirecrawlV1Options {
  onlyMainContent?: boolean;
  waitFor?: number;
  maxRetries?: number;
}

// Helper function to extract text from URL using Firecrawl v1
// NOTE: This extracts content from ONLY the specified URL, not linked subpages
export async function extractTextFromUrl(url: string, options: FirecrawlV1Options = {}) {
  const { onlyMainContent = true, waitFor = 2000, maxRetries = 2 } = options;

  // If Firecrawl API key is not configured, fall back to simple fetch
  if (!FIRECRAWL_API_KEY) {
    console.log('Firecrawl API key not configured, using fallback method');
    return extractTextFromUrlFallback(url);
  }

  // Validate URL
  if (!isValidUrl(url)) {
    throw new Error('Invalid URL provided');
  }

  // Retry logic for Firecrawl
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${FIRECRAWL_BASE_URL}/v1/scrape`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          // Only include essential parameters that are definitely supported
          onlyMainContent,
          waitFor,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Firecrawl v1 API error (attempt ${attempt}):`, response.status, errorText);

        // If it's a 4xx error (client error), don't retry
        if (response.status >= 400 && response.status < 500) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
        continue;
      }

      const data: FirecrawlV1Response = await response.json();

      if (!data.success) {
        console.error('Firecrawl v1 API returned error:', data.error);
        // If no content found, try fallback
        console.warn('Firecrawl v1 failed, trying fallback');
        return extractTextFromUrlFallback(url);
      }

      // Extract the main content from Firecrawl v1 response
      // Prioritize markdown since that's what the v1 API returns
      if (data.data?.markdown) {
        console.log('Successfully extracted content using Firecrawl v1');
        return data.data.markdown;
      }

      if (data.data?.content) {
        console.log('Successfully extracted content using Firecrawl v1');
        return data.data.content;
      }

      // If no content found, try fallback
      console.warn('No content found in Firecrawl v1 response, trying fallback');
      return extractTextFromUrlFallback(url);
    } catch (error) {
      console.error(`Error using Firecrawl v1 (attempt ${attempt}):`, error);

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // If all attempts failed, fall back to simple fetch
  console.warn('All Firecrawl v1 attempts failed, using fallback method');
  return extractTextFromUrlFallback(url);
}

// Fallback function using simple fetch (original implementation)
async function extractTextFromUrlFallback(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Metadachi/1.0; +https://metadachi.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Basic text extraction - you might want to use a proper HTML parser
    const text = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) {
      throw new Error('No text content extracted from URL');
    }

    return text;
  } catch (error) {
    console.error('Error fetching URL:', error);
    throw new Error('Failed to fetch URL content');
  }
}

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Shared summarization function
export async function generateSummary(
  text: string,
  customInstructions?: string,
  model: 'gpt-4.1-mini' | 'gpt-4.1-nano' = 'gpt-4.1-mini'
) {
  const { object } = await generateObject({
    model: aiOpenai(model),
    schema: z.object({
      title: z.string().describe('A concise title that captures the main topic or theme'),
      summary: z.string().describe('A clear and valuable summary focusing on key insights'),
      keyPoints: z.array(z.string()).describe('Up to 3-5 maximum important takeaways and insights'),
      quotes: z
        .array(z.string())
        .optional()
        .default([])
        .describe('An array of surprising or particularly valuable details'),
      tags: z.array(z.string()).describe('An array of relevant tags to categorize the content'),
    }),
    prompt: `Please analyze the following text and provide a structured response. If the text is a URL, analyze its content. If it's direct text, analyze that text.

${
  customInstructions
    ? `IMPORTANT: Please follow these specific instructions for the summary:
${customInstructions}

`
    : ''
}Text to analyze:
${text}`,
    system: `Please analyze the following text and provide a structured response.

Your job is to extract the most useful insights, ideas, or takeaways — not just rewrite the text.
${
  customInstructions
    ? `IMPORTANT: Please follow these specific instructions for the summary:
${customInstructions}\n`
    : ''
}

1. **Summarize for clarity and value**  
   • Focus on key ideas, useful details, and especially notable or surprising points.  
   • Don't include everything — prioritize what matters.  
   • Use bullet points, headings, or short paragraphs if appropriate.
   • For keyPoints: Choose only the 3-5 most essential takeaways.

2. **Avoid generic phrasing**  
   • Skip introductions like "This article discusses..."  
   • Don't copy large blocks of text.  
   • If the content lacks useful information, say that directly.

3. **Think before summarizing**  
   • Ask: "What would a busy person want to know at a glance?"  
   • Be thoughtful — don't blindly compress every sentence.`,
  });

  return object;
}
