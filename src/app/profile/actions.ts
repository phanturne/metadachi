"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const displayName =
    (formData.get("display_name") as string | null) || undefined;
  const username = (formData.get("username") as string | null) || undefined;
  const email = (formData.get("email") as string | null) || undefined;
  const avatarPath =
    (formData.get("avatar_path") as string | null) || undefined;

  // update email via auth if changed
  if (email && email !== user.email) {
    await supabase.auth.updateUser({ email });
  }

  const updatePayload: Record<string, string> = {};
  if (displayName) updatePayload.display_name = displayName;
  if (username) updatePayload.username = username;
  if (email) updatePayload.email = email;
  if (avatarPath) updatePayload.avatar_url = avatarPath;

  if (Object.keys(updatePayload).length > 0) {
    await supabase.from("profiles").update(updatePayload).eq("id", user.id);
  }

  revalidatePath("/profile");
}
