"use client"

import { SummarizeTool, SummaryResponse } from "@/components/summarize-tool"
import { SummaryResults } from "@/components/summary-results"
import { useAuth } from "@/contexts/auth-context"
import { Link } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function SummarizePage() {
  const { user, signInAnonymously } = useAuth()
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Read summary from localStorage if it exists
    const storedSummary = localStorage.getItem('pendingSummary')
    if (storedSummary) {
      try {
        const parsedSummary = JSON.parse(storedSummary)
        setSummary(parsedSummary)
        // Clear the stored summary
        localStorage.removeItem('pendingSummary')
      } catch (error) {
        console.error('Failed to parse summary from localStorage:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const handleSummaryGenerated = async (newSummary: SummaryResponse) => {
    setSummary(newSummary)
    
    if (!user) {
      try {
        await signInAnonymously()
        setIsGuest(true)
        toast.info("We've created a temporary guest account to save your summaries. Add an email to keep them forever!", {
          duration: 5000,
        })
      } catch {
        toast.error("Failed to create guest account. Please try again.")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-3xl py-12 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="h-[400px] bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-3xl py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            AI Summary Generator
          </h1>
          <p className="text-muted-foreground">
            Transform any text, article, or document into a clear, concise summary with key insights
          </p>
          {isGuest && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Your files and summaries are saved securely with a guest account.</p>
              <p className="mt-1">
                <Link href="/auth/signup" className="text-primary hover:underline">
                  Sign up
                </Link>{" "}
                to access them anytime.
              </p>
            </div>
          )}
        </div>

        <SummarizeTool 
          onSummaryGenerated={handleSummaryGenerated}
        />
        
        {summary && <SummaryResults summary={summary} className="mt-8" />}
      </div>
    </div>
  )
}