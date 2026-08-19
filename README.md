# Diaz Martial Arts Website

Standalone Next.js marketing and member-entry website for Diaz Martial Arts.

This repository is separate from the Diaz on Demand VOD product. The website links into the VOD app by URL; it does not share workspace code, packages, or repo tooling with the VOD system.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
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

- `NEXT_PUBLIC_SITE_URL` must be a full absolute URL in Preview/Production, using
  `http:` or `https:` and carrying no query string or fragment. Trailing slashes
  are stripped, so the URLs the site builds never double up.
- `NEXT_PUBLIC_ONDEMAND_URL`, if set, must also be a full absolute URL.
- Invalid site/on-demand URL env vars fail early with explicit messages.
- No environment variable is required to boot the public site locally.

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
2. Printable class schedule flyers - images and PDFs in `public/schedules/`,
   listed by `printableSchedules` in `content/schedule.ts`
3. Upcoming events list, limited to the forward window defined by
   `UPCOMING_WINDOW_DAYS` in `lib/upcoming.ts`

The table and the flyers state the same class times on the same page, so a
revised flyer means updating both. `printableSchedules` points at the PDFs by
their exact URL-encoded filenames, so replace those files in place rather than
renaming them.

Upcoming events come from `NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL` when it is set,
and from the hand-maintained list in `content/upcoming.ts` otherwise. The comment
at the top of that file is the authoritative guide to keeping the list current -
read it before editing the list.

Environment variables:

- `NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL`
  - Optional. Validated in `lib/env.ts`, but no page renders an embedded
    calendar today; `/schedule` links out to `/announcements` instead.
- `NEXT_PUBLIC_GOOGLE_CALENDAR_ICS_URL` (optional)
  - Public ICS URL used to fetch upcoming events.
  - If missing or unavailable, the site falls back to `content/upcoming.ts`.

## Contact Form (Formspree)

Set `NEXT_PUBLIC_FORMSPREE_ENDPOINT` in `.env.local`.

- If set: form submits directly to Formspree.
- If unset: form shows a clear setup message.

## Member Login

Member accounts live in the separate Diaz on Demand app, not in this repository.
This site is the marketing funnel; it holds no sessions and has no auth
dependency. The two run on different domains, so a session here would not carry
over to the member app anyway.

`NEXT_PUBLIC_ONDEMAND_URL` is the single source of that destination; nothing
hardcodes it. The header "Member Login" control is a plain outbound link to it.

That app is not deployed yet, so `.env.example` ships a placeholder on the
reserved `.invalid` TLD. While the variable is unset or still the placeholder the
site hides its member entry points rather than linking somewhere dead:

- the header and contact page drop the "Member Login" control
- `/ondemand` shows the coming soon page instead of forwarding

Replace the placeholder with the real URL once the app is deployed.

Routes:

- `/ondemand` forwards every visitor to the Diaz on Demand app, or renders the
  coming-soon page when `ONDEMAND_COMING_SOON=true`. The forward is a real HTTP
  redirect declared in `next.config.mjs`, not a page-level `redirect()` — see the
  streaming caveat in `CLAUDE.md`.
- `/sign-in` and `/sign-up` are redirects to `/ondemand`, kept only so older
  links and bookmarks do not 404.

On Demand env vars:

- `NEXT_PUBLIC_ONDEMAND_URL`
  - Base URL of the deployed Diaz on Demand app. A malformed value fails the
    build loudly; an unset value or the `.invalid` placeholder is treated as
    "not deployed yet".
- `ONDEMAND_COMING_SOON`
  - Set `true` to show the Diaz on Demand coming-soon page with a waitlist form
    even once `NEXT_PUBLIC_ONDEMAND_URL` is set.
  - Leave unset or `false` to forward visitors to the member app.
  - Both variables are read in `next.config.mjs` to decide whether the
    `/ondemand` redirect exists, so changing either needs a rebuild to take
    effect there. Vercel redeploys on an env change, so this is automatic.

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
3. Confirm no regressions in spacing, hierarchy, contrast, and nav entry points.

## Vercel Deploy

1. Push this repo to GitHub.
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
   - `/sign-in` redirects to the member app
   - `/ondemand`
7. Promote only after preview validation passes.

## Quality Scripts

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:coverage
npm run test:e2e
npm run build
npm run test
npm run test:smoke
npm run quality
npm run format:check
npm run format
```

Vitest covers unit and component tests under `tests/unit` and `tests/components`.
Coverage is intentionally scoped to shared `lib` modules and selected behavior-heavy
components so the first gate stays useful while coverage grows. GitHub Actions runs
`npm run quality` on pushes to `main` and pull requests.
`npm run quality` starts with `npm run format:check`, so unformatted files fail the
gate; run `npm run format` to fix them. Prettier settings live in `.prettierrc` and
the excluded paths in `.prettierignore`.
`npm run quality` omits typecheck and build; `npm run quality:strict` adds both and
runs the end-to-end tests against a production build.

CodeRabbit reviews each pull request once, on the code as it stands when the pull
request is published, and does not re-review the commits pushed after that. Ask
for a fresh pass by commenting `@coderabbitai review` on the pull request. See
`.coderabbit.yaml` for the rest of the review settings.

## Repo Boundary

- Website repo: `git@github.com:codyjohnsontx/DiazMartialArts.git`
- VOD repo: `git@github.com:codyjohnsontx/DiazOnDemand.git`
- Integration between the two is URL-based only
