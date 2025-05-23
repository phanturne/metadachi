"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { signInAnonymouslyIfNeeded } from "@/utils/supabase/anonymous"
import { createClient } from "@/utils/supabase/client"
import { Link, Loader2, Sparkles, Type, Upload } from 'lucide-react'
import { useRef, useState } from "react"
import { toast } from "sonner"

type SummaryResponse = {
  summary: string
  keyPoints: string[]
  quotes: string[]
  tags: string[]
}

const SUMMARY_PRESETS = {
  concise: {
    label: "Concise",
    instructions: "Provide a brief, to-the-point summary focusing on the most essential information. Keep it under 100 words.",
  },
  detailed: {
    label: "Detailed",
    instructions: "Provide a comprehensive analysis with in-depth insights and thorough coverage of all major points.",
  },
  academic: {
    label: "Academic",
    instructions: "Analyze the content from an academic perspective, highlighting methodology, findings, and implications.",
  },
  business: {
    label: "Business",
    instructions: "Focus on business implications, market insights, and actionable takeaways for professionals.",
  },
  custom: {
    label: "Custom",
    instructions: "",
  },
} as const

type SummaryPreset = keyof typeof SUMMARY_PRESETS

const ALLOWED_FILE_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/html',
]

export default function SummarizePage() {
  const [inputType, setInputType] = useState<"text" | "url" | "file">("text")
  const [input, setInput] = useState("")
  const [customInstructions, setCustomInstructions] = useState("")
  const [selectedPreset, setSelectedPreset] = useState<SummaryPreset>("concise")
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Unsupported file type. Please upload a text file, PDF, or Word document.")
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File size too large. Please upload a file smaller than 10MB.")
      return
    }

    setSelectedFile(file)
    setInput(file.name) // Show filename in the input field
  }

  const handlePresetChange = (preset: SummaryPreset) => {
    setSelectedPreset(preset)
    if (preset !== "custom") {
      setCustomInstructions(SUMMARY_PRESETS[preset].instructions)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return // Prevent double submission
    
    if (inputType === "file" && !selectedFile) {
      toast.error("Please select a file to upload")
      return
    }
    if (inputType !== "file" && !input.trim()) return

    // Modular anonymous sign-in
    const { isGuest, error } = await signInAnonymouslyIfNeeded(supabase)
    if (error) {
      toast.error("Failed to create guest account. Please try again.")
      return
    }
    if (isGuest) {
      setIsGuest(true)
      toast.info("We've created a temporary guest account to save your summaries. Add an email to keep them forever!", {
        duration: 5000,
      })
    }

    setIsLoading(true)
    setSummary(null)

    try {
      const formData = new FormData()
      formData.append("type", inputType.toUpperCase())
      
      if (inputType === "file" && selectedFile) {
        formData.append("file", selectedFile)
      } else {
        formData.append("content", input)
        if (inputType === "url") {
          formData.append("url", input)
        }
      }
      
      formData.append("customInstructions", customInstructions)

      // Create source and get summary
      const sourceResponse = await fetch("/api/sources", {
        method: "POST",
        body: formData,
      })

      const sourceData = await sourceResponse.json()

      if (!sourceResponse.ok) {
        toast.error(sourceData.error || "Failed to create source")
        setIsLoading(false)
        return
      }

      // Use the immediate summary response
      setSummary({
        summary: sourceData.summary,
        keyPoints: sourceData.keyPoints,
        quotes: sourceData.quotes,
        tags: sourceData.tags,
      })
      
      // Update file info if it's a file upload
      if (inputType === "file" && selectedFile) {
        setSelectedFile(new File([selectedFile], selectedFile.name, {
          type: selectedFile.type,
          lastModified: selectedFile.lastModified
        }))
      }
      
      toast.success("Summary generated successfully!")
      setIsLoading(false)

    } catch (err) {
      console.error("Submit error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to submit request"
      toast.error(errorMessage)
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
            <Button
              variant={inputType === "file" ? "default" : "outline"}
              onClick={() => setInputType("file")}
              className="flex-1 gap-2"
            >
              <Upload className="w-4 h-4" />
              File Upload
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input" className="text-base">
                {inputType === "text" ? "Enter your text" : inputType === "url" ? "Enter URL" : "Upload file"}
              </Label>
              {inputType === "file" ? (
                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={ALLOWED_FILE_TYPES.join(",")}
                    className="hidden"
                  />
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      Choose File
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null)
                        setInput("")
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                      disabled={!selectedFile}
                    >
                      Clear
                    </Button>
                  </div>
                  {selectedFile && (
                    <div className="text-sm text-muted-foreground">
                      Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                    </div>
                  )}
                </div>
              ) : (
                <Textarea
                  id="input"
                  value={input}
                  onChange={handleInputChange}
                  placeholder={inputType === "text" ? "Paste your text here..." : "https://example.com/article"}
                  className="min-h-[200px] resize-none text-base"
                  disabled={isLoading}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customInstructions" className="text-base">
                Summary Style
              </Label>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(SUMMARY_PRESETS).map(([key, { label }]) => (
                  <Button
                    key={key}
                    type="button"
                    variant={selectedPreset === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetChange(key as SummaryPreset)}
                    className="rounded-full"
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <Textarea
                id="customInstructions"
                value={customInstructions}
                onChange={(e) => {
                  setCustomInstructions(e.target.value)
                  setSelectedPreset("custom")
                }}
                placeholder="Add any specific requirements to tailor the summary..."
                className="min-h-[100px] resize-none text-base"
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || (inputType === "file" ? !selectedFile : !input.trim())} 
              className="w-full gap-2 h-11"
            >
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

            <div className="bg-card rounded-xl shadow-lg p-8 border border-border/50">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
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