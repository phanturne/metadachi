# Supabase Client Usage

## Client Import Guidelines

Always import Supabase clients from the `/utils/supabase` directory:

```typescript
// ✅ DO: Import from utils/supabase
import { supabase } from "@/utils/supabase";

// ❌ DON'T: Import directly from @supabase/supabase-js
import { createClient } from "@supabase/supabase-js";
```

## Available Clients

The following clients are available from `/utils/supabase`:

- `supabase`: Main Supabase client for database operations
- `supabaseAdmin`: Admin client for server-side operations
- `supabaseAuth`: Auth-specific client for authentication operations

## Usage Examples

```typescript
// Database operations
const { data, error } = await supabase.from("table_name").select("*");

// Auth operations
const { user, error } = await supabaseAuth.auth.getUser();

// Admin operations (server-side only)
const { data, error } = await supabaseAdmin.from("table_name").select("*");
```

## Best Practices

1. Use the appropriate client for your use case
2. Always handle errors from Supabase operations
3. Use TypeScript types from `@/types/supabase` for type safety
4. Keep sensitive operations server-side using the admin client
