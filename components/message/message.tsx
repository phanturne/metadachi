'use client';

import type { ChatRequestOptions, Message } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';

import type { Vote } from '@/supabase/queries/chat';

import { cn } from '@/lib/utils';
import equal from 'fast-deep-equal';
import { File } from 'lucide-react';
import { DocumentToolCall, DocumentToolResult } from '../document/document';
import { DocumentPreview } from '../document/document-preview';
import { PencilEditIcon, SparklesIcon } from '../icons';
import { Markdown } from '../markdown';
import { PreviewAttachment } from '../preview-attachment';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Weather } from '../weather';
import { MessageActions } from './message-actions';
import { MessageEditor } from './message-editor';

const SourceButton = ({
  source,
}: {
  source: { title: string; content: string };
}) => {
  const [open, setOpen] = useState(false);

  // Get first line or first few words as fallback title
  const displayTitle =
    source.title || `${source.content.split('\n')[0].slice(0, 50)}...`;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="group relative flex items-center gap-2 max-w-[200px] hover:border-primary/50 transition-colors"
      >
        <File className="h-4 w-4 text-muted-foreground group-hover:text-primary/80 transition-colors" />
        <span className="truncate">{displayTitle}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              <span className="truncate">{displayTitle}</span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4 h-full max-h-[60vh] rounded-md border bg-muted/50 p-4">
            <Markdown>{source.content}</Markdown>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 w-full">
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {message.content && mode === 'view' && (
              <div className="flex flex-row gap-2 items-start">
                {message.role === 'user' && !isReadonly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                        onClick={() => {
                          setMode('edit');
                        }}
                      >
                        <PencilEditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                )}

                <div
                  className={cn('flex flex-col gap-4', {
                    'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                      message.role === 'user',
                  })}
                >
                  <Markdown>{message.content as string}</Markdown>
                </div>
              </div>
            )}

            {message.content && mode === 'edit' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

            {message.parts && message.parts.length > 0 && (
              <div className="flex flex-col gap-4 mt-4">
                {message.parts.map((part) => {
                  if (part.type === 'tool-invocation') {
                    const { toolInvocation } = part;
                    const { toolName, toolCallId, state, args } =
                      toolInvocation;

                    if (state === 'result') {
                      const { result } = toolInvocation;
                      return (
                        <div key={toolCallId}>
                          {toolName === 'getInformation' ? (
                            result.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                <div className="text-sm text-muted-foreground">
                                  References:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {result.map((source: any) => (
                                    <SourceButton
                                      key={`${source.title}-${source.content.slice(0, 20)}`}
                                      source={source}
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : null
                          ) : toolName === 'getWeather' ? (
                            <Weather weatherAtLocation={result} />
                          ) : toolName === 'createDocument' ? (
                            <DocumentPreview
                              isReadonly={isReadonly}
                              result={result}
                            />
                          ) : toolName === 'updateDocument' ? (
                            <DocumentToolResult
                              type="update"
                              result={result}
                              isReadonly={isReadonly}
                            />
                          ) : toolName === 'requestSuggestions' ? (
                            <DocumentToolResult
                              type="request-suggestions"
                              result={result}
                              isReadonly={isReadonly}
                            />
                          ) : (
                            <p>&quot;{toolName}&quot; tool was called</p>
                          )}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={toolCallId}
                        className={cx({
                          skeleton: ['getWeather'].includes(toolName),
                        })}
                      >
                        {toolName === 'getInformation' ? (
                          <div className="flex gap-2">
                            <div className="h-9 w-40 rounded-md bg-muted animate-pulse flex items-center px-3 gap-2">
                              <div className="h-4 w-4 rounded bg-muted-foreground/20" />
                              <div className="h-4 w-24 rounded bg-muted-foreground/20" />
                            </div>
                            <div className="h-9 w-40 rounded-md bg-muted animate-pulse flex items-center px-3 gap-2">
                              <div className="h-4 w-4 rounded bg-muted-foreground/20" />
                              <div className="h-4 w-24 rounded bg-muted-foreground/20" />
                            </div>
                          </div>
                        ) : toolName === 'getWeather' ? (
                          <Weather />
                        ) : toolName === 'createDocument' ? (
                          <DocumentPreview
                            isReadonly={isReadonly}
                            args={args}
                          />
                        ) : toolName === 'updateDocument' ? (
                          <DocumentToolCall
                            type="update"
                            args={args}
                            isReadonly={isReadonly}
                          />
                        ) : toolName === 'requestSuggestions' ? (
                          <DocumentToolCall
                            type="request-suggestions"
                            args={args}
                            isReadonly={isReadonly}
                          />
                        ) : null}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
