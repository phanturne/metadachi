import { openai as aiOpenai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Helper function to extract text from URL
export async function extractTextFromUrl(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    // Basic text extraction - you might want to use a proper HTML parser
    const text = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text;
  } catch (error) {
    console.error('Error fetching URL:', error);
    throw new Error('Failed to fetch URL content');
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
      summary: z.string().describe('A concise summary in 2-3 paragraphs'),
      keyPoints: z.array(z.string()).describe('An array of key insights as bullet points'),
      quotes: z.array(z.string()).describe('An array of notable quotes or statistics'),
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
    system:
      "You are a helpful AI assistant that specializes in analyzing and summarizing text. Provide clear, concise, and well-structured summaries with key insights. Always analyze the provided text, whether it's direct text or content from a URL. Generate relevant tags to categorize the content based on its main themes and topics. When custom instructions are provided, prioritize following them exactly.",
  });

  return object;
}
