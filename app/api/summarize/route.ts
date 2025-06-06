import type { NextRequest } from 'next/server';
import { extractTextFromUrl, generateSummary } from '../../lib/summarize';

export async function POST(req: NextRequest) {
  try {
    // Extract data from request body
    const { prompt, inputType, customInstructions } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'No input provided' }, { status: 400 });
    }

    let textToAnalyze = '';
    if (inputType === 'url') {
      try {
        textToAnalyze = await extractTextFromUrl(prompt);
      } catch {
        return Response.json({ error: 'Failed to process URL' }, { status: 400 });
      }
    } else {
      // For text input, use the content directly
      textToAnalyze = prompt;
    }

    if (!textToAnalyze.trim()) {
      return Response.json({ error: 'No text provided' }, { status: 400 });
    }

    const summary = await generateSummary(textToAnalyze, customInstructions);
    return Response.json(summary);
  } catch (error) {
    console.error('Error generating summary:', error);
    return Response.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
