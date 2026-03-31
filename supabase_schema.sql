-- 0. Clean previous tables if resetting
drop table if exists public.profiles cascade;
drop table if exists public.articles cascade;

-- 1. Create Articles Table
create table public.articles (
  id uuid not null default gen_random_uuid() primary key,
  date timestamp with time zone not null default now(),
  author_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  excerpt text,
  content text not null,
  category text not null,
  read_time text,
  featured_image text,
  tags text[] default '{}',
  views integer default 0,
  
  -- Nepali fields
  title_ne text,
  excerpt_ne text,
  content_ne text,
  tags_ne text[] default '{}',
  
  -- Inline Author info per note
  author_name text,
  author_bio text,
  author_avatar text
);

-- Articles RLS
alter table public.articles enable row level security;
create policy "Articles are viewable by everyone." on public.articles for select using (true);
create policy "Authors can insert their own articles." on public.articles for insert with check (auth.uid() = author_id);
create policy "Authors can update their own articles." on public.articles for update using (auth.uid() = author_id);
create policy "Authors can delete their own articles." on public.articles for delete using (auth.uid() = author_id);

-- 3. Storage Buckets for Images
insert into storage.buckets (id, name, public) values ('article-images', 'article-images', true) ON CONFLICT DO NOTHING;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Storage RLS (Article Images)
drop policy if exists "Public can view article images" on storage.objects;
drop policy if exists "Authenticated can upload article images" on storage.objects;
drop policy if exists "Authors can update their images" on storage.objects;

create policy "Public can view article images" on storage.objects for select using (bucket_id = 'article-images');
create policy "Authenticated can upload article images" on storage.objects for insert to authenticated with check (bucket_id = 'article-images');
create policy "Authors can update their images" on storage.objects for update to authenticated using (bucket_id = 'article-images');

-- Storage RLS (Avatars)
drop policy if exists "Public can view avatars" on storage.objects;
drop policy if exists "Authenticated can upload avatars" on storage.objects;
drop policy if exists "Authors can update own avatars" on storage.objects;

create policy "Public can view avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Authenticated can upload avatars" on storage.objects for insert to authenticated with check (bucket_id = 'avatars');
create policy "Authors can update own avatars" on storage.objects for update to authenticated using (bucket_id = 'avatars');
