--------------- Create chat table ---------------
CREATE TABLE chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  visibility VARCHAR(7) NOT NULL DEFAULT 'private'
);

-- Enable RLS for chat table
ALTER TABLE chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_chat ON chat
  FOR SELECT
  USING (auth.uid() = user_id OR visibility = 'public');

CREATE POLICY insert_chat ON chat
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_chat ON chat
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY delete_chat ON chat
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indices for chat table
CREATE INDEX idx_chat_user_id ON chat(user_id);

--------------- Create message table ---------------
CREATE TABLE message (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chat(id),
  role VARCHAR NOT NULL,
  content JSON NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS for message table
ALTER TABLE message ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_message ON message
  FOR SELECT
  USING (auth.uid() = user_id OR (SELECT visibility FROM chat WHERE chat.id = message.chat_id) = 'public');

CREATE POLICY insert_message ON message
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_message ON message
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY delete_message ON message
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indices for message table
CREATE INDEX idx_message_chat_id ON message(chat_id);
CREATE INDEX idx_message_user_id ON message(user_id);

--------------- Create vote table ---------------
CREATE TABLE vote (
  chat_id UUID NOT NULL REFERENCES chat(id),
  message_id UUID NOT NULL REFERENCES message(id),
  is_upvoted BOOLEAN NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (chat_id, message_id)
);

-- Enable RLS for vote table
ALTER TABLE vote ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_vote ON vote
  FOR SELECT
  USING (auth.uid() = user_id OR (SELECT visibility FROM chat WHERE chat.id = vote.chat_id) = 'public');

CREATE POLICY insert_vote ON vote
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_vote ON vote
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY delete_vote ON vote
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indices for vote table
CREATE INDEX idx_vote_user_id ON vote(user_id);

--------------- Create document table ---------------
CREATE TABLE document (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  content TEXT,
  kind VARCHAR(4) NOT NULL DEFAULT 'text',
  user_id UUID NOT NULL REFERENCES auth.users(id),
  chat_id UUID REFERENCES chat(id),
  PRIMARY KEY (id, created_at)
);

-- Enable RLS for document table
ALTER TABLE document ENABLE ROW LEVEL SECURITY;

-- Policy to allow access to documents if the user is the owner or if the document is part of a public chat
CREATE POLICY select_document ON document
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1
      FROM chat
      WHERE chat.id = document.chat_id
      AND chat.visibility = 'public'
    )
  );

-- Policy to allow only the owner to insert, update, or delete documents
CREATE POLICY modify_document ON document
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indices for document table
CREATE INDEX idx_document_user_id ON document(user_id);
CREATE INDEX idx_document_chat_id ON document(chat_id);

--------------- Create suggestion table ---------------
CREATE TABLE suggestion (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL,
  document_created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  original_text TEXT NOT NULL,
  suggested_text TEXT NOT NULL,
  description TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (document_id, document_created_at) REFERENCES document(id, created_at)
);

-- Enable RLS for suggestion table
ALTER TABLE suggestion ENABLE ROW LEVEL SECURITY;

CREATE POLICY all_suggestion ON suggestion
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indices for suggestion table
CREATE INDEX idx_suggestion_document_id ON suggestion(document_id);
CREATE INDEX idx_suggestion_user_id ON suggestion(user_id);

--------------- Table Adjustments ---------------
ALTER TABLE vote
  DROP CONSTRAINT vote_chat_id_fkey,
  ADD CONSTRAINT vote_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES chat(id) ON DELETE CASCADE;

ALTER TABLE message
  DROP CONSTRAINT message_chat_id_fkey,
  ADD CONSTRAINT message_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES chat(id) ON DELETE CASCADE;

ALTER TABLE document
  ALTER COLUMN chat_id SET NOT NULL;

ALTER TABLE vote
  DROP CONSTRAINT vote_pkey,
  ADD PRIMARY KEY (chat_id, message_id, user_id);

-- Ensure created_at columns are NOT NULL
ALTER TABLE profile
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE chat
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE message
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE document
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE suggestion
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE vote
  ADD COLUMN created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL;