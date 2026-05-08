---
name: context
description: Read vault metadata, configuration, and content to understand Metadachi workspace. Use when searching notes, checking existing data, or understanding workspace structure.
---

# OpenClaw Context Skill: Metadachi Vault Awareness

This skill enables an AI agent to read metadata and content from the Metadachi vault to provide context-aware answers and understand system capabilities.

## Vault Path Resolution

Before any file operations, resolve the vault path in this order:

1. **Environment variable**: Use `process.env.VAULT_PATH` if set
2. **Local .env file**: If `VAULT_PATH` is not set, check for a `.env` file in the resolved vault directory and load any `VAULT_PATH` defined there
3. **Default fallback**: `~/Desktop/Obsidian/krding-vault`

For Node.js: use `dotenv` to load `.env` files. For shell contexts, source the `.env` manually or use `export $(grep VAULT_PATH .env | xargs)`.

## Description
Use this skill when you need to understand what data is already present in the vault, check for duplicate information, or understand the configuration of the Metadachi workspace.

## Capabilities

### 1. Understanding Workspace Configuration
Before performing operations, you should be aware of the vault's configuration:
-   **File**: `.metadachi/config.json`
-   **Information**: Contains defined `types` (e.g., recipe, meeting, note) and their inference rules.
-   **Action**: Read this file to ensure any new cards you create use valid types.

### 2. Metadata Awareness
Every card in the vault is a Markdown file with YAML frontmatter.
-   **Action**: When reading a file, pay attention to fields like `title`, `type`, `tags`, and custom metadata.
-   **Insight**: Use these fields to categorize information or find related notes.

### 3. Capability Discovery
The Metadachi environment has specific built-in features you should know about:
-   **Inbox Triage**: Cards with `inbox: true` are held in a "Review" state for the user. You don't need to find the perfect final location; just save to `Inbox/`.
-   **Card Polymorphism**: Different types (recipes, meetings) have different UI renderings. Choosing the right `type` in frontmatter improves the user experience.

## Procedures

### Searching the Vault
When asked a question, search the vault first:
1.  **List Files**: Browse the directory structure to see if a relevant file exists.
2.  **Grep/Search**: Search for keywords across the vault.
3.  **Read Content**: Read the most relevant files to gather context before answering.

### Avoiding Duplicates
Before saving a new "Capture" (see Capture Skill), check if the information already exists:
-   Search for the title or key terms.
-   If it exists, ask the user if they want to update the existing note instead of creating a new one in the Inbox.

## Examples

### User: "What recipes do I have for cookies?"
**Action**:
1. Search `recipes/` directory.
2. Search for "cookie" in file contents.
3. List the titles found.

### User: "Tell me about our last team meeting."
**Action**:
1. Search for files with `type: meeting`.
2. Sort by date if available in metadata or filename.
3. Summarize the content of the most recent meeting note.
