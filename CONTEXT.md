# Letterbox — Project Context

## What is Letterbox?

A universal letter & time capsule platform. Started as a private couples app idea, evolved into a broader product where anyone can write letters — to themselves, to specific users, anonymously, or with a sealed unlock date in the future.

The soul of the product: **intentionality over convenience.** Writing a letter here means something. It is not texting.

---

## Core concept

- Users sign in with **Google OAuth (Gmail)**
- They can write letters to:
  - **Their future self** — sealed until a chosen unlock date
  - **Another user by username** — delivered immediately or on a date
  - **Anonymously** — recipient sees the letter, not the sender
- A **Couples Space** is a special tier: exactly 2 Gmail accounts paired via a secret code, with a private shared space (letters, memories, bouquet maker). **Mutual-consent deletion required** — both must confirm to delete. Space cannot be reused for a new partner.
- On the unlock date, a **push notification** fires: *"A letter from [name] is ready for you."* — not generic app copy, a real felt moment.

---

## Stack

- **Frontend:** Next.js (App Router)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Edge Functions + pg_cron)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (free tier)
- **Auth:** Google OAuth via Supabase (Gmail as identity)
- **Push notifications:** Web Push API (PWA)
- **Open source:** Yes — public GitHub repo

**Cost to run:** $0 (all free tiers)

---

## Security requirements (non-negotiable)

- Row-level security (RLS) on every Supabase table — one user should never be able to query another's letters through any API call
- Service role key NEVER in frontend code or GitHub repo — environment variables only
- Anonymous letters: sender identity stored server-side only, completely stripped from what recipient can query
- HTTPS enforced (Vercel handles this automatically)
- Mutual-consent delete: both accounts must confirm before any data is wiped. Hard delete — no soft delete, no accessible backups
- Test RLS aggressively with two separate test accounts before any public launch

---

## Database structure (3 core tables)

### `users`
- `id` (uuid, PK)
- `email` (text, unique — Gmail)
- `username` (text, unique)
- `push_token` (text, nullable)
- `created_at` (timestamp)

### `spaces` (for Couples Space)
- `id` (uuid, PK)
- `code` (text, unique — pairing code, single-use)
- `user_a_id` (uuid, FK → users)
- `user_b_id` (uuid, FK → users, nullable until paired)
- `status` (enum: active / deletion_pending / deleted)
- `deletion_requested_by` (uuid, nullable)
- `deletion_requested_at` (timestamp, nullable)
- `created_at` (timestamp)

### `letters`
- `id` (uuid, PK)
- `sender_id` (uuid, FK → users — always stored, never exposed to recipient if anonymous)
- `recipient_id` (uuid, FK → users, nullable for self-letters)
- `space_id` (uuid, FK → spaces, nullable — only for couples space letters)
- `content` (text)
- `unlock_date` (date)
- `status` (enum: sealed / unlocked / opened)
- `is_anonymous` (boolean)
- `opened_at` (timestamp, nullable)
- `created_at` (timestamp)

---

## MVP feature set (build these first, nothing else)

1. **Google OAuth sign in** — Gmail as identity
2. **Username setup** — chosen on first login
3. **Write a letter** — to self, to username, or anonymous. Set unlock date.
4. **Sealed letter inbox** — recipient sees a letter exists and when it unlocks. Cannot read early.
5. **Unlock mechanic** — Supabase Edge Function + pg_cron job runs daily, flips status to 'unlocked', fires push notification
6. **Push notification** — PWA Web Push API. Copy: *"A letter from [name] is ready for you."* Fallback: in-app inbox on next login
7. **Couples Space pairing** — Gmail + secret code links two accounts to one private space. Code is single-use, locks to those two emails permanently.
8. **Mutual-consent delete** — deletion_request state, 48hr expiry, both must confirm

**Defer to later:** bouquet maker, memory feed, themes, AI features, native apps, monetisation

---

## Design philosophy

- **Minimalist** — no clutter, no social feed noise, no likes or metrics
- **Ritual** — the act of writing, sealing, and waiting should feel intentional and meaningful
- **Beautiful but not forced** — warm, calm, typographic. Think: a real letter arrived in the mail
- Every micro-interaction matters: loading states, the sealed letter visual, the moment it opens, the notification copy

---

## What this is NOT

- Not a texting app
- Not a social media platform
- Not a dating app
- Not a journaling app

---

## Competitive context

- **FutureMe** (futureme.org) — closest competitor, email-based since 2002. No app, no social layer, no username system, no anonymous-to-specific-user mechanic. Delivers via email which "ruins the surprise."
- **Between / Paired / LoveByte** — couples apps, none have mutual-consent deletion or non-reusable spaces
- **PostSecret** — anonymous sharing but no direct delivery to users
- **OpenWhen** — new (2026), beautiful aesthetic, no account system, no social layer

**White space:** No platform combines (a) username-based anonymous letter delivery, (b) date-unlocked time capsules, and (c) a private mutual-consent couples space within one product.

---

## Who is building this

18-year-old solo developer, UAE (Dubai). CBSE Grade 11. Running multiple ventures alongside studies (Estoro — gym equipment reselling; wellbeing app). Limited build time — evenings and weekends only. Letterbox is a passion project and portfolio piece targeting NYU Abu Dhabi full-ride application.

**Priority order:** SAT prep (target June 2027) > Grade 11/12 boards > Letterbox. Never let this eat study time.

---

## Current status

Idea and architecture stage. No code written yet. Starting from Next.js + Supabase starter template.

## First session goal

Get Google OAuth working with Supabase, build the username setup flow on first login, and build the letter-writing page with a date picker. That's it. No other features yet.
