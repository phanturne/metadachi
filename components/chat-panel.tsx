'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Source } from '@/types/chat';
import { useChat } from 'ai/react';
import { MessageSquare, Search, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatPanelProps {
  selectedSources: string[];
}

export function ChatPanel({ selectedSources }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isChatLoading,
    error,
  } = useChat({
    api: '/api/chat',
    body: {
      sourceIds: selectedSources,
    },
    onError: error => {
      console.error('Chat error:', error);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {messages.length === 0 ? (
        <div className="flex h-full flex-1 items-center justify-center">
          <div className="text-muted-foreground text-center">
            <div className="mb-4">
              <MessageSquare className="mx-auto mb-2 h-12 w-12 opacity-50" />
            </div>
            <p className="mb-2 text-lg font-medium">Welcome to AI Chat</p>
            <p className="text-sm">
              I&apos;m here to help you explore and understand your sources. What would you like to
              know?
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea ref={scrollRef} className="min-h-0 flex-1">
          <div className="flex h-full flex-col space-y-4 pr-4">
            {messages.map(message => (
              <div key={message.id} className="space-y-2">
                <div
                  className={cn(
                    'flex rounded-lg px-4 py-2',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto max-w-[85%]'
                      : 'bg-muted max-w-[85%]'
                  )}
                >
                  <div className="break-words whitespace-pre-wrap">{message.content}</div>
                </div>

                {/* Show tool calls */}
                {message.toolInvocations?.map(toolInvocation => (
                  <div
                    key={toolInvocation.toolCallId}
                    className={cn(
                      'w-full max-w-[85%] space-y-2',
                      message.role === 'user' ? 'ml-auto' : 'ml-4'
                    )}
                  >
                    {toolInvocation.state === 'call' && (
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Search className="h-4 w-4 animate-spin" />
                        <span className="truncate">
                          Searching sources for: &quot;{toolInvocation.args.query}&quot;
                        </span>
                      </div>
                    )}
                    {toolInvocation.state === 'result' && (
                      <div className="rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-950/20">
                        <div className="mb-2 flex items-center gap-2">
                          <Search className="h-4 w-4 flex-shrink-0 text-blue-600" />
                          <span className="truncate font-medium text-blue-600">
                            Source Search Results
                          </span>
                        </div>
                        {toolInvocation.result.success ? (
                          <div className="space-y-3">
                            <p className="truncate text-xs text-green-600">
                              {toolInvocation.result.message}
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                              {toolInvocation.result.sources.map((source: Source) => (
                                <div
                                  key={source.id}
                                  className="cursor-pointer rounded bg-white p-2 transition-colors hover:bg-blue-50 dark:bg-blue-950/40 dark:hover:bg-blue-950/60"
                                  onClick={() => setSelectedSource(source)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-medium">{source.title}</p>
                                      <div className="mt-0.5 flex items-center gap-1.5">
                                        <Badge
                                          variant="secondary"
                                          className="h-4 px-1.5 py-0 text-[10px]"
                                        >
                                          {source.type.toLowerCase()}
                                        </Badge>
                                        <span className="text-muted-foreground text-[10px]">
                                          {Math.round(source.similarity * 100)}% match
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="truncate text-amber-600">{toolInvocation.result.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
            {isChatLoading && (
              <div className="bg-muted flex max-w-[85%] rounded-lg px-4 py-2">
                <div className="flex space-x-2">
                  <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full" />
                  <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:0.2s]" />
                  <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            {error && (
              <div className="bg-destructive/10 text-destructive max-w-[85%] rounded-lg px-4 py-2">
                Error: {error.message}
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-shrink-0 items-center space-x-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about your sources..."
          disabled={isChatLoading || selectedSources.length === 0}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isChatLoading || selectedSources.length === 0 || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Source Content Modal */}
      <Dialog open={!!selectedSource} onOpenChange={() => setSelectedSource(null)}>
        <DialogContent className="flex max-h-[80vh] max-w-3xl flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="truncate">
                {selectedSource?.file_name || selectedSource?.url || 'Text Source'}
              </span>
              <Badge variant="secondary" className="text-xs">
                {selectedSource?.type.toLowerCase()}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="-mr-4 flex-1 pr-4">
            <div className="prose dark:prose-invert max-w-none">
              <pre className="text-sm whitespace-pre-wrap">{selectedSource?.content}</pre>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
