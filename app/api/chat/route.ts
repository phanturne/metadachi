import { createClient } from '@/utils/supabase/server';
import { openai } from '@ai-sdk/openai';
import type { SupabaseClient } from '@supabase/supabase-js';
import { streamText, tool } from 'ai';
import type { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface MatchResult {
  source_id: string;
  chunk_index: number;
  chunk_text: string;
  context_before: string[];
  context_after: string[];
  similarity: number;
  source_metadata?: {
    id: string;
    type: 'TEXT' | 'URL' | 'FILE';
    file_name: string | null;
    url: string | null;
  };
}

interface FormattedSource {
  id: string;
  source_id: string;
  chunk_index: number;
  content: string;
  similarity: number;
  type: 'TEXT' | 'URL' | 'FILE';
  file_name: string | null;
  url: string | null;
}

interface SearchResult {
  success: boolean;
  message: string;
  sources: FormattedSource[];
}

async function generateEmbedding(text: string): Promise<number[]> {
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openaiClient.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

async function searchSources(query: string, supabase: SupabaseClient): Promise<MatchResult[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data: relevantContent, error: matchError } = await supabase.rpc('match_sources', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.2,
      match_count: 5,
      context_size: 1,
    });

    if (matchError) {
      console.error('Error finding relevant content:', matchError);
      return [];
    }

    // Get source metadata for each match
    const sourceIds = [
      ...new Set(relevantContent.map((match: { source_id: string }) => match.source_id)),
    ];
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('id, type, file_name, url')
      .in('id', sourceIds);

    if (sourcesError) {
      console.error('Error fetching source metadata:', sourcesError);
      return relevantContent as MatchResult[];
    }

    // Add source metadata to matches
    const matchesWithMetadata = relevantContent.map((match: { source_id: string }) => ({
      ...match,
      source_metadata: sources.find(s => s.id === match.source_id),
    }));

    return matchesWithMetadata as MatchResult[];
  } catch (error) {
    console.error('Error in searchSources:', error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const json = await req.json();
  const { messages, sourceIds } = json as { messages: Message[]; sourceIds: string[] };

  if (!messages || messages.length === 0) {
    return new Response('No messages provided', { status: 400 });
  }

  try {
    // Get source metadata for context
    const { data: sources } = await supabase
      .from('sources')
      .select('id, type, file_name, url')
      .in('id', sourceIds);

    const sourceContext =
      sources
        ?.map(s => `- ${s.file_name || s.url || 'Text Source'} (${s.type.toLowerCase()})`)
        .join('\n') || 'No sources available';

    // Define the search tool
    const searchSourcesTool = tool({
      description:
        'Search through the available sources to find relevant information for answering user questions.',
      parameters: z.object({
        query: z.string().describe('The search query to find relevant information'),
      }),
      execute: async ({ query }): Promise<SearchResult> => {
        console.log(`Searching sources for: ${query}`);

        const results = await searchSources(query, supabase);

        if (results.length === 0) {
          return {
            success: false,
            message: 'No relevant sources found for this query',
            sources: [],
          };
        }

        const formattedResults: FormattedSource[] = results.map((match: MatchResult, index) => {
          const beforeContext = match.context_before.join(' ');
          const afterContext = match.context_after.join(' ');
          const fullContext = `${beforeContext} ${match.chunk_text} ${afterContext}`.trim();

          return {
            id: `source_${index + 1}`,
            source_id: match.source_id,
            chunk_index: match.chunk_index,
            content: fullContext,
            similarity: match.similarity,
            type: match.source_metadata?.type || 'TEXT',
            file_name: match.source_metadata?.file_name || null,
            url: match.source_metadata?.url || null,
          };
        });

        return {
          success: true,
          message: `Found ${results.length} relevant sources`,
          sources: formattedResults,
        };
      },
    });

    // Use AI SDK's streamText function with tools
    const result = streamText({
      model: openai('gpt-4.1-nano'),
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant with access to the following sources:

${sourceContext}

INSTRUCTIONS:
1. For general conversation or questions you can answer confidently, respond directly
2. When you're unsure or need specific information, use the searchSources tool
3. Always cite sources when using information from them
4. If no relevant information is found, say so clearly
5. Never make up information

Remember: Search when you need information from the sources, but feel free to respond directly to general questions.`,
        },
        ...messages,
      ],
      tools: {
        searchSources: searchSourcesTool,
      },
      maxSteps: 3,
    });

    // Return the data stream that useChat expects
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat completion:', error);
    return new Response('Error generating chat response', { status: 500 });
  }
}
