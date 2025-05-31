import { Button } from "@/components/ui/button"
import { Book, FileText, Globe, Loader2, Sparkles } from "lucide-react"
import { useState } from "react"

interface Source {
  id: string
  type: "TEXT" | "URL" | "FILE"
  content: string | null
  url: string | null
  file_name: string | null
  file_path?: string | null
  created_at: string
  summary?: {
    summary_text: string
    key_points: string[]
    quotes: string[]
    tags: string[]
  } | null
}

interface SourceDetailProps {
  source: Source
  onLoadFileContent?: (filePath: string) => Promise<void>
  isGeneratingSummary?: boolean
  summary?: string
}

export function SourceDetail({
  source,
  onLoadFileContent,
  isGeneratingSummary = false,
  summary = ""
}: SourceDetailProps) {
  const [isContentExpanded, setIsContentExpanded] = useState(false)

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "URL":
        return <Globe className="h-4 w-4" />
      case "FILE":
        return <FileText className="h-4 w-4" />
      default:
        return <Book className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {getSourceIcon(source.type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {source.file_name || source.url || "Text Source"}
            </h3>
            <div className="text-sm text-muted-foreground">
              {formatDate(source.created_at)}
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-muted-foreground">Content</div>
            {source.type === "FILE" && !isGeneratingSummary && !summary && onLoadFileContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => source.file_path && onLoadFileContent(source.file_path)}
                className="h-8"
              >
                Load File Content
              </Button>
            )}
          </div>
          {source.type === "FILE" ? (
            <div>
              {isGeneratingSummary ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : summary ? (
                <div className="relative">
                  <div className={`whitespace-pre-wrap bg-muted/50 p-4 rounded-lg transition-all duration-200 ${isContentExpanded ? 'max-h-none' : 'max-h-[300px]'} overflow-y-auto`}>
                    {summary}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-0 right-0 bg-gradient-to-t from-background to-transparent px-4 py-2 hover:bg-transparent"
                    onClick={() => setIsContentExpanded(!isContentExpanded)}
                  >
                    {isContentExpanded ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="relative">
              <div className={`whitespace-pre-wrap bg-muted/50 p-4 rounded-lg transition-all duration-200 ${isContentExpanded ? 'max-h-none' : 'max-h-[300px]'} overflow-y-auto`}>
                {source.content || source.url}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-0 right-0 bg-gradient-to-t from-background to-transparent px-4 py-2 hover:bg-transparent"
                onClick={() => setIsContentExpanded(!isContentExpanded)}
              >
                {isContentExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </div>
          )}
        </div>
      </div>
      {source.summary && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Summary</span>
            </div>
            <div className="whitespace-pre-wrap text-muted-foreground">
              {source.summary.summary_text}
            </div>
          </div>
          {source.summary.key_points.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Key Points</div>
              <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
                {source.summary.key_points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}
          {source.summary.quotes.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Notable Quotes</div>
              <div className="space-y-2">
                {source.summary.quotes.map((quote, index) => (
                  <blockquote key={index} className="border-l-4 border-primary/20 pl-4 italic text-muted-foreground">
                    {quote}
                  </blockquote>
                ))}
              </div>
            </div>
          )}
          {source.summary.tags && source.summary.tags.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {source.summary.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 