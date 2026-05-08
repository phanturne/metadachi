---
name: capture
description: Save information, research results, and links to the Metadachi Inbox. Use when user says "save this", "remember this", or asks to add something to inbox.
---

# OpenClaw Capture Skill: Metadachi Inbox

This skill enables an AI agent to capture information, research results, and links directly into the Metadachi Inbox for user review.

## Vault Path Resolution

Before any file operations, resolve the vault path in this order:

1. **Environment variable**: Use `process.env.VAULT_PATH` if set
2. **Local .env file**: If `VAULT_PATH` is not set, check for a `.env` file in the resolved vault directory and load any `VAULT_PATH` defined there
3. **Default fallback**: `~/Desktop/Obsidian/vault`

For Node.js: use `dotenv` to load `.env` files. For shell contexts, source the `.env` manually or use `export $(grep VAULT_PATH .env | xargs)`.

## Triggers

- Explicit commands: `/save [content]`, `save this`, `add to inbox`.
- User requests to "remember this" or "keep this for later".
- Requests to "research [topic] and save the results".

## Action: Save to Inbox

To save information, you must create a new Markdown file in the `Inbox/` directory with specific frontmatter.

### File Path

Target directory: `Inbox/`
Filename format: `[kebab-case-title].md`

### Required Frontmatter

The file MUST contain YAML frontmatter with the following fields:
```yaml
---
title: "Descriptive Title"
type: "note" | "recipe" | "meeting" | "reference"
inbox: true
source: "openclaw"
suggested_path: "notes/optional-target-path.md"
---
```

- **title**: A concise title for the card.
- **type**: The inferred category. Refer to `.metadachi/config.json` for valid types. Default is `note`.
- **inbox**: MUST be `true` to ensure it appears in the triage section.
- **source**: MUST be `openclaw` to identify the provenance.
- **suggested_path**: (Optional) Where the user might want this file to eventually live (e.g., `recipes/pizza.md`).

### Body Content

The body should contain the captured information in well-formatted Markdown. If it's research, include headers and bullet points.

## Decision Logic: Save vs. Show

- **Show directly**: Short facts, quick answers, and general conversation.
- **Save to Inbox**:
    - Long-form research results.
    - Complex lists or data tables.
    - Specific links or articles requested for bookmarking.
    - Any content where the user uses an explicit save trigger.

## Examples

### User: "Research the benefits of vertical farming and save it."
**Action**: Perform research, then create `Inbox/vertical-farming-benefits.md` with `inbox: true`.

### User: "Save that recipe we just discussed."
**Action**: Create `Inbox/recipe-name.md` with `type: recipe` and `inbox: true`.
