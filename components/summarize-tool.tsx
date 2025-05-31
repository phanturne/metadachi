"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Link as LinkIcon, Loader2, Sparkles, Type, Upload } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { FileUpload } from "./file-upload"

export type SummaryResponse = {
  summary: string
  keyPoints: string[]
  quotes: string[]
  tags: string[]
}

export const SUMMARY_PRESETS = {
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

export type SummaryPreset = keyof typeof SUMMARY_PRESETS

interface SummarizeToolProps {
  onSummaryGenerated?: (summary: SummaryResponse) => void
  className?: string
  showTitle?: boolean
}

export function SummarizeTool({ onSummaryGenerated, className = "", showTitle = false }: SummarizeToolProps) {
  const [inputType, setInputType] = useState<"text" | "url" | "file">("text")
  const [input, setInput] = useState("")
  const [customInstructions, setCustomInstructions] = useState("")
  const [selectedPreset, setSelectedPreset] = useState<SummaryPreset>("concise")
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [, setSummary] = useState<SummaryResponse | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handlePresetChange = (preset: SummaryPreset) => {
    setSelectedPreset(preset)
    if (preset !== "custom") {
      setCustomInstructions(SUMMARY_PRESETS[preset].instructions)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isGenerating) return
    
    if (inputType === "file" && !selectedFile) {
      toast.error("Please select a file to upload")
      return
    }
    if (inputType !== "file" && !input.trim()) return

    setIsGenerating(true)
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

      const sourceResponse = await fetch("/api/sources", {
        method: "POST",
        body: formData,
      })

      const sourceData = await sourceResponse.json()

      if (!sourceResponse.ok) {
        toast.error(sourceData.error || "Failed to create source")
        setIsGenerating(false)
        return
      }

      const newSummary = {
        summary: sourceData.summary,
        keyPoints: sourceData.keyPoints,
        quotes: sourceData.quotes,
        tags: sourceData.tags,
      }

      onSummaryGenerated?.(newSummary)
      
      toast.success("Summary generated successfully!")
      setIsGenerating(false)

    } catch (err) {
      console.error("Submit error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to submit request"
      toast.error(errorMessage)
      setIsGenerating(false)
    }
  }

  return (
    <div className={`bg-card rounded-xl shadow-lg p-6 border border-border/50 ${className}`}>
      {showTitle && (
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            AI Summary Generator
          </h1>
          <p className="text-muted-foreground">
            Transform any text, article, or document into a clear, concise summary with key insights
          </p>
        </div>
      )}

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
          <LinkIcon className="w-4 h-4" />
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
            <FileUpload
              selectedFile={selectedFile}
              onFileSelect={(file) => {
                setSelectedFile(file)
                setInput(file?.name || "")
              }}
              disabled={isGenerating}
            />
          ) : (
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={inputType === "text" ? "Paste your text here..." : "https://example.com/article"}
              className="min-h-[150px] resize-none text-base"
              disabled={isGenerating}
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
            className="min-h-[80px] resize-none text-base"
            disabled={isGenerating}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isGenerating || (inputType === "file" ? !selectedFile : !input.trim())} 
          className="w-full gap-2 h-11"
        >
          {isGenerating ? (
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

      {selectedFile && (
        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Summary</h3>
            <p className="text-muted-foreground">{selectedFile.name}</p>
          </div>

          {selectedFile.name.endsWith('.pdf') && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Key Points</h3>
              <p className="text-muted-foreground">Extracted key points from the PDF file.</p>
            </div>
          )}

          {selectedFile.name.endsWith('.doc') || selectedFile.name.endsWith('.docx') && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Key Points</h3>
              <p className="text-muted-foreground">Extracted key points from the Word document.</p>
            </div>
          )}

          {selectedFile.name.endsWith('.txt') && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Key Points</h3>
              <p className="text-muted-foreground">Extracted key points from the text file.</p>
            </div>
          )}

          {selectedFile.name.endsWith('.md') && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Key Points</h3>
              <p className="text-muted-foreground">Extracted key points from the Markdown file.</p>
            </div>
          )}

          {selectedFile.name.endsWith('.html') && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Key Points</h3>
              <p className="text-muted-foreground">Extracted key points from the HTML file.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 