-- Published cards must go through quota-gated RPC so direct PostgREST upserts cannot bypass limits.
-- Per-card id uses pg_advisory_xact_lock + ROW_COUNT guard so conflicting upserts cannot succeed silently.

-- Tune these for your hub (documented constants in-function).
create table if not exists public.publish_rate_buckets (
  user_id uuid not null references auth.users (id) on delete cascade,
  bucket_start timestamptz not null,
  operation_count int not null default 0 check (operation_count >= 0),
  primary key (user_id, bucket_start)
);

create index if not exists publish_rate_buckets_bucket_start_idx
  on public.publish_rate_buckets (bucket_start);

comment on table public.publish_rate_buckets is
  'Hourly upsert quotas for upsert_published_cards; increments roll back with the enclosing transaction on failure';

alter table public.publish_rate_buckets enable row level security;

-- Writable only via upsert_published_cards (SECURITY DEFINER owner bypasses RLS).
revoke all on table public.publish_rate_buckets from public;
revoke all on table public.publish_rate_buckets from anon;
revoke all on table public.publish_rate_buckets from authenticated;

create or replace function public.upsert_published_cards(p_cards jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  bucket timestamptz := date_trunc('hour', now());
  n int := coalesce(jsonb_array_length(p_cards), 0);
  new_total int;
  elem_record record;
  v_id text;
  v_title text;
  v_raw text;
  v_type text;
  v_slug text;
  v_tags text[];
  v_published boolean;
  v_meta jsonb;
  owner_id uuid;
  ins_rows bigint;

  max_batch constant int := 200;
  max_per_hour constant int := 2000;
  max_id_len constant int := 512;
  max_title_len constant int := 2048;
  max_raw_chars constant int := 2_500_000;
  max_slug_len constant int := 512;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if p_cards is null or jsonb_typeof(p_cards) <> 'array' then
    raise exception 'p_cards must be a json array';
  end if;

  if n > max_batch then
    raise exception 'batch exceeds maximum of % cards', max_batch using errcode = 'P0001';
  end if;

  if n = 0 then
    return;
  end if;

  insert into public.publish_rate_buckets (user_id, bucket_start, operation_count)
  values (uid, bucket, n)
  on conflict (user_id, bucket_start) do update
    set operation_count = publish_rate_buckets.operation_count + excluded.operation_count
  returning operation_count into new_total;

  if coalesce(new_total, 0) > max_per_hour then
    raise exception 'hourly publish quota exceeded (% per hour)', max_per_hour using errcode = 'P0001';
  end if;

  for elem_record in select * from jsonb_array_elements(p_cards) as jae(elem)
  loop
    v_id := nullif(trim(elem_record.elem ->> 'id'), '');
    v_title := nullif(trim(elem_record.elem ->> 'title'), '');
    v_raw := elem_record.elem ->> 'raw_content';

    if v_id is null or length(v_id) > max_id_len then
      raise exception 'invalid id' using errcode = 'P0001';
    end if;

    if v_title is null or length(v_title) > max_title_len then
      raise exception 'invalid title' using errcode = 'P0001';
    end if;

    if v_raw is null or char_length(v_raw) > max_raw_chars then
      raise exception 'invalid raw_content' using errcode = 'P0001';
    end if;

    v_type := coalesce(nullif(trim(elem_record.elem ->> 'type'), ''), 'note');
    v_slug := coalesce(nullif(trim(elem_record.elem ->> 'slug'), ''), v_title);
    if length(v_slug) > max_slug_len then
      raise exception 'invalid slug' using errcode = 'P0001';
    end if;

    if elem_record.elem ? 'published' then
      v_published := coalesce((elem_record.elem ->> 'published')::boolean, true);
    else
      v_published := true;
    end if;

    v_meta := coalesce(elem_record.elem -> 'metadata', '{}'::jsonb);
    if jsonb_typeof(v_meta) <> 'object' then
      raise exception 'metadata must be a json object' using errcode = 'P0001';
    end if;

    if elem_record.elem -> 'tags' is null then
      v_tags := '{}'::text[];
    elsif jsonb_typeof(elem_record.elem -> 'tags') <> 'array' then
      raise exception 'tags must be a json array' using errcode = 'P0001';
    else
      select coalesce(array(select jsonb_array_elements_text(elem_record.elem -> 'tags')), '{}'::text[]) into v_tags;
    end if;

    -- Serialize contenders for the same card id so no txn can slip an insert between check and upsert.
    -- hashtext(text) is built-in; we widen its int4 result to int8 for the advisory lock key.
    perform pg_advisory_xact_lock(hashtext(v_id)::bigint);

    select c.author_id into owner_id from public.cards c where c.id = v_id;
    if owner_id is not null and owner_id is distinct from uid then
      raise exception 'cannot upsert card % owned by another user', v_id using errcode = 'P0001';
    end if;

    insert into public.cards (
      id, author_id, title, raw_content, type, slug, tags, published, metadata
    )
    values (
      v_id, uid, v_title, v_raw, v_type, v_slug, coalesce(v_tags, '{}'::text[]), v_published, v_meta
    )
    on conflict (id) do update set
      title = excluded.title,
      raw_content = excluded.raw_content,
      type = excluded.type,
      slug = excluded.slug,
      tags = excluded.tags,
      published = excluded.published,
      metadata = excluded.metadata,
      author_id = excluded.author_id
    where public.cards.author_id = excluded.author_id;

    get diagnostics ins_rows = row_count;

    if ins_rows is distinct from 1 then
      raise exception
        'cannot publish card %: id collision with another hub account — change the card id locally or unpublish conflicts',
        v_id using errcode = 'P0001';
    end if;

  end loop;
end;
$$;

comment on function public.upsert_published_cards(jsonb) is
  'Upsert published hub cards under auth.uid() with hourly quotas (adjust max_batch/max_per_hour in function body as needed).';

revoke execute on function public.upsert_published_cards(jsonb) from public;
revoke execute on function public.upsert_published_cards(jsonb) from anon;
grant execute on function public.upsert_published_cards(jsonb) to authenticated;

revoke insert, update on table public.cards from anon;
revoke insert, update on table public.cards from authenticated;

drop policy if exists "Users can insert their own cards" on public.cards;
drop policy if exists "Users can update their own cards" on public.cards;
