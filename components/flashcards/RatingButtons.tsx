"use client"

import { useEffect } from "react"
import { ReviewResponse } from "@/lib/srs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RatingButtonsProps {
  onRate: (response: ReviewResponse) => void
  disabled?: boolean
}

interface RatingOption {
  response: ReviewResponse
  label: string
  hint: string
  shortcut: string
  className: string
  shortcutClassName: string
}

const ratingOptions: RatingOption[] = [
  {
    response: ReviewResponse.Again,
    label: "Again",
    hint: "Reset",
    shortcut: "1",
    className: "border-red-200 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:border-red-900/60 dark:text-red-300",
    shortcutClassName: "bg-red-500/20 text-red-700 dark:text-red-200",
  },
  {
    response: ReviewResponse.Hard,
    label: "Hard",
    hint: "Step down",
    shortcut: "2",
    className: "border-orange-200 bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 dark:border-orange-900/60 dark:text-orange-300",
    shortcutClassName: "bg-orange-500/20 text-orange-700 dark:text-orange-200",
  },
  {
    response: ReviewResponse.Good,
    label: "Good",
    hint: "Step up",
    shortcut: "3",
    className: "border-emerald-200 bg-emerald-500/15 text-emerald-800 hover:bg-emerald-500/25 dark:border-emerald-900/60 dark:text-emerald-200",
    shortcutClassName: "bg-emerald-500/25 text-emerald-800 dark:text-emerald-100",
  },
  {
    response: ReviewResponse.Easy,
    label: "Easy",
    hint: "Master",
    shortcut: "4",
    className: "border-blue-200 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:border-blue-900/60 dark:text-blue-300",
    shortcutClassName: "bg-blue-500/20 text-blue-700 dark:text-blue-200",
  },
]

export function RatingButtons({ onRate, disabled = false }: RatingButtonsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return

      const keyMap: Record<string, ReviewResponse> = {
        "1": ReviewResponse.Again,
        "2": ReviewResponse.Hard,
        "3": ReviewResponse.Good,
        "4": ReviewResponse.Easy,
      }

      const response = keyMap[e.key]
      if (response !== undefined) {
        e.preventDefault()
        onRate(response)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onRate, disabled])

  return (
    <div className="mt-6 grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
      {ratingOptions.map((option) => (
        <Button
          key={option.response}
          variant="outline"
          onClick={() => onRate(option.response)}
          disabled={disabled}
          className={cn(
            "h-auto min-w-0 flex-col items-start gap-0 rounded-xl px-3 py-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm",
            option.className
          )}
        >
          <div className="flex w-full items-center justify-between">
            <span className="font-semibold">{option.label}</span>
            <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", option.shortcutClassName)}>
              {option.shortcut}
            </span>
          </div>
          <span className="text-xs opacity-80">{option.hint}</span>
        </Button>
      ))}
    </div>
  )
}