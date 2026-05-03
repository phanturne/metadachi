# Metadachi Architecture

## 1) System Topology

```mermaid
flowchart TD
  U[User Browser] --> APP[Next.js App Router UI]

  APP --> HOME["/ (ClientVault)"]
  APP --> INBOX["/inbox (ClientInboxPage)"]
  APP --> HUB["/u/[username] (ClientHubView)"]

  HOME --> UV[useVault + React Query]
  INBOX --> UV
  HUB --> SUPA_PUB[(Supabase Public Read)]

  UV --> API[/api/vault GET]
  UV --> WA[vaultWriteAdapter]
  UV --> SSEB[VaultSseBridge]
  SSEB --> SSE[/api/vault/stream SSE]

  API --> CACHE[vaultCache]
  CACHE --> READ[lib/vault readVault/cardsFromVault]
  READ --> FS[(Vault markdown files)]
  READ --> CFG[(.metadachi/config.json)]

  CACHE -->|events| SYNC[hubSyncService]
  SYNC -->|upsert| SUPA[(Supabase Hub Database)]

  WA -->|live mode| FILE[/api/vault/file PUT PATCH POST DELETE]
  FILE --> FS

  WA -->|demo mode| DEMO[(IndexedDB demo overlay)]
  DEMO --> MERGE[mergeDemoOverlay]
  MERGE --> UV

  INBOX --> TRIAGE[InboxTriageList]
  TRIAGE --> INBOXLIB[lib/inbox]
  INBOXLIB --> WA
```

## 2) Design Details

### A. Domain Model

- `Card` is the main UI model derived from markdown + frontmatter + file metadata.
- Stable identity uses frontmatter `id` when available, otherwise a path-derived fallback.
- **Community Fields:** `published`, `slug`, and `author` are tracked to manage public visibility.
- Inbox behavior is metadata-driven (`inbox`, `source`, `suggested_path`) plus path heuristics (`Inbox/` prefix).

### B. Data Ingestion and Parsing

1. `vaultCache` reads from disk and keeps a memory snapshot of parsed files.
2. `lib/vault` parses markdown via `gray-matter`.
3. **Background Sync:** `hubSyncService` listens to `vaultCache` updates. If a card is marked `published: true` and a valid Supabase session exists, it mirrors the content to the global hub.

### C. Client State and Synchronization

- `useVault` is the single data access layer used by major pages/components.
- **Unified Search:** In `live` mode, search can toggle between `local` (memory cache) and `community` (Supabase Full-Text Search).

### D. Write Path by Runtime Mode

- **Live mode**
  - Mutations call server routes (`/api/vault/file`, `/api/vault/pin`, `/api/vault/favorite`, `/api/vault/published`).
  - Changes propagate via cache invalidation + SSE updates + background Hub sync.

- **Hub mode**
  - Deployable to public cloud (Vercel) via `NEXT_PUBLIC_METADACHI_MODE=hub`.
  - Read-only view of the global database or specific user profiles.
  - No filesystem access; uses Supabase as the primary data source.

- **Demo mode**
  - Mutations are intercepted by `vaultWriteAdapter` and persisted in IndexedDB overlay.

### E. Security and Identity

- **Session Bridge:** Credentials from the browser are synced to `.metadachi/session.json` to allow the background Node process to authenticate with Supabase.
- **Row Level Security (RLS):** Supabase policies ensure only the owner can modify their published cards.

### F. File Safety and Reliability

- Path traversal is blocked through safe path resolution in file APIs.
- Move operation handles cross-device boundaries (`EXDEV`) by copy+unlink fallback.
- Directory walking avoids symlink recursion for predictable performance.

## 3) Notes

- **Sovereign Public View:** Actual data lives on the user's disk; Supabase acts as a high-availability mirror and discovery layer.
- **Forking:** Community cards can be imported, which triggers a write of a new `.md` file to the user's local `Inbox/`.
