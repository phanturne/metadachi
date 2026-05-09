"use client"

import { useState, useEffect } from "react"
import type { Flashcard } from "@/lib/hooks/useFlashcards"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface FlashcardEditorProps {
  flashcard?: Flashcard
  onSave: (card: { front: string; back: string; deck?: string; tags: string[]; difficulty?: string; category?: string }) => void
  onClose: () => void
  open: boolean
}

export function FlashcardEditor({
  flashcard,
  onSave,
  onClose,
  open,
}: FlashcardEditorProps) {
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")
  const [deck, setDeck] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [category, setCategory] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!flashcard

  useEffect(() => {
    if (flashcard) {
      setFront(flashcard.front)
      setBack(flashcard.back)
      setDeck(flashcard.deck)
      setTagsInput(flashcard.tags.join(", "))
      setDifficulty(flashcard.difficulty || "")
      setCategory(flashcard.category || "")
    } else {
      setFront("")
      setBack("")
      setDeck("")
      setTagsInput("")
      setDifficulty("")
      setCategory("")
    }
    setErrors({})
  }, [flashcard, open])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!front.trim()) {
      newErrors.front = "Question (front) is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    onSave({
      front: front.trim(),
      back: back.trim(),
      deck: deck.trim() || undefined,
      tags,
      difficulty: difficulty.trim() || undefined,
      category: category.trim() || undefined,
    })
    onClose()
  }

  const handleAddTag = (tag: string) => {
    const currentTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    if (!currentTags.includes(tag)) {
      setTagsInput([...currentTags, tag].join(", "))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Flashcard" : "Create Flashcard"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Front (Question) */}
          <div className="space-y-2">
            <label htmlFor="front" className="text-sm font-medium">
              Question (Front) <span className="text-destructive">*</span>
            </label>
            <textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="What is spaced repetition?"
              className={cn(
                "w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground",
                errors.front && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
              )}
            />
            {errors.front && (
              <p className="text-xs text-destructive">{errors.front}</p>
            )}
          </div>

          {/* Back (Answer) */}
          <div className="space-y-2">
            <label htmlFor="back" className="text-sm font-medium">
              Answer (Back)
            </label>
            <textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="A learning technique that involves increasing intervals of time between reviews..."
              className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
            />
          </div>

          {/* Deck */}
          <div className="space-y-2">
            <label htmlFor="deck" className="text-sm font-medium">
              Deck
            </label>
            <Input
              id="deck"
              value={deck}
              onChange={(e) => setDeck(e.target.value)}
              placeholder="My Study Deck"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags
            </label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="science, spaced-repetition, learning (comma-separated)"
            />
            {tagsInput && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tagsInput
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0)
                  .map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = tagsInput
                            .split(",")
                            .map((t) => t.trim())
                            .filter((t) => t.length > 0 && t !== tag)
                          setTagsInput(newTags.join(", "))
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label htmlFor="difficulty" className="text-sm font-medium">
              Difficulty
            </label>
            <Input
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              placeholder="easy, medium, hard"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Study, Work, Personal"
            />
          </div>
        </form>

        <DialogFooter showCloseButton>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Create Card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}