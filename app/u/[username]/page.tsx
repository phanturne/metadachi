import { ClientHubView } from '@/components/ClientHubView';

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // In a real implementation, fetch from Supabase here:
  // const { data: cards } = await supabase.from('cards').select('*').eq('author', username);
  const cards: any[] = []; 

  return <ClientHubView username={username} initialCards={cards} />;
}
