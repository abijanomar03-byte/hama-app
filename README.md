# Hama — real web app

A Next.js app for tenant-posted house listings: hood → area → house →
room-by-room live photo capture → published listing. Every photo is
checked server-side to confirm it actually shows a room, before it's
accepted.

See **SETUP.md** for the full setup (Supabase project, Cloudflare Workers AI credentials,
environment variables) — nothing works until those are configured, same
as any real app that needs a database.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Supabase (Postgres + Auth + Storage)
- Server-side Cloudflare Workers AI call for room-photo verification (credentials never
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

## Media capture modes
Hama posting now offers two mutually exclusive options:
- **Room photos:** the phone camera is opened for each required room, and a successful capture advances to the next room. Bedsitters require Sitting Room, Kitchen and Washroom.
- **One walkthrough video:** the phone camera is used to record one short walkthrough; room photos are not required.
The two modes cannot be mixed in a listing.

## Current verification stack

Hama verifies room photos with Cloudflare Workers AI using `@cf/meta/llama-3.2-11b-vision-instruct` on the server. Cloudflare documents this model as a vision model for image recognition/reasoning and requires accepting the Meta License and Acceptable Use Policy once by sending `{"prompt":"agree"}`. The current Workers AI free allocation is 10,000 Neurons/day; usage above that requires Workers Paid. Cloudflare's pricing and model documentation should be rechecked at deployment time.
