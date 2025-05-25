"use client"

import { SummarizeTool, SummaryResponse } from "@/components/summarize-tool"
import { SummaryResults } from "@/components/summary-results"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { BookOpen, Brain, Search, Sparkles, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()

  // Immediate redirect if user is authenticated
  if (user) {
    router.replace('/home')
    return null
  }

  const handleSummaryGenerated = (newSummary: SummaryResponse) => {
    setSummary(newSummary)
    // Store summary in localStorage
    localStorage.setItem('pendingSummary', JSON.stringify(newSummary))
    setIsNavigating(true)
    router.push('/summarize')
  }

  if (isNavigating) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl py-8 px-4">
        {/* Hero Section with Summarize Tool */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Value Proposition */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Transform Content into Actionable Insights
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Instantly summarize articles, research papers, and websites with AI. Get key insights, customize your experience, and build your personal knowledge library.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered insights with key concepts and meaningful quotes
                </p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Instant Results</h3>
                <p className="text-sm text-muted-foreground">
                  Get comprehensive summaries in seconds, not minutes
                </p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Knowledge Library</h3>
                <p className="text-sm text-muted-foreground">
                  Save and organize your summaries with smart tags
                </p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
                <p className="text-sm text-muted-foreground">
                  Find insights across all your saved summaries
                </p>
              </div>
            </div>
          </div>

          {/* Right: Summarize Tool */}
          <SummarizeTool onSummaryGenerated={handleSummaryGenerated} />
        </div>

        {/* Summary Results */}
        {summary && <SummaryResults summary={summary} className="mb-16" />}

        {/* Knowledge Management Section */}
        <div className="bg-card rounded-xl p-8 border border-border/50 mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Build Your Knowledge Library</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Save and organize your summaries with smart tags and categories. Access your insights anytime, anywhere, and build a searchable knowledge base.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <span>Smart search across all your summaries</span>
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>Organize with custom tags and categories</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>AI-powered insights and connections</span>
                </li>
              </ul>
            </div>
            <div className="hidden md:block">
              <div className="aspect-square rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-primary/20" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-card rounded-xl p-8 border border-border/50 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Content?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join our users who are saving time, gaining insights, and building their knowledge library with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="gap-2" onClick={() => router.push("/login")}>
              <BookOpen className="h-5 w-5" />
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
