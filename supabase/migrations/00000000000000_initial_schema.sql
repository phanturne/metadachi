-- Initial schema migration from Vercel AI Chatbot

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notes:
-- 1. We don't create the users table as it's managed by Supabase Auth
-- 2. For foreign keys referencing auth.users, we use the auth.users.id column
-- 3. Updated to use TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP for all createdAt columns

-- Create Chat table
CREATE TABLE IF NOT EXISTS "Chat" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "title" TEXT NOT NULL,
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "visibility" VARCHAR DEFAULT 'private' NOT NULL CHECK ("visibility" IN ('public', 'private'))
);

-- Create Message table
CREATE TABLE IF NOT EXISTS "Message" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  "chatId" UUID NOT NULL REFERENCES "Chat"(id) ON DELETE CASCADE,
  "role" VARCHAR NOT NULL,
  "parts" JSONB NOT NULL,
  "attachments" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Vote table
CREATE TABLE IF NOT EXISTS "Vote" (
  "chatId" UUID NOT NULL REFERENCES "Chat"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "messageId" UUID NOT NULL REFERENCES "Message"(id) ON DELETE CASCADE,
  "isUpvoted" BOOLEAN NOT NULL,
  PRIMARY KEY ("chatId", "messageId")
);

-- Create Document table
CREATE TABLE IF NOT EXISTS "Document" (
  "id" UUID DEFAULT uuid_generate_v4() NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT,
  "kind" VARCHAR DEFAULT 'text' NOT NULL CHECK ("kind" IN ('text', 'code', 'image', 'sheet')),
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY ("id", "createdAt")
);

-- Create Suggestion table
CREATE TABLE IF NOT EXISTS "Suggestion" (
  "id" UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  "documentId" UUID NOT NULL,
  "documentCreatedAt" TIMESTAMP NOT NULL,
  "originalText" TEXT NOT NULL,
  "suggestedText" TEXT NOT NULL,
  "description" TEXT,
  "isResolved" BOOLEAN DEFAULT false NOT NULL,
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("documentId", "documentCreatedAt") REFERENCES "Document"("id", "createdAt") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_chat_userId" ON "Chat" ("userId");
CREATE INDEX IF NOT EXISTS "idx_message_chatId" ON "Message" ("chatId");
CREATE INDEX IF NOT EXISTS "idx_document_userId" ON "Document" ("userId");
CREATE INDEX IF NOT EXISTS "idx_suggestion_documentId" ON "Suggestion" ("documentId");
CREATE INDEX IF NOT EXISTS "idx_suggestion_userId" ON "Suggestion" ("userId");

-- Set up Row Level Security for all tables

-- Enable RLS for all tables
ALTER TABLE "Chat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Suggestion" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own data
CREATE POLICY "Users can view their own chats" ON "Chat"
  FOR SELECT
  USING (auth.uid() = "userId" OR "visibility" = 'public');

CREATE POLICY "Users can view their own messages" ON "Message"
  FOR SELECT
  USING ((SELECT "userId" FROM "Chat" WHERE id = "chatId") = auth.uid() OR (SELECT "visibility" FROM "Chat" WHERE id = "chatId") = 'public');

CREATE POLICY "Users can view their own votes" ON "Vote"
  FOR SELECT
  USING ((SELECT "userId" FROM "Chat" WHERE id = "chatId") = auth.uid());

CREATE POLICY "Users can view their own documents" ON "Document"
  FOR SELECT
  USING (auth.uid() = "userId");

CREATE POLICY "Users can view their own suggestions" ON "Suggestion"
  FOR SELECT
  USING (auth.uid() = "userId" OR (SELECT "userId" FROM "Document" WHERE "id" = "documentId" AND "createdAt" = "documentCreatedAt") = auth.uid());

-- Allow authenticated users to insert their own data
CREATE POLICY "Users can insert their own chats" ON "Chat"
  FOR INSERT
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can insert their own messages" ON "Message"
  FOR INSERT
  WITH CHECK ((SELECT "userId" FROM "Chat" WHERE id = "chatId") = auth.uid());

CREATE POLICY "Users can insert their own votes" ON "Vote"
  FOR INSERT
  WITH CHECK ((SELECT "userId" FROM "Chat" WHERE id = "chatId") = auth.uid());

CREATE POLICY "Users can insert their own documents" ON "Document"
  FOR INSERT
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can insert their own suggestions" ON "Suggestion"
  FOR INSERT
  WITH CHECK (auth.uid() = "userId");

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update their own chats" ON "Chat"
  FOR UPDATE
  USING (auth.uid() = "userId");

CREATE POLICY "Users can update their own messages" ON "Message"
  FOR UPDATE
  USING ((SELECT "userId" FROM "Chat" WHERE id = "chatId") = auth.uid());

CREATE POLICY "Users can update their own votes" ON "Vote"
  FOR UPDATE
  USING ((SELECT "userId" FROM "Chat" WHERE id = "chatId") = auth.uid());

CREATE POLICY "Users can update their own documents" ON "Document"
  FOR UPDATE
  USING (auth.uid() = "userId");

CREATE POLICY "Users can update their own suggestions" ON "Suggestion"
  FOR UPDATE
  USING (auth.uid() = "userId");

-- Allow authenticated users to delete their own data
CREATE POLICY "Users can delete their own chats" ON "Chat"
  FOR DELETE
  USING (auth.uid() = "userId");

CREATE POLICY "Users can delete their own messages" ON "Message"
  FOR DELETE
  USING ((SELECT "userId" FROM "Chat" WHERE id = "chatId") = auth.uid());

CREATE POLICY "Users can delete their own votes" ON "Vote"
  FOR DELETE
  USING ((SELECT "userId" FROM "Chat" WHERE id = "chatId") = auth.uid());

CREATE POLICY "Users can delete their own documents" ON "Document"
  FOR DELETE
  USING (auth.uid() = "userId");

CREATE POLICY "Users can delete their own suggestions" ON "Suggestion"
  FOR DELETE
  USING (auth.uid() = "userId");
