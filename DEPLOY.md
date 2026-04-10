# Deploying Autodungeon to Vercel

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the **SQL Editor**, run the following to create the characters table:

```sql
create table characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users unique,
  data jsonb not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table characters enable row level security;

create policy "Users can read own character"
  on characters for select
  using (auth.uid() = user_id);

create policy "Users can upsert own character"
  on characters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own character"
  on characters for update
  using (auth.uid() = user_id);
```

3. From **Project Settings → API**, copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

## 2. Set environment variables in Vercel

In your Vercel project dashboard go to **Settings → Environment Variables** and add:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` |

Make sure both are enabled for **Production**, **Preview**, and **Development**.

## 3. Deploy

The project deploys automatically on every push to `main`.

To deploy manually:
```bash
npm run build   # confirm zero errors locally first
git push origin main
```

Vercel picks up `vercel.json` automatically — the SPA rewrite rule ensures
Vue Router hash-mode routes resolve correctly.

## Local development

```bash
cp .env.example .env
# fill in your Supabase credentials
npm install
npm run dev
```

The app runs fully without Supabase configured — guest mode uses `localStorage` only.
