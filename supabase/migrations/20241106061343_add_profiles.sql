--------------- PROFILES ---------------

-- ENUM TYPES --
CREATE TYPE onboarding_status AS ENUM ('not_started', 'in_progress', 'completed');

-- TABLE --
CREATE TABLE IF NOT EXISTS profiles (
    -- ID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- RELATIONSHIPS
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- METADATA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- REQUIRED
    username TEXT NOT NULL UNIQUE 
        CHECK (
            char_length(username) >= 3 
            AND char_length(username) <= 25
            AND username ~* '^[a-zA-Z0-9_-]+$' -- Only allow alphanumeric, underscore, and hyphen
        ),
    display_name TEXT NOT NULL 
        CHECK (
            char_length(display_name) <= 100
            AND char_length(display_name) > 0
        ),
    avatar_url TEXT
        CHECK (
            avatar_url IS NULL OR (
                char_length(avatar_url) <= 1000
                AND avatar_url ~* '^https?://'
            )
        ),
    bio TEXT NOT NULL DEFAULT ''
        CHECK (char_length(bio) <= 500),
    
    -- ONBOARDING
    onboarding_status onboarding_status NOT NULL DEFAULT 'not_started',
    onboarding_completed_at TIMESTAMP WITH TIME ZONE
        CHECK (
            (onboarding_status = 'completed' AND onboarding_completed_at IS NOT NULL) OR
            (onboarding_status != 'completed' AND onboarding_completed_at IS NULL)
        )
);

-- INDEXES --
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_onboarding_status ON profiles(onboarding_status);

-- RLS --
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
CREATE POLICY "Allow public read access to profiles"
    ON profiles FOR SELECT
    USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Allow users to update own profile"
    ON profiles FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- FUNCTIONS --

-- Function to handle avatar deletion
CREATE OR REPLACE FUNCTION delete_old_avatar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only proceed if avatar_url has changed and old avatar exists
    IF OLD.avatar_url IS NOT NULL AND (TG_OP = 'DELETE' OR NEW.avatar_url IS DISTINCT FROM OLD.avatar_url) THEN
        -- Extract the path from the avatar_url
        -- Assuming avatar_url format: https://[your-project].supabase.co/storage/v1/object/public/avatars/[path]
        DECLARE
            avatar_path TEXT;
        BEGIN
            avatar_path := regexp_replace(OLD.avatar_url, '^.*/avatars/', '');
            
            -- Delete the old avatar from storage
            DELETE FROM storage.objects
            WHERE bucket_id = 'avatars'
            AND name = avatar_path;
        EXCEPTION
            WHEN OTHERS THEN
                -- Log error but don't prevent the trigger from completing
                RAISE WARNING 'Failed to delete old avatar: %', SQLERRM;
        END;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

-- TRIGGER FUNCTION --
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user creation
CREATE OR REPLACE FUNCTION create_profile()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    random_username TEXT;
    display_name TEXT;
BEGIN
    -- Generate a random username using user_ prefix and random string
    random_username := 'user_' || substr(md5(NEW.id::text), 1, 12);
    
    -- Use email username or id as initial display name
    display_name := COALESCE(
        split_part(NEW.email, '@', 1),
        substr(NEW.id::text, 1, 8)
    );

    -- Create a profile for the new user
    INSERT INTO public.profiles(
        user_id,
        username,
        display_name,
        bio,
        onboarding_status
    )
    VALUES(
        NEW.id,
        random_username,
        display_name,
        '',
        'not_started'
    );

    RETURN NEW;
END;
$$;

-- TRIGGERS --

-- Trigger for profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile();

-- Trigger to update updated_at column
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for avatar deletion
CREATE TRIGGER on_profile_avatar_change
    BEFORE UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION delete_old_avatar();

-- STORAGE --

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Allow public read access on avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated insert access to own avatars"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::text
        AND (ARRAY_LENGTH(regexp_split_to_array(name, '/'), 1) = 2)
    );

CREATE POLICY "Allow authenticated update access to own avatars"
    ON storage.objects FOR UPDATE TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND owner = auth.uid()
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Allow authenticated delete access to own avatars"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND owner = auth.uid()
        AND (storage.foldername(name))[1] = auth.uid()::text
    );