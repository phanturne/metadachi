import { ClientHubView } from '@/components/ClientHubView';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/lib/types';

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { username } = await params;
  const sParams = await searchParams;
  const isMock = sParams.mock === 'true';

  let cards: Card[] = [];

  if (isMock) {
    // Return mock data for E2E tests
    cards = [{
      id: 'mock-card-1',
      title: 'Alexs Secret Sauce',
      rawContent: 'Secret content',
      type: 'recipe',
      tags: ['secret'],
      created: new Date().toISOString(),
      author: username,
      slug: 'secret-sauce',
      published: true,
      pinned: false,
      favorite: false,
      filePath: `community/${username}/secret-sauce`,
      relativePath: `${username}/secret-sauce`
    }];
  } else {
    // Fetch from Supabase
    const supabase = await createClient();
    const { data: dbCards, error } = await supabase
      .from('cards')
      .select('*, profiles!inner(handle)')
      .eq('profiles.handle', username)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[Hub] Error fetching cards for ${username}:`, error);
    }

    cards = (dbCards || []).map(c => ({
      id: c.id,
      title: c.title,
      rawContent: c.raw_content,
      type: c.type,
      tags: c.tags,
      created: c.created_at,
      author: username,
      slug: c.slug,
      published: true,
      pinned: false,
      favorite: false,
      filePath: `community/${username}/${c.slug}`,
      relativePath: `${username}/${c.slug}`
    }));
  }

  return <ClientHubView username={username} initialCards={cards} />;
}
