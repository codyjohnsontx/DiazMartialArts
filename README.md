# Diaz Martial Arts Website

Production-ready Next.js marketing and member-entry website for Diaz Martial Arts, deployable to Vercel.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Clerk auth for member login/account
- ESLint + Prettier + Playwright
- SEO metadata, structured data, robots, sitemap

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

Environment validation notes:

- `NEXT_PUBLIC_SITE_URL` must be a full absolute URL in Preview/Production.
- `NEXT_PUBLIC_ONDEMAND_URL`, if set, must also be a full absolute URL.
- Missing or invalid Clerk/site URL env vars fail early with explicit messages.

## Editable Content Files

All primary content is in `content/`:

- `content/site.ts`
- `content/programs.ts`
- `content/coaches.ts`
- `content/faq.ts`
- `content/schedule.ts`
- `content/upcoming.ts` (fallback list)

## Schedule Setup

`/schedule` ships with three sections:

1. Weekly schedule table from `content/schedule.ts`
2. Monthly Google Calendar embed
3. Upcoming events list limited to the next 60 days

Environment variables:

- `NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL`
  - Google Calendar embed URL for the monthly iframe section.
- `NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL` (optional)
  - Public ICS URL used to fetch upcoming events.
  - If missing or unavailable, the site falls back to `content/upcoming.ts`.

## Contact Form (Formspree)

Set `NEXT_PUBLIC_FORMSPREE_ENDPOINT` in `.env.local`.

- If set: form submits directly to Formspree.
- If unset: form shows a clear setup message.

## Member Login + Account Hub (Clerk)

This site uses Clerk for member authentication and acts as the account home base for Diaz on Demand.

Routes:

- `/sign-in`
- `/sign-up`
- `/sign-out`
- `/account` (protected)
- `/ondemand` (canonical redirect into the Diaz on Demand app)

Required auth env vars:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Vercel environment examples:

- `NEXT_PUBLIC_SITE_URL=https://diazmartialarts.vercel.app`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...`
- `CLERK_SECRET_KEY=sk_live_...`

Optional Diaz on Demand + entitlements env vars:

- `NEXT_PUBLIC_ONDEMAND_URL`
  - Base URL for the separate Diaz on Demand app (for example `https://ondemand.diazmartialarts.com`).
- `DIAZ_ENTITLEMENTS_API_URL` (server-side only, optional)
- `DIAZ_ENTITLEMENTS_API_KEY` (server-side only, optional)
- `DEV_FORCE_VOD_ENTITLEMENT` (`true`/`false`, dev fallback only)

Entitlement behavior:

- Server helper: `lib/entitlements.ts`
- If `DIAZ_ENTITLEMENTS_API_URL` and `DIAZ_ENTITLEMENTS_API_KEY` are set, the server calls:
  - `GET {DIAZ_ENTITLEMENTS_API_URL}/me/entitlements`
  - Sends headers: `x-api-key` and `x-clerk-user-id`
- If API is not configured:
  - In development, `DEV_FORCE_VOD_ENTITLEMENT=true` enables VOD entitlement.
  - Otherwise VOD defaults to inactive.

## SEO and Structured Data

- Shared metadata helper: `lib/seo.ts`
- JSON-LD components:
  - LocalBusiness (`components/LocalBusinessSchema.tsx`) on Home/Contact
  - WebSite (`components/WebSiteSchema.tsx`) in root layout
  - FAQPage (`components/FaqSchema.tsx`) on FAQ page
- Dynamic routes:
  - `app/robots.ts`
  - `app/sitemap.ts`

## Accessibility Notes

- Skip-to-content link in root layout
- Keyboard-accessible mobile navigation and schedule disclosures
- Contact form has field-level validation messages and ARIA associations
- Focus-visible styles and reduced-motion support via global CSS

## Visual Review Workflow

Use two review passes for design updates:

1. Run app locally and review desktop + mobile for core pages:
   - `/`, `/programs`, `/schedule`, `/coaches`, `/pricing`, `/contact`, `/faq`
2. Capture screenshots and compare before/after each pass.
3. Confirm no regressions in spacing, hierarchy, contrast, and nav/account entry points.

## Vercel Deploy

1. Push repo to GitHub.
2. Import project into Vercel.
3. Add environment variables from `.env.example` in Vercel project settings.
4. Deploy.

## Preview-to-Production Release Checklist

1. `npm install`
2. `npm run lint`
3. `npm run build`
4. `npm run test:smoke`
5. Push branch and confirm Vercel preview is green.
6. Manually verify:
   - `/`
   - `/pricing`
   - `/schedule`
   - `/contact`
   - `/sign-in`
   - `/account` while signed out
   - `/ondemand` while signed out
7. Promote only after preview validation passes.

## Quality Scripts

```bash
npm run lint
npm run build
npm run test
npm run test:smoke
npm run format:check
```
