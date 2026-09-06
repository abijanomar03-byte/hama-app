# Hama setup

## 1. Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 2. Supabase

Create a Supabase project and run `supabase/schema.sql`, then `supabase/seed_locations.sql` in the SQL editor.

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The schema includes users/profiles, locations, properties, property media, hunting access, favorites, conversations, messages, notifications, reports, audit logs, RLS policies, and the private `property-media` bucket.

## 3. Cloudflare Workers AI

Add server-side variables in Vercel (Production and Preview as needed):

```env
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

Hama uses `@cf/meta/llama-3.2-11b-vision-instruct` to verify the exact room requested. Cloudflare currently provides a 10,000 Neurons/day free allocation across Workers AI; usage above that requires Workers Paid. See the current Cloudflare pricing documentation before launch.

The first request to this Meta model requires agreeing to Meta's License and Acceptable Use Policy. In Cloudflare's documented flow, send one request to the model with:

```json
{"prompt":"agree"}
```

After that, normal image requests can be used.

Keep `CLOUDFLARE_API_TOKEN` server-side. Never prefix it with `NEXT_PUBLIC_`.

## 4. Hama media rules

A listing chooses exactly one media mode:

- **Room photos:** phone camera capture for each required room. 1/2/3-bedroom homes require Sitting Room, Bedroom, Kitchen and Washroom. Bedsitters require Sitting Room, Kitchen and Washroom only. After an accepted room, the UI advances automatically to the next required room.
- **One walkthrough video:** one short phone-camera walkthrough replaces all room photos.

No normal gallery picker is exposed in the Hama UI.

## 5. Room verification

Photos are uploaded/captured on the client, then sent to `/api/verify-photo` for room-specific verification. The verifier is explicitly told which room Hama is requesting and returns an `is_house` decision plus a brief human-style reason. A verification failure should trigger a retake, not silently mark a wrong room as verified.

## 6. Production

Deploy the Next.js app on Vercel. For phone camera capture, use the HTTPS Vercel URL (or localhost during development). Browsers require a secure context for direct camera APIs; the current Hama capture control requests the phone camera through the browser's device-capture flow.
