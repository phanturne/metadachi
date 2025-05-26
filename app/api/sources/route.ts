import { createClient } from "@/utils/supabase/server"
import { NextRequest } from "next/server"
import OpenAI from "openai"
import { extractTextFromUrl, generateSummary } from "../../lib/summarize"
import { splitTextIntoChunks } from "../../lib/text"

const openai = new OpenAI()

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  })
  return response.data[0].embedding
}

// Process source in background
async function processSourceInBackground(sourceId: string, content: string) {
  const supabase = await createClient()
  
  try {
    // Generate embeddings for text chunks
    const chunks = splitTextIntoChunks(content)
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const embedding = await generateEmbedding(chunk)
      await supabase.from("source_embeddings").insert({
        source_id: sourceId,
        chunk_index: i,
        chunk_text: chunk,
        embedding: JSON.stringify(embedding)
      })
    }

    // Update source status
    await supabase
      .from("sources")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sourceId)

  } catch (error) {
    console.error("Error processing source:", error)
    const supabase = await createClient()
    await supabase
      .from("sources")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sourceId)
  }
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

    // Get user first to ensure authentication
    const { data: { user: existingUser }, error: userError } = await supabase.auth.getUser()
    if (userError || !existingUser) {
      // Try to sign in anonymously if no user exists
      const { data: guestData, error: guestError } = await supabase.auth.signInAnonymously()
      if (guestError || !guestData.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    let sourceContent = content
    let fileName: string | null = null
    let filePath: string | null = null
    let fileSize: number | null = null
    let fileType: string | null = null

    if (type === "FILE" && file) {
      // Get the current user (either existing or newly created guest)
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Upload file to Supabase Storage with user's ID in the path
      const fileBuffer = await file.arrayBuffer()
      const fileExt = file.name.split('.').pop()
      const uniqueFileName = `${Date.now()}.${fileExt}`
      filePath = `${currentUser.id}/${uniqueFileName}`
      fileName = file.name // Store original file name

      const { error: uploadError } = await supabase.storage
        .from('source_files')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: true
        })

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        return Response.json({ error: "Failed to upload file" }, { status: 500 })
      }

      fileSize = file.size
      fileType = file.type
      
      // Get file content for immediate summary
      try {
        const textDecoder = new TextDecoder()
        sourceContent = textDecoder.decode(fileBuffer)
        
        if (!sourceContent) {
          throw new Error("Failed to extract content from file")
        }
      } catch (error) {
        console.error("Error extracting text from file:", error)
        return Response.json({ error: "Failed to process file" }, { status: 400 })
      }
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

    // Generate summary immediately
    const summary = await generateSummary(sourceContent || "", customInstructions || undefined)

    // Create source in background
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Start background processing for database operations
    Promise.all([
      // Create source record
      supabase
        .from("sources")
        .insert({
          type: type.toUpperCase() as "TEXT" | "URL" | "FILE",
          content: type.toUpperCase() === "FILE" ? null : sourceContent,
          url: type.toUpperCase() === "URL" ? url : null,
          file_name: type.toUpperCase() === "FILE" ? fileName : null,
          file_path: type.toUpperCase() === "FILE" ? filePath : null,
          file_size: type.toUpperCase() === "FILE" ? fileSize : null,
          file_type: type.toUpperCase() === "FILE" ? fileType : null,
          visibility: 'PRIVATE',
          user_id: user.id
        })
        .select()
        .single()
        .then(async ({ data: source, error: sourceError }) => {
          if (sourceError || !source) {
            throw sourceError || new Error("Failed to create source")
          }

          // Store the summary
          await supabase
            .from("summaries")
            .insert({
              source_id: source.id,
              summary_text: summary.summary,
              key_points: summary.keyPoints,
              quotes: summary.quotes,
              tags: summary.tags,
              style: "default",
              user_id: user.id,
              visibility: 'PRIVATE',
              custom_instructions: customInstructions
            })

          // Process embeddings in background
          processSourceInBackground(source.id, sourceContent || "").catch(console.error)
        })
    ]).catch(console.error)

    // Return summary immediately with file info
    return Response.json({
      summary: summary.summary,
      keyPoints: summary.keyPoints,
      quotes: summary.quotes,
      tags: summary.tags,
      fileSize: fileSize,
      fileName: fileName
    })
  } catch (error) {
    console.error("Error creating source:", error)
    return Response.json({ error: "Failed to create source" }, { status: 500 })
  }
} 
