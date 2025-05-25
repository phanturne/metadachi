# Database Migrations and Types

## Migration Guidelines

1. Create new migrations in the `supabase/migrations` directory
2. Use timestamp-based naming: `YYYYMMDDHHMMSS_description.sql`
3. Include both up and down migrations when possible
4. Test migrations locally before committing

## Types Generation

DO NOT manually modify `supabase/types.ts`. Instead, use the Supabase CLI to generate types:

```bash
# Generate types from your local database
supabase gen types typescript --local > supabase/types.ts

# Generate types from your remote database
supabase gen types typescript --project-id your-project-id > supabase/types.ts
```

## Workflow

1. Create and test your migration locally
2. Apply the migration to your local database
3. Generate updated types using the Supabase CLI
4. Commit both the migration and the updated types file

## Best Practices

1. Always include comments in migrations explaining complex changes
2. Use transactions for multi-step migrations
3. Include appropriate indexes and constraints
4. Test migrations both up and down
5. Keep migrations atomic and focused
6. Never modify existing migrations after they've been committed

## Example Migration

```sql
-- Example migration with up and down
BEGIN;

-- Up migration
CREATE TABLE example (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL
);

-- Down migration
-- DROP TABLE example;

COMMIT;
```
