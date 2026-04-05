-- 0. Clean previous tables if resetting
drop table if exists public.profiles cascade;
drop table if exists public.articles cascade;
drop table if exists public.syllabuses cascade;
drop table if exists public.old_questions cascade;

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
  author_avatar text,

  -- New fields for Solutions / Bank specific notes
  bank text,
  level text
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

-- 4. Syllabuses Table
create table public.syllabuses (
  id uuid not null default gen_random_uuid() primary key,
  bank text not null,
  level text not null,
  pdf_url text not null,
  updated_at timestamp with time zone default now(),
  unique(bank, level)
);

alter table public.syllabuses enable row level security;
create policy "Syllabuses are viewable by everyone." on public.syllabuses for select using (true);
create policy "Authenticated can insert syllabuses." on public.syllabuses for insert to authenticated with check (true);
create policy "Authenticated can update syllabuses." on public.syllabuses for update to authenticated using (true);
create policy "Authenticated can delete syllabuses." on public.syllabuses for delete to authenticated using (true);

-- 4.1 Old Questions Table
create table public.old_questions (
  id uuid not null default gen_random_uuid() primary key,
  bank text not null,
  level text not null,
  year text not null,
  pdf_url text not null,
  updated_at timestamp with time zone default now()
);

alter table public.old_questions enable row level security;
create policy "Old questions are viewable by everyone." on public.old_questions for select using (true);
create policy "Authenticated can insert old_questions." on public.old_questions for insert to authenticated with check (true);
create policy "Authenticated can update old_questions." on public.old_questions for update to authenticated using (true);
create policy "Authenticated can delete old_questions." on public.old_questions for delete to authenticated using (true);


-- 5. Storage Buckets for PDFs
insert into storage.buckets (id, name, public) values ('syllabuses', 'syllabuses', true) ON CONFLICT DO NOTHING;
insert into storage.buckets (id, name, public) values ('old-questions', 'old-questions', true) ON CONFLICT DO NOTHING;

drop policy if exists "Public can view syllabuses" on storage.objects;
drop policy if exists "Authenticated can upload syllabuses" on storage.objects;
drop policy if exists "Authenticated can update syllabuses" on storage.objects;
drop policy if exists "Authenticated can delete syllabuses" on storage.objects;

create policy "Public can view syllabuses" on storage.objects for select using (bucket_id = 'syllabuses');
create policy "Authenticated can upload syllabuses" on storage.objects for insert to authenticated with check (bucket_id = 'syllabuses');
create policy "Authenticated can update syllabuses" on storage.objects for update to authenticated using (bucket_id = 'syllabuses');
create policy "Authenticated can delete syllabuses" on storage.objects for delete to authenticated using (bucket_id = 'syllabuses');

drop policy if exists "Public can view old-questions" on storage.objects;
drop policy if exists "Authenticated can upload old-questions" on storage.objects;
drop policy if exists "Authenticated can update old-questions" on storage.objects;
drop policy if exists "Authenticated can delete old-questions" on storage.objects;

create policy "Public can view old-questions" on storage.objects for select using (bucket_id = 'old-questions');
create policy "Authenticated can upload old-questions" on storage.objects for insert to authenticated with check (bucket_id = 'old-questions');
create policy "Authenticated can update old-questions" on storage.objects for update to authenticated using (bucket_id = 'old-questions');
create policy "Authenticated can delete old-questions" on storage.objects for delete to authenticated using (bucket_id = 'old-questions');

