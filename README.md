# Metadachi

Metadachi is a sleek, gallery-style viewer for your OpenClaw memories stored in an Obsidian vault.

It reads your local Obsidian `.md` files, parses their YAML frontmatter, categorizes your memories automatically, and displays them in a beautiful, interactive visual gallery.

## Features

- **Markdown & Frontmatter Support**: Automatically ingests `.md` files using `gray-matter`, picking up titles, tags, creation dates, and custom categorization.
- **Dynamic Categorization**: Infers note types (e.g., Recipe, Meeting, Note) either directly from frontmatter properties (`type`) or by parsing the file path and content.
- **Custom UI System**: Built with Next.js App Router, React 19, Tailwind CSS v4, and `@base-ui/react` for an accessible, stylish, dark-mode-first experience.
- **Rich Interactions**: Features animated layout transitions and interactive cards with Framer Motion.
- **Search & Filtering**: Instantly filter your vault by category or use text search across tags, titles, and raw markdown content.

## Tech Stack

- **Framework**: Next.js 16.2 / React 19
- **Styling**: Tailwind CSS v4, `tw-animate-css`
- **Animations**: Framer Motion
- **Data & State**: React Query (`@tanstack/react-query`)
- **Markdown Handling**: `gray-matter`, `react-markdown`
- **Component Primitives**: `@base-ui/react`

## Getting Started

### Prerequisites

Ensure you have Node.js and `pnpm` installed. You will also need an absolute path to a local directory containing your Markdown files.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/phanturne/metadachi.git
   cd metadachi
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure your environment variable by copying the `.env.example` file to a new `.env` file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set the `VAULT_PATH` to the absolute path of your markdown folder:
   ```env
   VAULT_PATH=/Users/username/Documents/Obsidian Vault
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view your vault.

## Customization & AI Agents

If you want to augment or customize Metadachi, read configuring rules and architecture guidelines via the [AGENTS.md](AGENTS.md) steering document.
