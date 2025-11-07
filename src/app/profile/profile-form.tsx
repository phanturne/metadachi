"use client";

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useState } from "react";
import { updateProfile } from "./actions";

type Props = {
  initialEmail: string;
  initialUsername: string;
  initialDisplayName: string;
  initialAvatarUrl?: string;
};

export default function ProfileForm({
  initialEmail,
  initialUsername,
  initialDisplayName,
  initialAvatarUrl,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initialAvatarUrl,
  );
  const [pending, setPending] = useState(false);
  const [avatarPath, setAvatarPath] = useState<string | undefined>(undefined);

  return (
    <form
      action={async (formData: FormData) => {
        setPending(true);
        await updateProfile(formData);
        setPending(false);
      }}
      className="space-y-4"
    >
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Avatar"
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 8 * 1024 * 1024) {
                alert("Please choose an image smaller than 8MB.");
                e.currentTarget.value = "";
                return;
              }
              const supabase = createClient();
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (!user) {
                alert("You must be logged in to upload an avatar.");
                return;
              }
              const ext = file.name.split(".").pop() || "png";
              const filePath = `${user.id}/avatar.${ext}`;
              const { error } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, {
                  upsert: true,
                  contentType: file.type,
                });
              if (error) {
                alert("Upload failed. Please try again.");
                return;
              }
              // Signed URL for preview
              const { data: signed } = await supabase.storage
                .from("avatars")
                .createSignedUrl(filePath, 60 * 60 * 24 * 7);
              if (signed?.signedUrl) setPreviewUrl(signed.signedUrl);
              setAvatarPath(filePath);
            }}
          />
        </div>
      </div>

      {/* Hidden field carrying the uploaded storage path */}
      <input type="hidden" name="avatar_path" value={avatarPath ?? ""} />

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-gray-600">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={initialEmail}
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm text-gray-600">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          defaultValue={initialUsername}
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="display_name" className="text-sm text-gray-600">
          Display name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={initialDisplayName}
          className="rounded border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
