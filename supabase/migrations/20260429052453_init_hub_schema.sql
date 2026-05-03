-- Metadachi Hub Production Schema

-- 1. PROFILES: Extends Supabase Auth users
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  handle text unique not null check (handle ~* '^[a-zA-Z0-9_]{3,20}$'),
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. CARDS: The published notes/recipes
create table public.cards (
  id text primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  raw_content text not null,
  type text default 'note',
  slug text not null,
  tags text[] default '{}',
  published boolean default true,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Ensure a user can't have two cards with the same slug
  unique(author_id, slug)
);

-- 3. INDEXES: Speed up community discovery
create index cards_author_id_idx on public.cards (author_id);
create index cards_slug_idx on public.cards (slug);
create index cards_type_idx on public.cards (type);
create index cards_tags_gin_idx on public.cards using gin (tags);

-- 4. FULL-TEXT SEARCH: Enable high-performance cookbook searching
alter table public.cards add column fts tsvector 
  generated always as (to_tsvector('english', title || ' ' || raw_content)) stored;
create index cards_fts_idx on public.cards using gin (fts);

-- 5. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.cards enable row level security;

-- Profile Policies
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using (true);

create policy "Users can update their own profile" 
  on public.profiles for update using (auth.uid() = id);

-- Card Policies
create policy "Published cards are viewable by everyone" 
  on public.cards for select using (published = true);

create policy "Users can insert their own cards" 
  on public.cards for insert with check (auth.uid() = author_id);

create policy "Users can update their own cards" 
  on public.cards for update using (auth.uid() = author_id);

create policy "Users can delete their own cards" 
  on public.cards for delete using (auth.uid() = author_id);

-- 6. TRIGGERS: Automatically manage updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger set_cards_updated_at
  before update on public.cards
  for each row execute procedure public.handle_updated_at();

-- 7. AUTH TRIGGER: Automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_handle text;
begin
  -- Generate a default handle from email (e.g. alex@example.com -> alex)
  default_handle := split_part(new.email, '@', 1);
  
  -- Ensure handle uniqueness by appending random suffix if needed
  -- (Simple version: handle_123)
  if exists (select 1 from public.profiles where handle = default_handle) then
    default_handle := default_handle || '_' || substr(md5(random()::text), 1, 4);
  end if;

  insert into public.profiles (id, handle, display_name)
  values (new.id, default_handle, new.raw_user_meta_data->>'display_name');
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
