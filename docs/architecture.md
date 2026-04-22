# Metadachi Architecture

## 1) System Topology

```mermaid
flowchart TD
  U[User Browser] --> APP[Next.js App Router UI]

  APP --> HOME["/ (ClientVault)"]
  APP --> INBOX["/inbox (ClientInboxPage)"]

  HOME --> UV[useVault + React Query]
  INBOX --> UV

  UV --> API[/api/vault GET]
  UV --> WA[vaultWriteAdapter]
  UV --> SSEB[VaultSseBridge]
  SSEB --> SSE[/api/vault/stream SSE]

  API --> CACHE[vaultCache]
  CACHE --> READ[lib/vault readVault/cardsFromVault]
  READ --> FS[(Vault markdown files)]
  READ --> CFG[(.metadachi/config.json)]

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
- `relativePath` is the canonical app-level file locator used by move/save/delete flows.
- Inbox behavior is metadata-driven (`inbox`, `source`, `suggested_path`) plus path heuristics (`Inbox/` prefix).

### B. Data Ingestion and Parsing

1. `vaultCache` reads from disk and keeps a memory snapshot of parsed files.
2. `lib/vault` parses markdown via `gray-matter`, infers type from:
   - explicit frontmatter `type`
   - config path/content inference rules
   - fallback default type
3. `GET /api/vault` returns `{ cards, config }` for client hydration.

### C. Client State and Synchronization

- `useVault` is the single data access layer used by major pages/components.
- React Query provides:
  - cache identity (`VAULT_CARDS_QUERY_KEY`)
  - optimistic updates for pin/favorite toggles
  - invalidation after mutations
- `VaultSseBridge` keeps one EventSource in live mode and invalidates cache on `update` events.

### D. Write Path by Runtime Mode

- **Live mode**
  - Mutations call server routes (`/api/vault/file`, `/api/vault/pin`, `/api/vault/favorite`).
  - Server validates and resolves safe paths before filesystem writes.
  - Changes propagate via cache invalidation + SSE updates.

- **Demo mode**
  - Mutations are intercepted by `vaultWriteAdapter` and persisted in IndexedDB overlay.
  - Overlay is merged with baseline vault cards in `mergeDemoOverlay`.
  - Reset clears overlay state without touching vault files.

### E. Inbox Triage Design

- Inbox list selects candidate cards by explicit `inbox: true` or `Inbox/` path.
- Approve/Deny flow:
  1. Rewrite markdown/frontmatter (`buildApprovedMarkdown` or `buildRejectedMarkdown`).
  2. Compute destination (`suggested_path` or `notes/`; reject to `archive/inbox/`).
  3. Resolve path collisions with suffixing (`name-1.md`, `name-2.md`, ...).
  4. Save and relocate through the same write adapter abstraction.

### F. File Safety and Reliability

- Path traversal is blocked through safe path resolution in file APIs.
- Move operation handles cross-device boundaries (`EXDEV`) by copy+unlink fallback.
- SSE is disabled in demo mode to avoid unnecessary network churn.
- Directory walking avoids symlink recursion for predictable performance.

### G. Performance Characteristics

- Query deduplication and stale-time prevent duplicate fetch churn.
- SSE events are debounced before invalidation to absorb bursty file watcher updates.
- API payload omits redundant raw file arrays, returning normalized card objects only.

### H. Current Tradeoffs

- Demo virtual-file behavior currently relies on path conventions for some flows.
- Frontmatter schema is intentionally permissive, so strict validation is limited.
- Full-text search is in-memory and client-side, optimized for local vault scale.

## 3) Notes

- Live mode writes to disk through API routes; demo mode writes to browser-local overlay only.
- SSE is only active in live mode and drives query invalidation after file-system changes.
- Inbox triage rewrites frontmatter and relocates files to target destinations (`notes/` or `archive/inbox/`).
