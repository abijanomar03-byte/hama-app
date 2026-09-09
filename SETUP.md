# Hama — production MVP setup

## 1. Supabase
Create a Supabase project, open SQL Editor, and run `supabase/schema.sql`.
Then copy the Project URL and anon public key from Project Settings → API.

## 2. Local environment
Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SHOW_DEMO=true
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 4. Vercel
Import the GitHub repository into Vercel. Add the same two Supabase variables under Settings → Environment Variables for Production and Preview, then redeploy.

## 5. Make listings public
New houses are created with status `pending`. Review the listing in Supabase, then change `properties.status` from `pending` to `active`. Only active listings are public.

## 6. Demo data
Set `NEXT_PUBLIC_SHOW_DEMO=false` when you are ready to run a real-inventory-only marketing site.
