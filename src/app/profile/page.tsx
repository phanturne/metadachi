import { createClient } from "@/utils/supabase/server";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, username, display_name, avatar_url")
    .eq("id", user.id)
    .single();

  // Resolve a signed URL if we have a storage path
  let initialAvatarUrl: string | undefined;
  const stored = profile?.avatar_url;
  if (stored) {
    if (stored.startsWith("http")) {
      initialAvatarUrl = stored;
    } else {
      const { data: signed } = await supabase.storage
        .from("avatars")
        .createSignedUrl(stored, 60 * 60 * 24 * 7);
      if (signed?.signedUrl) initialAvatarUrl = signed.signedUrl;
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Edit Profile</h1>
      <ProfileForm
        initialEmail={profile?.email ?? user.email ?? ""}
        initialUsername={profile?.username ?? ""}
        initialDisplayName={profile?.display_name ?? ""}
        initialAvatarUrl={initialAvatarUrl}
      />
    </div>
  );
}
