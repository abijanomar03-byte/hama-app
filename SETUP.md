# Hama — real setup (not a demo anymore)

This is a working Next.js app with real auth, a real database, real photo
storage, and real server-side AI photo verification. Nothing here is fake
UI — every button on the post flow actually does what it says, provided
you complete the setup below.

## 1. Install dependencies

```bash
npm install
```

## 2. Create your Supabase project

1. Go to https://supabase.com → sign up (free tier is fine) → New Project.
2. Open the SQL Editor → New query → paste in the full contents of
   `supabase/schema.sql` → Run. This creates every table, all Row Level
   Security policies, and the `property-media` storage bucket used for
   room photos.
3. Go to Settings → API and copy your **Project URL** and **anon public**
   key.

## 3. Get an Anthropic API key (for real photo verification)

1. Go to https://console.anthropic.com → create a key.
2. This key must stay server-side only — it powers `app/api/verify-photo`,
   which is the fixed version of the AI house-photo check. (The earlier
   HTML prototype called Anthropic's API directly from the browser with no
   key, which only worked inside Claude.ai's own preview and silently
   approved every photo everywhere else — this route is the actual fix.)

## 4. Set your environment variables

Copy `.env.example` to `.env.local` and fill in all three values:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
```

## 5. Run it

```bash
npm run dev
```

Open http://localhost:3000.

## What's real right now

- **Auth**: real Supabase Auth sign-up/login, creates a `profiles` row.
- **Posting a house**: requires login, captures 4 room photos live (with a
  phone-camera-app fallback if the in-page camera has permission issues),
  runs each photo through a quality check + the real AI house-photo check,
  uploads accepted photos to Supabase Storage, and inserts a real row in
  the `properties` table. This is now a real, live listing.
- **Search/browse/listing pages**: query real listings from Supabase.
  Demo listings are shown too (clearly labeled "DEMO") to fill out the map
  while real inventory is small — they're never mixed in silently.
- **Contact**: real listings show the poster's real phone number with a
  tap-to-call link. Demo listings show no contact, since there's no one
  to reach.

## What's still not built

- No messaging system yet (the `messages` table exists in the schema, but
  no UI reads/writes it).
- No listing edit/delete flow, no favorites UI (tables exist, unused).
- No image resizing/compression before upload — large photos upload at
  full captured size.
- Camera testing: I validated every non-Supabase-dependent path myself
  (page loads, 404s, the verify-photo API's fallback behavior) by actually
  running the dev server. I could not test the live camera, Supabase
  writes, or Storage uploads myself — those need a real browser with
  camera access and a real Supabase project, which I don't have. Please
  test the actual posting flow yourself once your keys are in place and
  tell me what happens.

## Deploying

Any Next.js host works (Vercel is the simplest — connect the repo, add
the same three environment variables in its dashboard, deploy). Static
hosts like plain Netlify Drop do **not** work for this project, since it
needs a real server to run the `/api/verify-photo` route and keep the
Anthropic key secret — that's different from the old single-file HTML
prototype.
