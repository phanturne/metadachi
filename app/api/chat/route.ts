import { createClient } from "@/utils/supabase/server"
import { openai } from "@ai-sdk/openai"
import type { SupabaseClient } from "@supabase/supabase-js"
import { streamText, tool } from "ai"
import type { NextRequest } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

interface MatchResult {
  source_id: string
  chunk_index: number
  chunk_text: string
  context_before: string[]
  context_after: string[]
  similarity: number
}

interface FormattedSource {
  id: string
  source_id: string
  chunk_index: number
  content: string
  similarity: number
}

interface SearchResult {
  success: boolean
  message: string
  sources: FormattedSource[]
}

async function generateEmbedding(text: string): Promise<number[]> {
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const response = await openaiClient.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  })
  return response.data[0].embedding
}

async function searchSources(query: string, supabase: SupabaseClient): Promise<MatchResult[]> {
  try {
    const queryEmbedding = await generateEmbedding(query)

    const { data: relevantContent, error: matchError } = await supabase.rpc("match_sources", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.2,
      match_count: 5,
      context_size: 1,
    })

    if (matchError) {
      console.error("Error finding relevant content:", matchError)
      return []
    }

    return relevantContent as MatchResult[]
  } catch (error) {
    console.error("Error in searchSources:", error)
    return []
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const json = await req.json()
  const { messages } = json as { messages: Message[] }

  if (!messages || messages.length === 0) {
    return new Response("No messages provided", { status: 400 })
  }

  try {
    // Define the search tool
    const searchSourcesTool = tool({
      description:
        "Search through the available sources to find relevant information for answering user questions. Always use this tool first when a user asks a question.",
      parameters: z.object({
        query: z.string().describe("The search query to find relevant information"),
      }),
      execute: async ({ query }): Promise<SearchResult> => {
        console.log(`Searching sources for: ${query}`)

        const results = await searchSources(query, supabase)

        if (results.length === 0) {
          return {
            success: false,
            message: "No relevant sources found for this query",
            sources: [],
          }
        }

        const formattedResults: FormattedSource[] = results.map((match, index) => {
          const beforeContext = match.context_before.join(" ")
          const afterContext = match.context_after.join(" ")
          const fullContext = `${beforeContext} ${match.chunk_text} ${afterContext}`.trim()

          return {
            id: `source_${index + 1}`,
            source_id: match.source_id,
            chunk_index: match.chunk_index,
            content: fullContext,
            similarity: match.similarity,
          }
        })

        return {
          success: true,
          message: `Found ${results.length} relevant sources`,
          sources: formattedResults,
        }
      },
    })

    // Use AI SDK's streamText function with tools
    const result = streamText({
      model: openai("gpt-4.1-nano"),
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant that answers questions based on available sources.

IMPORTANT INSTRUCTIONS:
1. For every user question, FIRST use the searchSources tool to find relevant information
2. After getting the search results, provide a comprehensive answer based ONLY on the information found in the sources
3. Always cite your sources by mentioning the source_id (e.g., "According to source abc123...")
4. If no relevant information is found, clearly state that you couldn't find information about the topic in the available sources
5. Do not make up information that isn't in the sources
6. Be specific about what information came from which source
7. Provide detailed answers when relevant sources are found

Remember: Always search first, then answer based on the search results.`,
        },
        ...messages,
      ],
      tools: {
        searchSources: searchSourcesTool,
      },
      maxSteps: 3, // Allow multiple steps: search tool -> get results -> generate answer
    })

    // Return the data stream that useChat expects
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat completion:", error)
    return new Response("Error generating chat response", { status: 500 })
  }
}
