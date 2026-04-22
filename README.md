# Metadachi

Metadachi is a knowledge/second-brain workspace for Markdown vaults, designed to work with OpenClaw and other AI agents.

It provides a structured, agent-friendly layer over your notes: parse frontmatter, triage AI captures, organize files, and keep everything in sync with local disk changes.

## Core Features

- **AI capture triage**: inbox workflow to review and route notes created by OpenClaw/agent pipelines.
- **Vault workspace + file operations**: tree editor with create, edit, rename, move, and delete actions.
- **Live and demo modes**: persist directly to vault files in live mode, or safely experiment in browser-only demo overlay mode.
- **Real-time sync**: Server-Sent Events + React Query invalidation keep the UI fresh when files change.
- **Markdown + frontmatter intelligence**: parse with `gray-matter` and infer types from frontmatter, path, and content.
- **Search and filter UI** across title, tags, and markdown content.
- **Config-driven knowledge model**: vault-specific type definitions and filter ordering from `.metadachi/config.json`.

## Architecture

```mermaid
flowchart TD
  U[User Browser] --> APP[Next.js App Router UI]

  APP --> CV[ClientVault / ClientInboxPage]
  CV --> UV[useVault hook + React Query cache]
  UV --> API[/api/vault GET]
  UV --> WA[vaultWriteAdapter]
  UV --> SSEB[VaultSseBridge]
  SSEB --> SSE[/api/vault/stream SSE]

  API --> VC[vaultCache]
  VC --> VLIB[lib/vault read/parse]
  VLIB --> FS[(Vault files on disk)]
  VLIB --> CFG[.metadachi/config.json]

  WA -->|live mode| FILEAPI[/api/vault/file PUT/PATCH/POST/DELETE]
  FILEAPI --> FS
  WA -->|demo mode| OVL[(IndexedDB demo overlay)]

  OVL --> MERGE[mergeDemoOverlay]
  MERGE --> UV

  CV --> INBOX[InboxTriageList]
  INBOX --> INBOXLIB[lib/inbox transform + destination logic]
  INBOXLIB --> WA
```

For a standalone version with deeper design rationale and flow details, see [`docs/architecture.md`](docs/architecture.md).

### Runtime Modes

- **Live mode** (`NEXT_PUBLIC_DEMO_MODE=false`): writes go through server APIs and persist to vault files.
- **Demo mode** (`NEXT_PUBLIC_DEMO_MODE=true`): writes are redirected to browser-local overlay storage.

## Tech Stack

- **Framework**: Next.js 16.2 + React 19
- **State/Data**: React Query (`@tanstack/react-query`)
- **Styling/UI**: Tailwind CSS v4, `@base-ui/react`, `tw-animate-css`
- **Markdown**: `gray-matter`, `react-markdown`
- **FS and watching**: Node `fs`, `chokidar`
- **Testing**: Vitest, Playwright

## Getting Started

### Prerequisites

- Node.js 20+
- `pnpm`
- A local Markdown knowledge vault used by OpenClaw and/or other AI agents (or use `./demo-vault` for local demo/testing)

### Installation

1. Clone and install:
   ```bash
   git clone https://github.com/phanturne/metadachi.git
   cd metadachi
   pnpm install
   ```

2. Create `.env`:
   ```bash
   cp .env.example .env
   ```

3. Configure:
   ```env
   VAULT_PATH=/Users/username/Documents/Obsidian Vault
   NEXT_PUBLIC_DEMO_MODE=false
   # Optional: DEMO_VAULT_PATH=./demo-vault
   ```

4. Run:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Testing

- Unit tests:
  ```bash
  pnpm test
  ```
- E2E tests (normal + demo):
  ```bash
  pnpm test:e2e
  ```

## Customization & AI Agents

For contributor conventions and architecture guardrails, see [AGENTS.md](AGENTS.md).
