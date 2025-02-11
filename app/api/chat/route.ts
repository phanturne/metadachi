import { getUser } from '@/supabase/queries/user';
import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  streamObject,
  streamText,
} from 'ai';
import { z } from 'zod';

import { customModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import {
  codePrompt,
  systemPrompt,
  updateDocumentPrompt,
} from '@/lib/ai/prompts';
import {
  saveChat,
  saveMessages,
  deleteChatById,
  getChatById,
} from '@/supabase/queries/chat';
import {
  getDocumentById,
  saveDocument,
  saveSuggestions,
} from '@/supabase/queries/document';
import {
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

import type { TablesInsert } from '@/supabase/types';
import { generateTitleFromUserMessage } from '@/app/(sidebar)/(chat)/actions';
import { handleRetrieval } from '@/supabase/queries/embedding';

export const maxDuration = 60;

type AllowedTools =
  | 'createDocument'
  | 'updateDocument'
  | 'requestSuggestions'
  | 'getWeather'
  | 'getInformation';

const blocksTools: AllowedTools[] = [
  'createDocument',
  'updateDocument',
  'requestSuggestions',
];

const weatherTools: AllowedTools[] = ['getWeather'];

const allTools: AllowedTools[] = [
  ...blocksTools,
  ...weatherTools,
  'getInformation',
];

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
    fileIds,
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
    fileIds?: string[];
  } = await request.json();

  const hasFiles = !!fileIds?.length;
  console.log('fileIds', fileIds);

  const { user: sessionUser } = await getUser();

  if (!sessionUser || !sessionUser.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  let chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: sessionUser.id, title });
    chat = await getChatById({ id });
  }

  if (!chat) {
    return new Response('Failed to create or retrieve chat', { status: 500 });
  }

  const userMessageId = uuidv4();

  await saveMessages({
    messages: [
      {
        ...userMessage,
        content: JSON.stringify(userMessage.content),
        id: userMessageId,
        chat_id: id,
        user_id: sessionUser.id,
      },
    ],
  });

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });

      const result = streamText({
        model: customModel(model.apiIdentifier),
        system: systemPrompt,
        messages: coreMessages,
        maxSteps: 5,
        experimental_activeTools: allTools,
        tools: {
          getWeather: {
            description: 'Get the current weather at a location',
            parameters: z.object({
              latitude: z.number(),
              longitude: z.number(),
            }),
            execute: async ({ latitude, longitude }) => {
              const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
              );

              const weatherData = await response.json();
              return weatherData;
            },
          },
          createDocument: {
            description:
              'Create a document for a writing activity. This tool will call other functions that will generate the contents of the document based on the title and kind.',
            parameters: z.object({
              title: z.string(),
              kind: z.enum(['text', 'code']),
            }),
            execute: async ({ title, kind }) => {
              const id = uuidv4();
              let draftText = '';

              dataStream.writeData({
                type: 'id',
                content: id,
              });

              dataStream.writeData({
                type: 'title',
                content: title,
              });

              dataStream.writeData({
                type: 'kind',
                content: kind,
              });

              dataStream.writeData({
                type: 'clear',
                content: '',
              });

              if (kind === 'text') {
                const { fullStream } = streamText({
                  model: customModel(model.apiIdentifier),
                  system:
                    'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
                  prompt: title,
                });

                for await (const delta of fullStream) {
                  const { type } = delta;

                  if (type === 'text-delta') {
                    const { textDelta } = delta;

                    draftText += textDelta;
                    dataStream.writeData({
                      type: 'text-delta',
                      content: textDelta,
                    });
                  }
                }

                dataStream.writeData({ type: 'finish', content: '' });
              } else if (kind === 'code') {
                const { fullStream } = streamObject({
                  model: customModel(model.apiIdentifier),
                  system: codePrompt,
                  prompt: title,
                  schema: z.object({
                    code: z.string(),
                  }),
                });

                for await (const delta of fullStream) {
                  const { type } = delta;

                  if (type === 'object') {
                    const { object } = delta;
                    const { code } = object;

                    if (code) {
                      dataStream.writeData({
                        type: 'code-delta',
                        content: code ?? '',
                      });

                      draftText = code;
                    }
                  }
                }

                dataStream.writeData({ type: 'finish', content: '' });
              }

              if (sessionUser.id) {
                await saveDocument({
                  id,
                  title,
                  kind,
                  content: draftText,
                  userId: sessionUser.id,
                  chatId: chat.id,
                });
              }

              return {
                id,
                title,
                kind,
                chatId: chat.id,
                content:
                  'A document was created and is now visible to the user.',
              };
            },
          },
          updateDocument: {
            description: 'Update a document with the given description.',
            parameters: z.object({
              id: z.string().describe('The ID of the document to update'),
              description: z
                .string()
                .describe('The description of changes that need to be made'),
            }),
            execute: async ({ id, description }) => {
              const document = await getDocumentById({ id });

              if (!document) {
                return {
                  error: 'Document not found',
                };
              }

              const { content: currentContent } = document;
              let draftText = '';

              dataStream.writeData({
                type: 'clear',
                content: document.title,
              });

              if (document.kind === 'text') {
                const { fullStream } = streamText({
                  model: customModel(model.apiIdentifier),
                  system: updateDocumentPrompt(currentContent),
                  prompt: description,
                  experimental_providerMetadata: {
                    openai: {
                      prediction: {
                        type: 'content',
                        content: currentContent,
                      },
                    },
                  },
                });

                for await (const delta of fullStream) {
                  const { type } = delta;

                  if (type === 'text-delta') {
                    const { textDelta } = delta;

                    draftText += textDelta;
                    dataStream.writeData({
                      type: 'text-delta',
                      content: textDelta,
                    });
                  }
                }

                dataStream.writeData({ type: 'finish', content: '' });
              } else if (document.kind === 'code') {
                const { fullStream } = streamObject({
                  model: customModel(model.apiIdentifier),
                  system: updateDocumentPrompt(currentContent),
                  prompt: description,
                  schema: z.object({
                    code: z.string(),
                  }),
                });

                for await (const delta of fullStream) {
                  const { type } = delta;

                  if (type === 'object') {
                    const { object } = delta;
                    const { code } = object;

                    if (code) {
                      dataStream.writeData({
                        type: 'code-delta',
                        content: code ?? '',
                      });

                      draftText = code;
                    }
                  }
                }

                dataStream.writeData({ type: 'finish', content: '' });
              }

              if (sessionUser.id) {
                await saveDocument({
                  id,
                  title: document.title,
                  content: draftText,
                  kind: document.kind,
                  userId: sessionUser.id,
                  chatId: document.chat_id,
                });
              }

              return {
                id,
                title: document.title,
                kind: document.kind,
                chatId: document.chat_id,
                content: 'The document has been updated successfully.',
              };
            },
          },
          requestSuggestions: {
            description: 'Request suggestions for a document',
            parameters: z.object({
              documentId: z
                .string()
                .describe('The ID of the document to request edits'),
            }),
            execute: async ({ documentId }) => {
              const document = await getDocumentById({ id: documentId });

              if (!document || !document.content) {
                return {
                  error: 'Document not found',
                };
              }

              const suggestions: Array<TablesInsert<'suggestion'>> = [];

              const { elementStream } = streamObject({
                model: customModel(model.apiIdentifier),
                system:
                  'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
                prompt: document.content,
                output: 'array',
                schema: z.object({
                  originalSentence: z
                    .string()
                    .describe('The original sentence'),
                  suggestedSentence: z
                    .string()
                    .describe('The suggested sentence'),
                  description: z
                    .string()
                    .describe('The description of the suggestion'),
                }),
              });

              for await (const element of elementStream) {
                const suggestion = {
                  original_text: element.originalSentence,
                  suggested_text: element.suggestedSentence,
                  description: element.description,
                  document_id: documentId,
                  is_resolved: false,
                  user_id: sessionUser.id,
                  document_created_at: document.created_at,
                };

                dataStream.writeData({
                  type: 'suggestion',
                  content: suggestion,
                });

                suggestions.push(suggestion);
              }

              if (sessionUser.id) {
                await saveSuggestions({
                  suggestions: suggestions,
                });
              }

              return {
                id: documentId,
                title: document.title,
                kind: document.kind,
                chatId: document.chat_id,
                message: 'Suggestions have been added to the document',
              };
            },
          },
          getInformation: {
            description:
              'Get information from your knowledge base to answer questions.',
            parameters: z.object({
              query: z.string().describe('The user query'),
            }),
            execute: async ({ query }) => {
              const results = await handleRetrieval(query, 5, fileIds);
              return results;
            },
          },
        },
        onFinish: async ({ response }) => {
          if (sessionUser.id) {
            try {
              const responseMessagesWithoutIncompleteToolCalls =
                sanitizeResponseMessages(response.messages);

              await saveMessages({
                messages: responseMessagesWithoutIncompleteToolCalls.map(
                  (message) => {
                    const messageId = uuidv4();

                    if (message.role === 'assistant') {
                      dataStream.writeMessageAnnotation({
                        messageIdFromServer: messageId,
                      });
                    }

                    return {
                      id: messageId,
                      chat_id: id,
                      role: message.role,
                      content: JSON.stringify(message.content),
                      user_id: sessionUser.id,
                    };
                  },
                ),
              });
            } catch (error) {
              console.error('Failed to save chat');
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
        // toolChoice: hasFiles
        //   ? { type: 'tool', toolName: 'getInformation' }
        //   : 'auto',
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const { user: sessionUser } = await getUser();

  if (!sessionUser) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat?.user_id !== sessionUser.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
