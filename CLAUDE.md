# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Metadachi is a Next.js 16.2 + React 19 local-first knowledge workspace for Markdown vaults with a community hub sync. It uses a **Sovereign Mirror** architecture: local `.md` files are the source of truth, with optional background sync to Supabase for the global hub.

## Commands

```bash
pnpm dev              # Start development server
pnpm build            # Production build
pnpm test             # Unit tests (Vitest)
pnpm test --watch     # Watch mode for tests
pnpm test:e2e:normal  # E2E tests (normal mode, requires VAULT_PATH)
pnpm test:e2e:demo    # E2E tests (demo mode, browser-only)
```

## Runtime Modes

The app runs in one of three modes, controlled by env vars:

- **Live** (`NEXT_PUBLIC_DEMO_MODE=false`): Normal operation. Reads from `VAULT_PATH`, writes to filesystem, syncs to Supabase.
- **Demo** (`NEXT_PUBLIC_DEMO_MODE=true`): Browser-only via IndexedDB. No filesystem access.
- **Hub** (`NEXT_PUBLIC_METADACHI_MODE=hub`): Public read-only deployment. Uses Supabase as primary data source.

## Architecture

```
User Browser → Next.js App Router → ClientVault/useVault (React Query)
                                              ↓
                    ┌─────────────────────────┼─────────────────────────┐
                    ↓                         ↓                         ↓
              vaultCache ←──→ Filesystem   vaultWriteAdapter    SSE Bridge
              (chokidar watcher)             (live vs demo)        (real-time updates)
                    ↓
              hubSyncService → Supabase (published cards only)
```

### Key Libraries

- `lib/vault.ts`: Parses `.md` files via `gray-matter`, infers card types
- `lib/vaultCache.ts`: Singleton with chokidar FS watcher, emits `update` events
- `lib/vaultWriteAdapter.ts`: Polymorphic write layer (demo → IndexedDB, live → API routes)
- `lib/syncService.ts`: Background sync to Supabase when cards are marked published
- `lib/supabase/`: Client setup for auth and hub database access

### Vault Configuration

Custom types and filter order are defined in `.metadachi/config.json` at the vault root:

```json
{
  "types": [
    { "id": "recipe", "label": "Recipes", "inferFromPath": "recipes/" },
    { "id": "flashcard", "label": "Flashcards", "inferFromPath": "Flashcards/" }
  ],
  "filterBarOrder": ["all", "flashcard", "recipe", "note"]
}
```

### Data Flow: Write Path

- **Live mode**: Mutations call `/api/vault/file`, `/api/vault/pin`, etc. → Server writes to filesystem/stateDb → `vaultCache` emits update → SSE pushes to clients → `hubSyncService` upserts to Supabase
- **Demo mode**: `vaultWriteAdapter` intercepts and persists to IndexedDB overlay

### Flashcards

Flashcard content uses `Q:` / `A::::` format in markdown with SRS metadata in frontmatter (`familiarity_level`, `last_reviewed_at`). The SRS logic is in `lib/srs.ts`.

## Directory Structure

- `app/`: Next.js App Router pages and API routes
- `app/api/vault/`: Server-side vault operations (file CRUD, pin/favorite/published state)
- `app/api/flashcards/`: Flashcard CRUD and review endpoints
- `app/api/auth/`: Supabase OAuth callback and session sync
- `components/`: Feature-specific components (`ClientVault`, `FlashcardView`, etc.)
- `components/ui/`: Generic UI primitives
- `lib/`: Core business logic, types, and Supabase client setup
- `hooks/`: Custom React hooks (`useVault`, `useFlashcards`)
