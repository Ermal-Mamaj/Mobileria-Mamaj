# Deploying to Vercel

This document covers what changed to make the app deployable on Vercel, and
the exact steps to set it up. It assumes you're starting from a fresh Vercel
account with nothing configured yet.

## What changed, and why

The app was originally built for a traditional always-on server: SQLite on
local disk, uploaded images written to a local folder. Neither of those
survives on Vercel — serverless functions spin up fresh (sometimes on a
different machine) for each request, and the filesystem they get is
temporary. Three things moved as a result:

| Piece | Before | Now | Why |
|---|---|---|---|
| Database | SQLite file (`better-sqlite3`) | **Neon Postgres** (`@neondatabase/serverless`) | Neon's driver talks to the DB over plain HTTPS — no persistent connection to keep alive between serverless invocations, which is what makes it work here. |
| Images | Local disk (`server/uploads/`) | **Vercel Blob** | Local disk isn't persisted between requests on Vercel. Blob is Vercel's own object storage, and its free tier just pauses uploads when you hit the limit rather than charging you. |
| Server entry | `app.listen(PORT)` only | Same, plus `api/index.js` wrapping the Express app for Vercel's Node runtime | Vercel needs a `(req, res)` handler in `/api`; local dev still runs the app the normal way. |

Two more things were added along the way, unrelated to Vercel specifically
but worth knowing about:

- **Contact form emails** now send via **Resend** instead of doing nothing.
- **Image uploads are compressed** before they're stored: resized to a
  2000px cap and converted to WebP (quality 88 — visually lossless, 70-90%
  smaller than a typical phone photo). This matters more on Vercel than it
  would elsewhere, since it directly controls how fast you'd hit Blob's free
  storage/transfer limits.

Also hardened while we were in here: rate limiting on admin login, CSRF
protection on admin actions, security headers (`helmet`), and the old
`project/` folder (leftover from a previous implementation) was deleted.

## Prerequisites

- A [Vercel](https://vercel.com) account (free Hobby tier is fine to start —
  no credit card required to sign up).
- A [Neon](https://neon.tech) account (free tier, no credit card required).
- A [Resend](https://resend.com) account, once you have the client's real
  sending domain/inbox (a placeholder works fine until then — the contact
  form will just return a "not configured yet" error until it's set).

## 1. Set up Neon

1. Create a Neon project. Copy the connection string from the dashboard —
   use the pooled connection string (it works fine with the HTTP driver).
2. Set it locally first to run the migration:
   ```bash
   cp server/.env.example server/.env
   # edit server/.env and paste your real DATABASE_URL
   npm run migrate -w server   # creates all tables
   npm run seed -w server      # populates starter content + admin user
   ```
3. You now have a working Postgres database with the site's schema and
   starter content in it.

## 2. Set up Vercel Blob

1. In the Vercel dashboard: **Storage → Create → Blob**. Name it anything.
2. Once created, open its **`.env.local`** tab and copy the
   `BLOB_READ_WRITE_TOKEN` value into `server/.env` for local dev.
3. When you connect this Blob store to your Vercel *project* (next section),
   Vercel injects this token into your deployed functions automatically —
   you won't need to set it again there.

## 3. Set up Resend (can be done later)

1. Create a Resend account and verify a sending domain (or use their test
   domain to start).
2. Grab an API key from the dashboard.
3. Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (where inquiries should land),
   and `CONTACT_FROM_EMAIL` (must be on a domain you've verified with Resend).
4. Until this is configured, the contact form fails gracefully with a
   "Contact form is not configured yet" message instead of crashing.

## 4. Deploy to Vercel

1. Import the GitHub repo into Vercel (**Add New → Project**, pick this
   repo). Vercel will detect `vercel.json` and use its settings automatically
   — you shouldn't need to override the build command or output directory.
2. Under **Settings → Environment Variables**, add all of these (values from
   the steps above):
   - `DATABASE_URL`
   - `JWT_SECRET` — generate a real random string, don't reuse the example
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` — only needed if you re-run the seed
     script against production; not read at runtime otherwise
   - `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`
   - `CLIENT_ORIGIN` — set this to your real production URL (e.g.
     `https://mamaj-showroom.vercel.app` or your custom domain) once you know
     it, otherwise the API's CORS check will reject the frontend's requests
   - `NODE_ENV` — set to `production`
3. Connect the Blob store you created in step 2 to this project: **Storage →
   your Blob store → Connect Project**. This is what injects
   `BLOB_READ_WRITE_TOKEN` automatically — you don't need to add it by hand.
4. Deploy. Vercel builds the client (`npm run build -w client`) and deploys
   `api/index.js` as a serverless function per `vercel.json`'s rewrites,
   which route `/api/*` and `/uploads/*` to it.
5. Visit `https://<your-project>.vercel.app/mamaj-cms/login` and log in with
   the admin credentials from the seed step to confirm everything's wired up.

## A few things worth knowing after deploying

- **Vercel's Hobby plan is technically for non-commercial use only.** This
  is a client's business site, so Vercel's terms lean toward the paid Pro
  plan ($20/month, requires a card). Hobby will likely work fine at this
  site's scale in practice, but it's worth knowing the terms exist if it
  ever comes up.
- **Free tier ceilings to keep an eye on:** Neon (0.5GB DB storage, 100
  compute-hours/month), Vercel Blob (1GB storage, 10GB transfer/month, no
  charge — uploads just stop working until the next cycle if you hit it).
  With image compression in place this should hold a few hundred product
  photos comfortably before it's a concern.
- **Re-running `npm run migrate`** is safe any time — every statement uses
  `CREATE TABLE IF NOT EXISTS`, so it won't touch existing data.
