-- Source: https://github.com/mckaywrigley/chatbot-ui/tree/main/supabase/migrations

ALTER TABLE tools
ADD COLUMN custom_headers JSONB NOT NULL DEFAULT '{}',
ADD COLUMN request_in_body BOOLEAN NOT NULL DEFAULT TRUE,
ALTER COLUMN schema SET DEFAULT '{}';
