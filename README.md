# Letterbox

A universal letter & time-capsule platform. See `CONTEXT.md` (project root's parent, or wherever you keep it) for the full product spec.

## Stack

Next.js (App Router) + Supabase (Postgres, Auth, Realtime, Edge Functions, pg_cron) + Tailwind CSS. Auth is Google OAuth via Supabase.

## First-time setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a free project, and grab these from **Project Settings → API**:

- Project URL
- `anon` public key
- `service_role` key (keep this one secret — never in frontend code)

Copy `.env.local.example` to `.env.local` and fill them in.

```bash
cp .env.local.example .env.local
```

### 2. Enable Google OAuth

In the Supabase dashboard: **Authentication → Providers → Google**.

You'll need a Google OAuth Client ID/Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

- Create an OAuth consent screen (External, testing mode is fine to start)
- Create an OAuth Client ID (type: Web application)
- Add this as an **Authorized redirect URI**: the callback URL Supabase shows you on the Google provider settings page (looks like `https://<project-ref>.supabase.co/auth/v1/callback`)
- Paste the resulting Client ID/Secret into Supabase's Google provider settings and enable it

### 3. Run the database migration

The schema (users/spaces/letters tables + RLS policies) lives in `supabase/migrations/0001_init.sql`. Run it via the Supabase SQL Editor (paste the file contents and run), or with the Supabase CLI if you have it linked:

```bash
supabase db push
```

### 4. Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/login`, then Google OAuth → `/username` (first login only) → `/write`.

## What's built so far

- Google OAuth sign-in (`/login`, `/auth/callback`)
- Username setup on first login (`/username`)
- Letter-writing page with recipient (self / username), anonymous toggle, and unlock-date picker (`/write`)
- Full schema + RLS for `users`, `spaces`, `letters`, including an anonymous-safe inbox read path (`get_inbox()`) that strips sender identity server-side

## Not built yet

Sealed inbox UI, the pg_cron/Edge Function unlock job, push notifications, Couples Space pairing + mutual-consent deletion, and everything under "defer to later" in the spec (bouquet maker, memory feed, themes, AI features, native apps, monetization).
