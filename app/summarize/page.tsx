"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Link, Loader2, Sparkles, Type } from 'lucide-react'
import { useState } from "react"
import { toast } from "sonner"

type SummaryResponse = {
  summary: string
  keyPoints: string[]
  quotes: string[]
}

export default function SummarizePage() {
  const [inputType, setInputType] = useState<"text" | "url">("text")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<SummaryResponse | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    setSummary(null)

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: input,
          inputType,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        toast.error(responseData.error || "Failed to generate summary")
        setIsLoading(false)
        return
      }

      // Successfully received the summary
      setSummary(responseData)
      toast.success("Summary generated successfully!")
    } catch (err) {
      console.error("Submit error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to submit request"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-3xl py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            AI Summary Generator
          </h1>
          <p className="text-muted-foreground">
            Transform any text or article into a clear, concise summary with key insights
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6 mb-8 border border-border/50">
          <div className="flex gap-3 mb-6">
            <Button
              variant={inputType === "text" ? "default" : "outline"}
              onClick={() => setInputType("text")}
              className="flex-1 gap-2"
            >
              <Type className="w-4 h-4" />
              Text Input
            </Button>
            <Button
              variant={inputType === "url" ? "default" : "outline"}
              onClick={() => setInputType("url")}
              className="flex-1 gap-2"
            >
              <Link className="w-4 h-4" />
              URL Input
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input" className="text-base">
                {inputType === "text" ? "Enter your text" : "Enter URL"}
              </Label>
              <Textarea
                id="input"
                value={input}
                onChange={handleInputChange}
                placeholder={inputType === "text" ? "Paste your text here..." : "https://example.com/article"}
                className="min-h-[200px] resize-none text-base"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" disabled={isLoading || !input.trim()} className="w-full gap-2 h-11">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Summary
                </>
              )}
            </Button>
          </form>
        </div>

        {summary && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card rounded-xl shadow-lg p-8 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Summary
              </h2>
              <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:leading-relaxed">
                {summary.summary}
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-lg p-8 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
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
              <ul className="space-y-3">
                {summary.keyPoints.map((point, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <span className="text-primary font-semibold mt-1">•</span>
                    <span className="prose prose-sm max-w-none">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {summary.quotes.length > 0 && (
              <div className="bg-card rounded-xl shadow-lg p-8 border border-border/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
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
                <div className="space-y-4">
                  {summary.quotes.map((quote, index) => (
                    <blockquote key={index} className="border-l-4 border-primary/20 pl-4 italic text-muted-foreground">
                      &ldquo;{quote}&rdquo;
                    </blockquote>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}