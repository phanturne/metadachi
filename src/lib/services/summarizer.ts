import { getEnv } from "@/lib/env";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: getEnv("OPENAI_API_KEY"),
});

export interface SourceSummary {
  summary: string;
  keyPoints: string[];
  topics: string[];
  wordCount: number;
}

/**
 * Generate a summary, key points, and topics for source content
 */
export async function generateSummary(
  textContent: string,
): Promise<SourceSummary> {
  const wordCount = textContent
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const prompt = `Analyze the following text and provide:
1. A concise summary (2-3 paragraphs)
2. Key points (5-7 bullet points)
3. Main topics (3-5 topics)

Text:
${textContent}

Respond in JSON format:
{
  "summary": "concise summary here",
  "keyPoints": ["point 1", "point 2", ...],
  "topics": ["topic 1", "topic 2", ...]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that analyzes text and provides structured summaries. Always respond with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const responseContent = response.choices[0]?.message?.content;
  if (!responseContent) {
    throw new Error("Failed to generate summary");
  }

  try {
    const parsed = JSON.parse(responseContent) as {
      summary: string;
      keyPoints: string[];
      topics: string[];
    };

    return {
      summary: parsed.summary,
      keyPoints: parsed.keyPoints || [],
      topics: parsed.topics || [],
      wordCount,
    };
  } catch (error) {
    throw new Error(`Failed to parse summary response: ${error}`);
  }
}
