import { NextResponse } from 'next/server'
import { getVaultMode } from '@/lib/vaultMode'
import { VAULT_PATH } from '@/lib/vault'
import { resolveSafeVaultMarkdownPath } from '@/lib/vaultPaths'
import type { FamiliarityLevel } from '@/lib/srs'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  const mode = getVaultMode()

  if (mode === 'demo') {
    return NextResponse.json({ error: 'Use client-side adapter in demo mode' }, { status: 400 })
  }

  try {
    const { front, back, deck = 'default', tags = [], difficulty, category } = await request.json() as {
      front: string
      back: string
      deck?: string
      tags?: string[]
      difficulty?: string
      category?: string
    }

    const cardId = randomUUID()
    const now = new Date().toISOString()
    const relativePath = `Flashcards/${cardId}.md`

    const frontmatter = {
      id: cardId,
      title: front.slice(0, 50),
      type: 'flashcard',
      deck,
      tags,
      created: now,
      familiarity_level: 'new' as FamiliarityLevel,
      last_reviewed_at: now,
      ...(difficulty && { difficulty }),
      ...(category && { category }),
    }

    const content = `Q: ${front}\nA::::\n\n${back}`
    const raw = matter.stringify(content, frontmatter)

    const abs = resolveSafeVaultMarkdownPath(VAULT_PATH, relativePath)
    if (!abs) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    const dir = path.dirname(abs)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(abs, raw, 'utf-8')

    return NextResponse.json({ relativePath })
  } catch (e) {
    console.error('[flashcards] POST failed:', e)
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const mode = getVaultMode()

  if (mode === 'demo') {
    return NextResponse.json({ error: 'Use client-side adapter in demo mode' }, { status: 400 })
  }

  try {
    const { relativePath, familiarity_level, last_reviewed_at } = await request.json() as {
      relativePath: string
      familiarity_level?: FamiliarityLevel
      last_reviewed_at?: string
    }

    if (!relativePath) {
      return NextResponse.json({ error: 'relativePath is required' }, { status: 400 })
    }

    if (familiarity_level === undefined && last_reviewed_at === undefined) {
      return NextResponse.json({ error: 'Provide familiarity_level and/or last_reviewed_at' }, { status: 400 })
    }

    const abs = resolveSafeVaultMarkdownPath(VAULT_PATH, relativePath)
    if (!abs) {
      return NextResponse.json({ error: 'Invalid relativePath' }, { status: 400 })
    }

    if (!fs.existsSync(abs)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const raw = fs.readFileSync(abs, 'utf-8')
    const parsed = matter(raw)
    const { data, content } = parsed

    if (familiarity_level !== undefined) {
      data.familiarity_level = familiarity_level
    }
    if (last_reviewed_at !== undefined) {
      data.last_reviewed_at = last_reviewed_at
    }

    const newRaw = matter.stringify(content, data)
    fs.writeFileSync(abs, newRaw, 'utf-8')

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[flashcards] PATCH failed:', e)
    return NextResponse.json({ error: 'Failed to update flashcard' }, { status: 500 })
  }
}