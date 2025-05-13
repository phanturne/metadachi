import { openai as aiOpenai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import type { NextRequest } from "next/server"
import { z } from "zod"

// Helper function to extract text from URL
async function extractTextFromUrl(url: string) {
  try {
    const response = await fetch(url)
    const html = await response.text()
    // Basic text extraction - you might want to use a proper HTML parser
    const text = html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    return text
  } catch (error) {
    console.error("Error fetching URL:", error)
    throw new Error("Failed to fetch URL content")
  }
}

export async function POST(req: NextRequest) {
  try {
    // Extract data from request body
    const { prompt, inputType } = await req.json()

    if (!prompt) {
      return Response.json({ error: "No input provided" }, { status: 400 })
    }

    let textToAnalyze = ""
    if (inputType === "url") {
      try {
        textToAnalyze = await extractTextFromUrl(prompt)
      } catch (error) {
        return Response.json({ error: "Failed to process URL" }, { status: 400 })
      }
    } else {
      // For text input, use the content directly
      textToAnalyze = prompt
    }

    if (!textToAnalyze.trim()) {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: aiOpenai("gpt-4.1-nano"),
      schema: z.object({
        summary: z.string().describe("A concise summary in 2-3 paragraphs"),
        keyPoints: z.array(z.string()).describe("An array of key insights as bullet points"),
        quotes: z.array(z.string()).describe("An array of notable quotes or statistics"),
      }),
      prompt: `Please analyze the following text and provide a structured response. If the text is a URL, analyze its content. If it's direct text, analyze that text:

${textToAnalyze}`,
      system:
        "You are a helpful AI assistant that specializes in analyzing and summarizing text. Provide clear, concise, and well-structured summaries with key insights. Always analyze the provided text, whether it's direct text or content from a URL.",
    })

    // Return the object as JSON
    return Response.json(object)
  } catch (error) {
    console.error("Error generating summary:", error)
    return Response.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}