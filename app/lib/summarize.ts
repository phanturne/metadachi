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
