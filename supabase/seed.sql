-- Seed file for local Supabase development
-- This file inserts 3 test users into auth.users and their corresponding profiles
-- Password for all users: password123

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create a user in auth.users
CREATE OR REPLACE FUNCTION seed_user(
  user_email TEXT,
  user_password TEXT,
  user_meta JSONB
) RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Generate a UUID for the user
  user_id := gen_random_uuid();
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    user_meta,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Create users
DO $$
DECLARE
  alice_id UUID;
  bob_id UUID;
  charlie_id UUID;
BEGIN
  -- User 1: Alice
  alice_id := seed_user(
    'alice@example.com',
    'password123',
    '{"full_name":"Alice Johnson","name":"Alice"}'::jsonb
  );
  
  -- User 2: Bob
  bob_id := seed_user(
    'bob@example.com',
    'password123',
    '{"full_name":"Bob Smith","name":"Bob"}'::jsonb
  );
  
  -- User 3: Charlie
  charlie_id := seed_user(
    'charlie@example.com',
    'password123',
    '{"full_name":"Charlie Brown","name":"Charlie"}'::jsonb
  );
END $$;

-- Update profiles with proper usernames and display names
-- The trigger should have created profiles, but we'll update them to ensure proper data
UPDATE profiles
SET 
  username = 'alice',
  display_name = 'Alice Johnson',
  email = 'alice@example.com'
WHERE email = 'alice@example.com';

UPDATE profiles
SET 
  username = 'bob',
  display_name = 'Bob Smith',
  email = 'bob@example.com'
WHERE email = 'bob@example.com';

UPDATE profiles
SET 
  username = 'charlie',
  display_name = 'Charlie Brown',
  email = 'charlie@example.com'
WHERE email = 'charlie@example.com';