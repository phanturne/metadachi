'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useRef, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { ChatHeader } from '@/components/chat/chat-header';
import { fetcher } from '@/lib/utils';
import type { Vote } from '@/supabase/queries/chat';

import { useBlockSelector } from '@/hooks/use-block';
import { useScroll } from '@/hooks/use-scroll-top';
import { Block } from '../block/block';
import { Messages } from '../message/messages';
import { MultimodalInput } from './multimodal-input';
import type { VisibilityType } from './visibility-selector';

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();

  const {
    messages,
    setMessages,
    handleSubmit: originalHandleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: { id, modelId: selectedModelId },
    initialMessages,
    experimental_throttle: 100,
    onFinish: (message) => {
      fetch(`/api/message`, {
        method: 'POST',
        body: JSON.stringify({ message: { ...message, chat_id: id } }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      mutate('/api/history');
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isBlockVisible = useBlockSelector((state) => state.isVisible);
  const messagesRef = useRef<HTMLDivElement>(null);
  const isScrolled = useScroll(messagesRef);

  return (
    <>
      <div className="flex h-full min-w-0 flex-col">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedModelId}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
          isScrolled={isScrolled}
        />

        <div ref={messagesRef} className="flex-1 overflow-auto">
          <Messages
            chatId={id}
            isLoading={isLoading}
            votes={votes}
            messages={messages}
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
            isBlockVisible={isBlockVisible}
          />
        </div>

        <form
          className="mx-auto flex w-full flex-col gap-2 bg-background px-4 pb-4 md:max-w-3xl md:pb-6"
          onSubmit={(event) => {
            event.preventDefault();
            originalHandleSubmit(undefined, {
              experimental_attachments: attachments,
            });
          }}
        >
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={originalHandleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>

      <Block
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={originalHandleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
