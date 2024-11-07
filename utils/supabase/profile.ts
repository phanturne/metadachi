// ProfileService.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export class ProfileService {
  private static readonly AVATAR_BUCKET = "avatars";
  private static readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  private static readonly ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  private static readonly USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Validates a username
   */
  private validateUsername(username: string): void {
    if (username.length < 3 || username.length > 25) {
      throw new Error("Username must be between 3 and 25 characters");
    }
    if (!ProfileService.USERNAME_REGEX.test(username)) {
      throw new Error(
        "Username can only contain letters, numbers, underscores, and hyphens",
      );
    }
  }

  /**
   * Validates an avatar file
   */
  private validateAvatarFile(file: File): void {
    if (!ProfileService.ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error("Invalid file type. Only JPEG, PNG and WebP are allowed");
    }
    if (file.size > ProfileService.MAX_FILE_SIZE) {
      throw new Error("File size must be less than 2MB");
    }
  }

  /**
   * Uploads an avatar file to storage
   */
  private async uploadAvatar(userId: string, file: File): Promise<string> {
    this.validateAvatarFile(file);

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await this.supabase.storage
      .from(ProfileService.AVATAR_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = this.supabase.storage
      .from(ProfileService.AVATAR_BUCKET)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Gets a user's profile
   */
  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select()
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Profile not found");

    return data;
  }

  /**
   * Updates a user's profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<ProfileUpdate> & {
      avatar_file?: File;
    },
  ): Promise<Profile> {
    const { avatar_file, ...profileUpdates } = updates;

    // Validate username if provided
    if (profileUpdates.username) {
      this.validateUsername(profileUpdates.username);
    }

    // Handle avatar upload if provided
    if (avatar_file) {
      const avatarUrl = await this.uploadAvatar(userId, avatar_file);
      profileUpdates.avatar_url = avatarUrl;
    }

    // Update the profile
    const { data, error } = await this.supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      // Handle unique constraint violations
      if (error.code === "23505" && error.message.includes("username")) {
        throw new Error("Username is already taken");
      }
      throw error;
    }

    return data;
  }

  /**
   * Checks if a username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (error) throw error;
    return !data;
  }
}
