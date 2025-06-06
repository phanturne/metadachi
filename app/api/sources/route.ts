import { Database } from "@/supabase/types"
import { createClient } from "@/utils/supabase/server"
import { NextRequest } from "next/server"
import OpenAI from "openai"
import { checkRateLimit, createRateLimitResponse, shouldUseSmallerModel } from "../../lib/rate-limit"
import { extractTextFromUrl, generateSummary } from "../../lib/summarize"
import { splitTextIntoChunks } from "../../lib/text"

const openai = new OpenAI()

async function extractTextFromFile(file: File, fileType: string): Promise<string> {
  const buffer = await file.arrayBuffer()
  
  switch (fileType) {
    case 'application/pdf':
      try {
        // Use pdf-parse for simpler PDF handling
        const pdfParse = (await import('pdf-parse')).default
        const data = await pdfParse(Buffer.from(buffer))
        return data.text
      } catch (error) {
        console.error("Error parsing PDF:", error)
        throw new Error("Failed to parse PDF file")
      }

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      try {
        // Dynamically import mammoth only when needed
        const mammoth = (await import('mammoth')).default
        // Convert ArrayBuffer to Buffer for mammoth
        const docxBuffer = Buffer.from(buffer)
        
        // Convert to HTML with style information
        const result = await mammoth.convertToHtml({ buffer: docxBuffer })
        return result.value
      } catch (error) {
        console.error("Error parsing DOCX:", error)
        throw new Error("Failed to parse Word document")
      }

    case 'application/msword':
      throw new Error("Legacy .doc format is not supported. Please convert to .docx format.")

    case 'text/plain':
    case 'text/markdown':
    case 'text/html':
      try {
        const textDecoder = new TextDecoder()
        return textDecoder.decode(buffer)
      } catch (error) {
        console.error("Error decoding text file:", error)
        throw new Error("Failed to decode text file")
      }

    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

interface Summary {
  title: string;
  summary: string;
  keyPoints: string[];
  quotes: string[];
  tags: string[];
}

// Process source in background
async function processSourceInBackground(
  userId: string,
  type: string,
  sourceContent: string,
  summary: Summary,
  fileInfo: {
    fileName: string | null,
    filePath: string | null,
    fileSize: number | null,
    fileType: string | null,
    url: string | null
  },
  customInstructions: string | null
) {
  const supabase = await createClient()
  
  try {
    // Create source
    const sourceResult = await supabase
      .from("sources")
      .insert({
        type: type.toUpperCase() as Database["public"]["Enums"]["source_type"],
        title: type.toUpperCase() === "FILE" ? fileInfo.fileName || "Untitled" : summary.title,
        content: type.toUpperCase() === "FILE" ? null : sourceContent,
        url: type.toUpperCase() === "URL" ? fileInfo.url : null,
        file_name: type.toUpperCase() === "FILE" ? fileInfo.fileName : null,
        file_path: type.toUpperCase() === "FILE" ? fileInfo.filePath : null,
        file_size: type.toUpperCase() === "FILE" ? fileInfo.fileSize : null,
        file_type: type.toUpperCase() === "FILE" ? fileInfo.fileType : null,
        visibility: "PRIVATE" as Database["public"]["Enums"]["visibility_type"],
        user_id: userId
      })
      .select()
      .single()

    if (sourceResult.error || !sourceResult.data) {
      console.error("Error creating source:", sourceResult.error)
      return
    }

    // Create summary
    const summaryResult = await supabase
      .from("summaries")
      .insert({
        source_id: sourceResult.data.id,
        summary_text: summary.summary,
        key_points: summary.keyPoints,
        quotes: summary.quotes,
        tags: summary.tags,
        style: "default",
        user_id: userId,
        visibility: 'PRIVATE',
        custom_instructions: customInstructions
      })

    if (summaryResult.error) {
      console.error("Error creating summary:", summaryResult.error)
      return
    }

    // Generate embeddings for text chunks
    const chunks = splitTextIntoChunks(sourceContent)
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const embedding = await generateEmbedding(chunk)
      await supabase.from("source_embeddings").insert({
        source_id: sourceResult.data.id,
        chunk_index: i,
        chunk_text: chunk,
        embedding: JSON.stringify(embedding)
      })
    }

    // Update source status
    await supabase
      .from("sources")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sourceResult.data.id)

  } catch (error) {
    console.error("Error processing source in background:", error)
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  })
  return response.data[0].embedding
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  
  try {
    const formData = await req.formData()
    const type = formData.get("type") as string
    const content = formData.get("content") as string
    const url = formData.get("url") as string
    const customInstructions = formData.get("customInstructions") as string | null
    const file = formData.get("file") as File | null

    if (!type || (!content && !url && !file)) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get or create user
    let user = null
    try {
      const { data: { user: existingUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !existingUser) {
        const { data: guestData, error: guestError } = await supabase.auth.signInAnonymously()
        if (guestError || !guestData.user) {
          return Response.json({ error: "Failed to create guest account" }, { status: 401 })
        }
        user = guestData.user
      } else {
        user = existingUser
      }
    } catch (error) {
      console.error("Error in user authentication:", error)
      return Response.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!user) {
      return Response.json({ error: "No user found" }, { status: 401 })
    }

    // Check rate limit early
    const rateLimitInfo = await checkRateLimit("sources", user.id, !!user.email)
    const rateLimitResponse = createRateLimitResponse(rateLimitInfo)
    
    if (rateLimitResponse instanceof Response) {
      return rateLimitResponse
    }

    // Process content
    let sourceContent = content
    let fileName: string | null = null
    let filePath: string | null = null
    let fileSize: number | null = null
    let fileType: string | null = null

    if (type === "FILE" && file) {
      const fileBuffer = await file.arrayBuffer()
      const fileExt = file.name.split('.').pop()
      const uniqueFileName = `${Date.now()}.${fileExt}`
      filePath = `${user.id}/${uniqueFileName}`
      fileName = file.name
      fileSize = file.size
      fileType = file.type

      // Upload file and extract content in parallel
      const [uploadResult, extractedContent] = await Promise.all([
        supabase.storage
          .from('source_files')
          .upload(filePath, fileBuffer, {
            contentType: file.type,
            upsert: true
          }),
        extractTextFromFile(file, fileType)
      ])

      if (uploadResult.error) {
        console.error("Error uploading file:", uploadResult.error)
        return Response.json({ error: "Failed to upload file" }, { status: 500 })
      }

      if (!extractedContent) {
        throw new Error("Failed to extract content from file")
      }
      sourceContent = extractedContent
    } else if (type === "URL" && url) {
      try {
        sourceContent = await extractTextFromUrl(url)
        if (!sourceContent) {
          throw new Error("Failed to extract content from URL")
        }
      } catch (error) {
        console.error("Error extracting text from URL:", error)
        return Response.json({ error: "Failed to process URL" }, { status: 400 })
      }
    }

    // Generate summary with model fallback
    const useSmallerModel = shouldUseSmallerModel(rateLimitInfo)
    const summary = await generateSummary(
      sourceContent || "", 
      customInstructions || undefined,
      useSmallerModel ? "gpt-4.1-nano" : "gpt-4.1-mini"
    )

    // Process everything in background
    processSourceInBackground(
      user.id,
      type,
      sourceContent || "",
      summary,
      {
        fileName,
        filePath,
        fileSize,
        fileType,
        url: type === "URL" ? url : null
      },
      customInstructions
    ).catch(console.error)

    // Return response immediately
    return Response.json({
      title: type.toUpperCase() === "FILE" ? fileName : summary.title,
      summary: summary.summary,
      keyPoints: summary.keyPoints,
      quotes: summary.quotes,
      tags: summary.tags,
      fileSize: fileSize,
      fileName: fileName,
      isGuest: !user.email,
      usedSmallerModel: useSmallerModel,
      rateLimit: {
        remaining: rateLimitInfo.remaining,
        limit: rateLimitInfo.limit,
        transitionMessage: rateLimitResponse.transitionMessage,
        isTransitioningToSmallerModel: rateLimitResponse.isTransitioningToSmallerModel
      }
    }, {
      headers: rateLimitResponse.headers
    })
  } catch (error) {
    console.error("Error creating source:", error)
    return Response.json({ error: "Failed to create source" }, { status: 500 })
  }
} 
