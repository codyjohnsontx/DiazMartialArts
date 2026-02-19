# Diaz Martial Arts Website

Production-ready Next.js marketing site for a BJJ gym, deployable to Vercel.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- ESLint + Prettier
- SEO metadata, robots, sitemap

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy environment file and update values:

```bash
cp .env.example .env.local
```

3. Run dev server:

```bash
npm run dev
```

Site runs at `http://localhost:3000`.

## Editable Content Files

All primary content is in `/content`:

- `/Users/codypjohnson/Desktop/Coding/diazOnDemand/DiazMartialArts/content/site.ts`
- `/Users/codypjohnson/Desktop/Coding/diazOnDemand/DiazMartialArts/content/programs.ts`
- `/Users/codypjohnson/Desktop/Coding/diazOnDemand/DiazMartialArts/content/coaches.ts`
- `/Users/codypjohnson/Desktop/Coding/diazOnDemand/DiazMartialArts/content/faq.ts`
- `/Users/codypjohnson/Desktop/Coding/diazOnDemand/DiazMartialArts/content/schedule.ts`
- `/Users/codypjohnson/Desktop/Coding/diazOnDemand/DiazMartialArts/content/upcoming.ts` (fallback list)

## Schedule Setup

`/schedule` ships with three sections:

1. Weekly schedule table from `/content/schedule.ts`
2. Monthly Google Calendar embed
3. Upcoming events list limited to the next 60 days

Environment variables:

- `NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL`
  - Google Calendar embed URL for the monthly iframe section.
- `NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL` (optional)
  - Public ICS URL used to fetch upcoming events.
  - If missing or unavailable, the site falls back to `/content/upcoming.ts`.

## Contact Form (Formspree)

Set `NEXT_PUBLIC_FORMSPREE_ENDPOINT` in `.env.local`.

- If set: form submits directly to Formspree.
- If unset: form shows a clear setup message.

## Member Login + Account Hub (Clerk)

This site uses Clerk for member authentication and acts as the account home base for Diaz on Demand.

New routes:

- `/sign-in`
- `/sign-up`
- `/sign-out`
- `/account` (protected)
- `/ondemand` (canonical redirect into the Diaz on Demand app)

Required auth env vars:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Optional Diaz on Demand + entitlements env vars:

- `NEXT_PUBLIC_ONDEMAND_URL`
  - Base URL for the separate Diaz on Demand app (for example `https://ondemand.diazmartialarts.com`).
- `DIAZ_ENTITLEMENTS_API_URL` (server-side only, optional)
- `DIAZ_ENTITLEMENTS_API_KEY` (server-side only, optional)
- `DEV_FORCE_VOD_ENTITLEMENT` (`true`/`false`, dev fallback only)

Entitlement behavior:

- Server helper: `/Users/codypjohnson/Desktop/Coding/diazOnDemand/DiazMartialArts/lib/entitlements.ts`
- If `DIAZ_ENTITLEMENTS_API_URL` and `DIAZ_ENTITLEMENTS_API_KEY` are set, the server calls:
  - `GET {DIAZ_ENTITLEMENTS_API_URL}/me/entitlements`
  - Sends headers: `x-api-key` and `x-clerk-user-id`
- If API is not configured:
  - In development, `DEV_FORCE_VOD_ENTITLEMENT=true` enables VOD entitlement.
  - Otherwise VOD defaults to inactive.

## Diaz On Demand Entry Flow

Use `/ondemand` as the website entry point into the separate on-demand app:

- Signed out: redirects to `/sign-in?redirect_url=/account`
- Signed in with VOD entitlement: redirects to `{NEXT_PUBLIC_ONDEMAND_URL}/library`
- Signed in without VOD entitlement: redirects to `{NEXT_PUBLIC_ONDEMAND_URL}/subscribe`

## Clerk SSO Notes (Website + Subdomain App)

- Configure both domains in Clerk dashboard (main website domain and the `ondemand` subdomain).
- Use the same Clerk instance/keys in both projects.
- Set allowed redirect URLs for both apps in Clerk.
- This repo intentionally avoids custom cross-domain cookie logic; SSO behavior is controlled by Clerk configuration.

## Vercel Deploy

1. Push repo to GitHub.
2. Import project into Vercel.
3. Add environment variables from `.env.example` in Vercel project settings.
4. Deploy.

## Quality Scripts

```bash
npm run lint
npm run format:check
```
