# Metadachi

Metadachi is a local-first knowledge workspace for Markdown vaults that seamlessly bridges into a shared community hub. Designed to work with OpenClaw and other AI agents, it turns your private notes into a searchable, shareable social network without sacrificing data ownership.

## Core Features

- **Local-First, Community-Second**: Your notes live on your disk as `.md` files. Choose exactly which notes to mirror to the global hub.
- **AI Capture Triage**: Inbox workflow to review and route notes created by OpenClaw/agent pipelines.
- **Global Hub Sync**: Background synchronization to Supabase. When you toggle "Publish," your note instantly appears in the community feed.
- **Unified Search**: Search your local vault and the global community simultaneously.
- **Public Profiles**: Every user gets a beautiful public cookbook/portfolio at `/u/[username]`.
- **One-Click Forking**: See a cool recipe or note in the community? Import it directly to your local `Inbox/` with one click.
- **Real-Time Sync**: Server-Sent Events + React Query keep the UI fresh when files change.

## Architecture

Metadachi uses a **Sovereign Mirror** architecture. Your local machine is the source of truth; a central Supabase instance acts as a high-availability discovery layer.

```mermaid
flowchart TD
  U[User Browser] --> APP[Next.js App Router UI]

  APP --> CV[ClientVault / ClientHubView]
  CV --> UV[useVault hook + React Query cache]
  
  subgraph Local
    UV --> API[/api/vault GET]
    API --> VC[vaultCache]
    VC --> FS[(Local Markdown Files)]
    VC --> SYNC[hubSyncService]
  end

  subgraph Cloud
    SYNC -->|upsert| SUPA[(Supabase Database)]
    CV -->|search/profile| SUPA
  end
```

For more details, see [`docs/architecture.md`](docs/architecture.md).

### Runtime Modes

- **Live Mode** (`NEXT_PUBLIC_DEMO_MODE=false`): Normal local operation with filesystem access and background sync.
- **Hub Mode** (`NEXT_PUBLIC_METADACHI_MODE=hub`): A public, read-only deployment for browsers (no local files).
- **Demo Mode** (`NEXT_PUBLIC_DEMO_MODE=true`): Safe experimentation using browser-only IndexedDB.

## Tech Stack

- **Framework**: Next.js 16.2 + React 19
- **Database/Auth**: Supabase (Hub Mirror)
- **State/Data**: React Query (`@tanstack/react-query`)
- **FS and watching**: Node `fs`, `chokidar`
- **Styling**: Tailwind CSS v4

## Getting Started

### Prerequisites

- Node.js 20+
- `pnpm`
- A local Markdown vault (or use `./demo-vault`)
- (Optional) A Supabase project for community features

### Installation

1. Clone and install:
   ```bash
   git clone https://github.com/phanturne/metadachi.git
   cd metadachi
   pnpm install
   ```

2. Configure Environment:
   ```bash
   cp .env.example .env
   ```
   Set `VAULT_PATH` and your Supabase credentials in `.env`.

3. Initialize Hub (Optional):
   Apply the schema from `supabase/migrations/` to your Supabase SQL editor.

4. Run:
   ```bash
   pnpm dev
   ```

## Testing

- Unit tests: `pnpm test`
- E2E tests: `pnpm test:e2e` (Includes community sync and profile verification)

## Customization & AI Agents

For contributor conventions and architecture guardrails, see [AGENTS.md](AGENTS.md).
