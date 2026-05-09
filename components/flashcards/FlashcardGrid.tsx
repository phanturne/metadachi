"use client"

import { useState } from "react"
import { FAMILIARITY_LEVELS, type Flashcard } from "@/lib/hooks/useFlashcards"
import { FAMILIARITY_LABELS, type FamiliarityLevel } from "@/lib/srs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Zap, Clock, Brain } from "lucide-react"

interface FlashcardGridProps {
  flashcards: Flashcard[]
  onCardClick?: (flashcard: Flashcard) => void
}

const levelConfig: Record<FamiliarityLevel, { icon: React.ReactNode; headerColor: string }> = {
  new: {
    icon: <Zap className="w-4 h-4" />,
    headerColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  learning: {
    icon: <Clock className="w-4 h-4" />,
    headerColor: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  },
  mastered: {
    icon: <Brain className="w-4 h-4" />,
    headerColor: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
  },
}

export function FlashcardGrid({ flashcards, onCardClick }: FlashcardGridProps) {
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null)

  // Group cards by familiarity level
  const buckets: Record<FamiliarityLevel, Flashcard[]> = {
    new: [],
    learning: [],
    mastered: [],
  }

  flashcards.forEach((card) => {
    const level = card.familiarity_level || 'new'
    buckets[level].push(card)
  })

  const handleCardClick = (card: Flashcard) => {
    setSelectedCard(card)
    onCardClick?.(card)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {FAMILIARITY_LEVELS.map((level) => {
        const config = levelConfig[level]
        const cards = buckets[level]

        return (
          <div key={level} className="flex flex-col">
            {/* Column header */}
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-t-lg border",
                config.headerColor
              )}
            >
              <div className="flex items-center gap-2 font-medium">
                {config.icon}
                <span>{FAMILIARITY_LABELS[level]}</span>
              </div>
              <Badge variant="secondary" className="font-mono">
                {cards.length}
              </Badge>
            </div>

            {/* Column content */}
            <div className="flex-1 border-x border-b border-border rounded-b-lg bg-muted/20 p-3 space-y-2 min-h-[200px]">
              {cards.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No cards
                </p>
              ) : (
                cards.map((card) => (
                  <Card
                    key={card.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/50",
                      selectedCard?.id === card.id && "ring-2 ring-primary"
                    )}
                    onClick={() => handleCardClick(card)}
                  >
                    <CardContent className="p-3">
                      <p className="text-sm line-clamp-2 leading-snug">
                        {card.front}
                      </p>
                      {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {card.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[0.65rem] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {card.tags.length > 3 && (
                            <span className="text-[0.65rem] text-muted-foreground">
                              +{card.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}