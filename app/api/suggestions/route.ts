
import { getUser } from '@/supabase/queries/user';
import { getSuggestionsByDocumentId } from '@/supabase/queries/document';
import type { Suggestion } from '@/supabase/queries/chat';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return new Response('Not Found', { status: 404 });
  }

  const { user: sessionUser } = await getUser();

  if (!sessionUser) {
    return new Response('Unauthorized', { status: 401 });
  }

  const suggestions: Suggestion[] = await getSuggestionsByDocumentId({
    documentId,
  });

  const [suggestion] = suggestions;

  if (!suggestion) {
    return Response.json([], { status: 200 });
  }

  if (suggestion.user_id !== sessionUser.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json(suggestions, { status: 200 });
}
