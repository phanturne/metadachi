"use client"

import { Sparkles } from "lucide-react"
import { SummaryResponse } from "./summarize-tool"

interface SummaryResultsProps {
  summary: SummaryResponse
  className?: string
}

export function SummaryResults({ summary, className = "" }: SummaryResultsProps) {
  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}>
      <div className="bg-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Summary
        </h2>
        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:leading-relaxed">
          {summary.summary}
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Key Points
        </h2>
        <ul className="space-y-2">
          {summary.keyPoints.map((point, index) => (
            <li key={index} className="flex gap-3 items-start">
              <span className="text-primary font-semibold mt-1">•</span>
              <span className="prose prose-sm max-w-none">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Tags
        </h2>
        <div className="flex flex-wrap gap-2">
          {summary.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {summary.quotes.length > 0 && (
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Notable Quotes
          </h2>
          <div className="space-y-3">
            {summary.quotes.map((quote, index) => (
              <blockquote key={index} className="border-l-4 border-primary/20 pl-4 italic text-muted-foreground">
                &ldquo;{quote}&rdquo;
              </blockquote>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 