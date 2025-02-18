import { saveMessages } from '@/supabase/queries/chat';
import { getUser } from '@/supabase/queries/user';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const { user: sessionUser } = await getUser();

  if (!sessionUser) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  const { message } = await request.json();

  try {
    const messageId = uuidv4();
    await saveMessages({
      messages: [
        {
          id: messageId,
          chat_id: message.chat_id,
          role: message.role,
          content: message.content,
          user_id: sessionUser.id,
          parts: message.parts,
        },
      ],
    });

    return new Response('Message saved', { status: 200 });
  } catch (error) {
    console.error('Error saving message:', error);
    return new Response('Failed to save message', { status: 500 });
  }
}
