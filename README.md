# Hama — tenant-powered house hunting

Real Next.js MVP for Hama. Tenants who are moving out can post a current home with rent, location, living details, vacancy timing and either room photos or one walkthrough video. New listings are saved as `pending` for manual review before publication.

## Stack
- Next.js 15 / React 19 / TypeScript
- Supabase Auth + PostgreSQL + Storage
- Vercel deployment

## Important
This version intentionally does **not** use paid AI verification. Captured media is accepted immediately and manually reviewed before publication.

See `SETUP.md` for deployment.


## Launch checklist
1. Run `supabase/schema.sql` in your Supabase SQL Editor.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
3. Redeploy.
4. Keep `NEXT_PUBLIC_SHOW_DEMO=false` for a real-inventory-only launch.
5. Test sign-up, posting, photo/video capture, and a pending listing.
6. Approve a test listing from Supabase by changing its `status` to `active`.
7. Test the public search page and listing page.
