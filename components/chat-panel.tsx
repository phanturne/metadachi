"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Source } from "@/types/chat"
import { useChat } from "ai/react"
import { Search, Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface ChatPanelProps {
  selectedSources: string[]
}

export function ChatPanel({ selectedSources }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isChatLoading,
    error,
  } = useChat({
    api: "/api/chat",
    body: {
      sourceIds: selectedSources,
    },
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="space-y-4 pr-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <div className="mb-4">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
              </div>
              <p className="text-lg font-medium mb-2">Start a conversation</p>
              <p className="text-sm">Ask questions about your sources and I&apos;ll search for relevant information.</p>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div
                className={cn(
                  "flex rounded-lg px-4 py-2",
                  message.role === "user" 
                    ? "ml-auto bg-primary text-primary-foreground max-w-[85%]" 
                    : "bg-muted max-w-[85%]"
                )}
              >
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
              </div>

              {/* Show tool calls */}
              {message.toolInvocations?.map((toolInvocation) => (
                <div key={toolInvocation.toolCallId} className="ml-4 space-y-2 max-w-[85%]">
                  {toolInvocation.state === "call" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4 animate-spin" />
                      <span>Searching sources for: &quot;{toolInvocation.args.query}&quot;</span>
                    </div>
                  )}
                  {toolInvocation.state === "result" && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-600">Source Search Results</span>
                      </div>
                      {toolInvocation.result.success ? (
                        <div className="space-y-3">
                          <p className="text-green-600">{toolInvocation.result.message}</p>
                          <div className="space-y-2">
                            {toolInvocation.result.sources.map((source: Source) => (
                              <div key={source.id} className="bg-white dark:bg-blue-950/40 rounded p-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-xs">
                                    Source {source.id}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Similarity: {Math.round(source.similarity * 100)}%
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-3">
                                  {source.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-amber-600">{toolInvocation.result.message}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          {isChatLoading && (
            <div className="flex rounded-lg px-4 py-2 bg-muted max-w-[85%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg max-w-[85%]">Error: {error.message}</div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex items-center space-x-2 mt-4">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about your sources..."
          disabled={isChatLoading || selectedSources.length === 0}
          className="flex-1"
        />
        <Button type="submit" disabled={isChatLoading || selectedSources.length === 0 || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
