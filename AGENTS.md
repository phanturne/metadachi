# Metadachi AI Agent Steering Document

Welcome to the Metadachi codebase! This document serves as a guide for AI agents (like Antigravity, Claude, etc.) to understand the project architecture, stack, and established conventions. Read this before making significant changes.

## 1. Project Overview

**Metadachi** is a Next.js web application designed to act as a sleek, dynamic viewer for a local directory of Markdown files (such as an Obsidian Vault). It reads `.md` files, parses their frontmatter and content, categorizes them, and displays them in an interactive interface.

## 2. Tech Stack

- **Framework**: Next.js 16.2 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS v4, `tw-animate-css`
- **UI Components**: `@base-ui/react`, Shadcn UI patterns
- **Animations**: Framer Motion (`framer-motion`)
- **Data Fetching / State**: React Query (`@tanstack/react-query`)
- **Markdown Handling**: `gray-matter` (for frontmatter parsing), `react-markdown`
- **File System / Watching**: Node `fs`, `chokidar`

## 3. Directory Structure

- `app/`: Next.js App Router pages and layouts. Keep routing logic thin.
- `components/`: React components specific to the application features (e.g., `ClientVault`, `BentoGrid`, `FilterBar`).
  - `components/ui/`: Reusable, generic UI components (buttons, dialogs, cards).
  - `components/cards/`: Specialized components for rendering different `CardType` layouts (`PolymorphicCard`).
- `lib/`: Core business logic, types, and utility functions.
  - `lib/vault.ts`: Handles reading from the local file system (`process.env.VAULT_PATH`), parsing markdown, and inferring card types.
  - `lib/types.ts`: TypeScript definitions for standard data structures (`Card`, `CardMeta`, `VaultFile`).
- `hooks/`: Custom React hooks (e.g., `useVault`).

## 4. Development Guidelines

### Styling & UI
- We use **Tailwind CSS v4**. Stick to standard Tailwind utility classes.
- Ensure all components are responsive and accommodate both light and dark modes (or stick to the established dark-mode-first aesthetic where applicable).
- Components in `components/ui/` should remain primarily structural and standard. Avoid adding overly specific business logic or heavily bespoke styles to foundational Shadcn/Base-UI components.
- Rely on `framer-motion` for complex interactive animations, and `tw-animate-css` or Tailwind transitions for simple hover/focus states.

### File Parsing & Vault Logic
- Markdown files are parsed via `gray-matter`. Always ensure you handle potential errors during file reads gracefully (e.g., `fs.readFileSync` wrapping).
- Card types (e.g., `recipe`, `meeting`, `note`) are inferred either from frontmatter (`type` field) or the file path/content constraints in `lib/vault.ts`.
- When updating vault parsing, ensure you do not break the stability of the generated IDs in `generateId`.

### State Management
- Use `useVault` hook and React Query for fetching and caching the parsed markdown data.
- Manage local UI state (search queries, filters, active cards) with standard React `useState` and `useMemo` hooks.

### General Rules
- Always prioritize using functional components and hooks.
- Write strict TypeScript. Do not use `any`; define interfaces in `lib/types.ts`.
- Validate environment variables (like `VAULT_PATH`) where appropriate.
