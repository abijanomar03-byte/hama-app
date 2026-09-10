# Hama — real web app

A Next.js app for tenant-posted house listings: hood → area → house →
room-by-room live photo capture → published listing. Every photo is
checked server-side to confirm it actually shows a room, before it's
accepted.

See **SETUP.md** for the full setup (Supabase project, Anthropic key,
environment variables) — nothing works until those are configured, same
as any real app that needs a database.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Supabase (Postgres + Auth + Storage)
- Server-side Anthropic API call for photo verification (key never
  reaches the browser)

## Structure

- `app/` — pages (home, search, listing detail, post, auth) and the
  `api/verify-photo` server route
- `components/` — `LiveCamera` (capture UI), `ListingCard`, `SearchBar`
- `lib/data.ts` — the data layer: fetches real Supabase listings, falls
  back to demo listings (clearly flagged) when the real inventory is thin
- `lib/demo.ts` — generated demo/seed listings, used only as a labeled
  fallback, never mixed in silently
- `supabase/schema.sql` — full database schema, RLS policies, and the
  storage bucket setup — run this once in your Supabase project
