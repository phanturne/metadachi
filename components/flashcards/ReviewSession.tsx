"use client"

import { Button } from "@/components/ui/button"
import type { Flashcard } from "@/lib/hooks/useFlashcards"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, CheckCircle, RotateCcw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { FlashcardView } from "./FlashcardView"

interface ReviewSessionProps {
  flashcards: Flashcard[]
  onComplete: () => void
  onSelectLevel: (flashcard: Flashcard, level: Flashcard["familiarity_level"]) => void | Promise<void>
}

export function ReviewSession({ flashcards, onComplete, onSelectLevel }: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [answerRevealed, setAnswerRevealed] = useState(false)

  const currentCard = flashcards[currentIndex]
  const progress = `${currentIndex + 1} of ${flashcards.length}`

  const advance = useCallback(() => {
    // Move to next card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setAnswerRevealed(false)
    } else {
      setIsComplete(true)
    }
  }, [currentIndex, flashcards.length])

  const handleSelect = useCallback(async (level: Flashcard["familiarity_level"]) => {
    if (!currentCard) return
    await Promise.resolve(onSelectLevel(currentCard, level))
    advance()
  }, [advance, currentCard, onSelectLevel])

  const handleNext = useCallback(() => {
    advance()
  }, [advance])

  const handleRestart = () => {
    setCurrentIndex(0)
    setIsComplete(false)
    setAnswerRevealed(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "n" || e.key === "N") {
        handleNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleNext])

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">No flashcards to review</p>
        <Button variant="outline" onClick={onComplete}>
          Go Back
        </Button>
      </div>
    )
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Review Complete!</h2>
        <p className="text-muted-foreground mb-6">
          You reviewed {flashcards.length} flashcard{flashcards.length !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRestart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Review Again
          </Button>
          <Button onClick={onComplete}>
            Done
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* Progress indicator */}
      <div className="mb-6 text-sm text-muted-foreground">
        {progress}
      </div>

      {/* Card display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <FlashcardView flashcard={currentCard} onFlip={setAnswerRevealed} />
        </motion.div>
      </AnimatePresence>

      {/* Rating buttons */}
      {answerRevealed && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {(["new", "learning", "mastered"] as const).map((level) => {
            const isCurrent = level === currentCard.familiarity_level
            return (
              <Button
                key={level}
                variant="ghost"
                size="sm"
                className={isCurrent ? "bg-muted text-foreground capitalize" : "text-muted-foreground capitalize"}
                aria-pressed={isCurrent}
                title={isCurrent ? `Mark reviewed (keep ${level})` : `Move to ${level}`}
                onClick={() => void handleSelect(level)}
              >
                {level}
              </Button>
            )
          })}
        </div>
      )}

      {/* Skip button */}
      {answerRevealed && (
        <Button
          variant="ghost"
          onClick={handleNext}
          className="mt-2 text-muted-foreground"
          size="sm"
        >
          Skip
        </Button>
      )}
    </div>
  )
}