"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Flashcard } from "@/lib/hooks/useFlashcards"
import { ReviewResponse } from "@/lib/srs"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { RatingButtons } from "./RatingButtons"

interface FlashcardViewInteractiveProps {
  flashcard: Flashcard
  onRate?: (flashcard: Flashcard, response: ReviewResponse) => void
  onClose?: () => void
  showRateButtons?: boolean
  onFlip?: (isFlipped: boolean) => void
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Simple markdown renderer for flashcards
function MarkdownContent({ content }: { content: string }) {
  // Handle code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="w-full text-left">
      {parts.map((part, i) => {
        // Code block
        if (part.startsWith('```')) {
          const code = part.slice(3, -3).replace(/^[a-z]*\n?/, '')
          return (
            <pre key={i} className="bg-muted rounded-lg p-4 my-3 overflow-x-auto text-sm text-left">
              <code className="text-foreground">{code}</code>
            </pre>
          )
        }

        // Regular text - handle basic markdown
        const lines = part.split('\n')
        return (
          <div key={i} className="space-y-1">
            {lines.map((line, j) => {
              // Headers
              if (line.startsWith('# ')) {
                return <h1 key={j} className="text-xl font-bold mt-4 mb-2">{line.slice(2)}</h1>
              }
              if (line.startsWith('## ')) {
                return <h2 key={j} className="text-lg font-semibold mt-3 mb-2">{line.slice(3)}</h2>
              }
              if (line.startsWith('### ')) {
                return <h3 key={j} className="text-base font-medium mt-2 mb-1">{line.slice(4)}</h3>
              }
              // List items
              if (line.startsWith('- ') || line.startsWith('* ')) {
                return <li key={j} className="ml-4">{line.slice(2)}</li>
              }
              if (/^\d+\.\s/.test(line)) {
                return <li key={j} className="ml-4 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>
              }
              const safeLine = escapeHtml(line)
              // Bold
              const boldLine = safeLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              // Inline code
              const finalLine = boldLine.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>')
              // Links
              const linkLine = finalLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline" target="_blank" rel="noopener">$1</a>')

              if (line.trim() === '') {
                return <br key={j} />
              }

              return <p key={j} className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: linkLine }} />
            })}
          </div>
        )
      })}
    </div>
  )
}

export function FlashcardViewInteractive({
  flashcard,
  onRate,
  onClose,
  showRateButtons = true,
  onFlip,
}: FlashcardViewInteractiveProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    const newState = !isFlipped
    setIsFlipped(newState)
    onFlip?.(newState)
  }

  const handleRate = (response: ReviewResponse) => {
    onRate?.(flashcard, response)
  }

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className="perspective-1000 mx-auto w-full cursor-pointer"
        onClick={handleFlip}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isFlipped ? "back" : "front"}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative"
          >
            <Card
              className={cn(
                "transition-colors hover:bg-muted/50",
                isFlipped && "border-primary/50"
              )}
            >
              <CardContent className="flex flex-col p-8 min-h-[200px]">
                <div className="absolute top-4 left-4 text-xs uppercase tracking-wider text-muted-foreground">
                  {isFlipped ? "Answer" : "Question"}
                </div>

                <MarkdownContent content={isFlipped ? flashcard.back : flashcard.front} />

                <div className="absolute bottom-4 text-xs text-muted-foreground">
                  Tap to {isFlipped ? "see question" : "reveal answer"}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rating Buttons */}
      {showRateButtons && isFlipped && onRate && (
        <div className="mt-6">
          <RatingButtons onRate={handleRate} />
        </div>
      )}
    </div>
  )
}

// Re-export RatingButtons for convenience
export { RatingButtons } from "./RatingButtons"
