"use server";

import {
  createNotebookSchema,
  updateNotebookSchema,
} from "@/lib/validation/notebooks";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createNotebook(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string | null,
    visibility: (formData.get("visibility") as string) || "private",
  };

  const validatedData = createNotebookSchema.parse(rawData);

  const { data, error } = await supabase
    .from("notebooks")
    .insert({
      user_id: user.id,
      title: validatedData.title,
      description: validatedData.description || null,
      visibility: validatedData.visibility,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create notebook: ${error.message}`);
  }

  revalidatePath("/notebooks");
  redirect(`/notebooks/${data.id}`);
}

export async function updateNotebook(formData: FormData) {
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

  // Verify ownership
  const { data: notebook, error: fetchError } = await supabase
    .from("notebooks")
    .select("user_id")
    .eq("id", notebookId)
    .single();

  if (fetchError || !notebook || notebook.user_id !== user.id) {
    throw new Error("Not authorized to update this notebook");
  }

  const rawData = {
    title: formData.get("title") as string | null,
    description: formData.get("description") as string | null,
    visibility: formData.get("visibility") as string | null,
  };

  const validatedData = updateNotebookSchema.parse(rawData);

  const { error } = await supabase
    .from("notebooks")
    .update(validatedData)
    .eq("id", notebookId);

  if (error) {
    throw new Error(`Failed to update notebook: ${error.message}`);
  }

  revalidatePath("/notebooks");
  revalidatePath(`/notebooks/${notebookId}`);
  redirect(`/notebooks/${notebookId}`);
}

export async function deleteNotebook(notebookId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Verify ownership
  const { data: notebook, error: fetchError } = await supabase
    .from("notebooks")
    .select("user_id")
    .eq("id", notebookId)
    .single();

  if (fetchError || !notebook || notebook.user_id !== user.id) {
    throw new Error("Not authorized to delete this notebook");
  }

  const { error } = await supabase
    .from("notebooks")
    .delete()
    .eq("id", notebookId);

  if (error) {
    throw new Error(`Failed to delete notebook: ${error.message}`);
  }

  revalidatePath("/notebooks");
  redirect("/notebooks");
}
