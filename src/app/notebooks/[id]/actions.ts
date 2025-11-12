"use server";

import {
  type CreateSourceInput,
  createSourceSchema,
  updateSourceSchema,
} from "@/lib/validation/sources";
import { createClient } from "@/utils/supabase/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSource(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const notebookId = formData.get("notebook_id") as string;
  if (!notebookId) {
    throw new Error("Notebook ID is required");
  }

  // Verify notebook ownership
  const { data: notebook, error: fetchError } = await supabase
    .from("notebooks")
    .select("user_id")
    .eq("id", notebookId)
    .single();

  if (fetchError || !notebook || notebook.user_id !== user.id) {
    throw new Error("Not authorized to add sources to this notebook");
  }

  const sourceType = (formData.get("source_type") as string) || "text";

  // Helper to convert formData values to null (Zod will transform to undefined)
  const getFormValue = (key: string): string | null => {
    const value = formData.get(key);
    if (value === null || value === undefined || value === "") {
      return null;
    }
    return value as string;
  };

  // Handle file upload if source type is "file"
  let filePath: string | null = null;
  let fileType: string | null = null;
  let fileSize: number | null = null;
  let generatedSourceId: string | null = null;

  if (sourceType === "file") {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      throw new Error("File is required for file sources");
    }

    // Generate source ID for the file path
    generatedSourceId = randomUUID();
    // Sanitize filename to prevent path traversal
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${user.id}/${notebookId}/${generatedSourceId}/${sanitizedFileName}`;

    // Upload file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("sources")
      .upload(storagePath, file, {
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    filePath = storagePath;
    fileType =
      file.type || getFormValue("file_type") || "application/octet-stream";
    fileSize = file.size;
  }

  const fileSizeValue = formData.get("file_size");
  const parsedFileSize =
    fileSizeValue && fileSizeValue !== ""
      ? Number.parseInt(fileSizeValue as string, 10)
      : null;

  const metadataValue = formData.get("metadata");
  const metadata =
    metadataValue && metadataValue !== ""
      ? JSON.parse(metadataValue as string)
      : null;

  const rawData = {
    notebook_id: notebookId,
    title: formData.get("title") as string,
    source_type: sourceType,
    content: getFormValue("content"),
    source_url: getFormValue("source_url"),
    file_path: filePath || getFormValue("file_path"),
    file_type: fileType || getFormValue("file_type"),
    file_size: fileSize || parsedFileSize,
    metadata: metadata,
  };

  let validatedData: CreateSourceInput;
  try {
    validatedData = createSourceSchema.parse(rawData);
  } catch (validationError) {
    // Clean up uploaded file if validation fails
    if (filePath && sourceType === "file") {
      await supabase.storage.from("sources").remove([filePath]);
    }
    throw validationError;
  }

  const insertData: {
    id?: string;
    notebook_id: string;
    title: string;
    source_type: string;
    content: string | null;
    source_url: string | null;
    file_path: string | null;
    file_type: string | null;
    file_size: number | null;
    metadata: Record<string, unknown>;
    status: string;
  } = {
    notebook_id: validatedData.notebook_id,
    title: validatedData.title,
    source_type: validatedData.source_type,
    content: validatedData.content || null,
    source_url: validatedData.source_url || null,
    file_path: validatedData.file_path || null,
    file_type: validatedData.file_type || null,
    file_size: validatedData.file_size || null,
    metadata: validatedData.metadata || {},
    status: "processing",
  };

  // Use generated source ID if we created one for file upload
  if (generatedSourceId) {
    insertData.id = generatedSourceId;
  }

  const { data: newSource, error } = await supabase
    .from("sources")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    // Clean up uploaded file if source creation fails
    if (filePath && sourceType === "file") {
      await supabase.storage.from("sources").remove([filePath]);
    }
    throw new Error(`Failed to create source: ${error.message}`);
  }

  revalidatePath(`/notebooks/${notebookId}`);

  // Trigger processing for text, file, and URL sources asynchronously (fire and forget)
  if (
    (validatedData.source_type === "text" && validatedData.content) ||
    (validatedData.source_type === "file" && validatedData.file_path) ||
    (validatedData.source_type === "url" && validatedData.source_url)
  ) {
    if (newSource) {
      // Process in background without blocking the redirect
      // Pass the existing Supabase client to preserve auth context
      import("@/lib/services/process-source")
        .then(({ processSource }) => processSource(newSource.id, supabase))
        .catch((err) => {
          console.error("Failed to process source in background:", err);
        });
    }
  }

  redirect(`/notebooks/${notebookId}`);
}

export async function updateSource(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const notebookId = formData.get("notebook_id") as string;
  const sourceId = formData.get("source_id") as string;

  if (!notebookId || !sourceId) {
    throw new Error("Notebook ID and Source ID are required");
  }

  // Verify notebook ownership
  const { data: notebook, error: fetchError } = await supabase
    .from("notebooks")
    .select("user_id")
    .eq("id", notebookId)
    .single();

  if (fetchError || !notebook || notebook.user_id !== user.id) {
    throw new Error("Not authorized to update sources in this notebook");
  }

  // Helper to convert formData values to null (Zod will transform to undefined)
  const getFormValue = (key: string): string | null => {
    const value = formData.get(key);
    if (value === null || value === undefined || value === "") {
      return null;
    }
    return value as string;
  };

  const fileSizeValue = formData.get("file_size");
  const fileSize =
    fileSizeValue && fileSizeValue !== ""
      ? Number.parseInt(fileSizeValue as string, 10)
      : null;

  const metadataValue = formData.get("metadata");
  const metadata =
    metadataValue && metadataValue !== ""
      ? JSON.parse(metadataValue as string)
      : null;

  const rawData = {
    title: getFormValue("title"),
    source_type: getFormValue("source_type"),
    content: getFormValue("content"),
    source_url: getFormValue("source_url"),
    file_path: getFormValue("file_path"),
    file_type: getFormValue("file_type"),
    file_size: fileSize,
    metadata: metadata,
  };

  const validatedData = updateSourceSchema.parse(rawData);

  const { error } = await supabase
    .from("sources")
    .update(validatedData)
    .eq("id", sourceId);

  if (error) {
    throw new Error(`Failed to update source: ${error.message}`);
  }

  revalidatePath(`/notebooks/${notebookId}`);
  redirect(`/notebooks/${notebookId}/sources/${sourceId}`);
}

export async function deleteSource(notebookId: string, sourceId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Verify notebook ownership
  const { data: notebook, error: fetchError } = await supabase
    .from("notebooks")
    .select("user_id")
    .eq("id", notebookId)
    .single();

  if (fetchError || !notebook || notebook.user_id !== user.id) {
    throw new Error("Not authorized to delete sources from this notebook");
  }

  const { error } = await supabase.from("sources").delete().eq("id", sourceId);

  if (error) {
    throw new Error(`Failed to delete source: ${error.message}`);
  }

  revalidatePath(`/notebooks/${notebookId}`);
}
