## Purpose

This file is read automatically by **OpenAI Codex** and other agents (Cursor, Copilot, Aider). Rules here apply to all agent sessions in this repository.

For Claude Code: this repo also has a [`CLAUDE.md`](./CLAUDE.md) which Claude Code reads automatically and contains the same rules.

Agents must follow these instructions to produce safe, predictable, maintainable, minimal changes.

## Instruction Priority

1. Direct user instruction
2. This AGENTS.md
3. Existing repository patterns

## Engineering Standard

Agents must favor readability, correctness, low coupling, explicit boundaries, behavior-preserving refactors, safe data evolution, and minimal surface area over cleverness or speed of implementation.

## Operating Principles

Agents must behave like a careful engineer.

Always:

- read nearby code before editing
- understand the local pattern before changing it
- identify where similar functionality already exists
- make small focused changes
- prefer minimal diffs
- preserve behavior unless the user asked for behavior changes
- stop and report uncertainty, security risk, or missing context instead of guessing
- validate work with the appropriate commands before marking it complete

Never:

- refactor unrelated code
- introduce large rewrites without instruction
- change architecture without instruction
- create parallel implementations when an existing pattern already solves the problem
- optimize prematurely
- hide uncertainty behind confident-sounding code changes

## Diff Size Guardrail

Agents should keep changes small.

Preferred limits:

- fewer than 200 lines changed
- fewer than 5 files modified

If larger work is required:

- explain why
- define the scope
- propose the plan
- wait for approval

## Project Structure

This repository uses a Next.js App Router layout:

- `app/`
- `app/api/`
- `components/`
- `lib/`
- `tests/`
- `public/`
- `content/`

Guidelines:

- UI belongs in `components`
- business logic belongs in `lib`
- API handlers belong in `app/api`
- tests belong in `tests`
- static assets belong in `public`
- editable site content belongs in `content`

Do not create new top-level folders unless required.

## Commands

Use these commands to validate work:

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run test
npx tsc --noEmit
```

Prettier formatting is part of the quality gate, so run `npm run format` before
marking work complete or CI fails on unformatted files.

## Project Notes

- This site has no authentication. Member accounts live in the separate Diaz on
  Demand app; `NEXT_PUBLIC_ONDEMAND_URL` is the single source of that
  destination and nothing hardcodes it. See the "Member Login" section of
  `README.md`. Do not reintroduce an auth provider here without instruction.
- The root `app/loading.tsx` makes every page stream, so a `redirect()` inside a
  page component is downgraded to a client-side redirect (HTTP 200 plus a
  `NEXT_REDIRECT` marker) that crawlers and non-JS clients never follow. When a
  path needs a real HTTP redirect, declare it in `next.config.mjs` instead.
- A Tailwind utility whose value misses its theme scale generates no CSS rule
  and no build error, so the element silently keeps its old styling. A colour
  opacity modifier resolves against `theme.opacity`, whose scale is 0, 5, 10 ...
  100, so `text-white/72` is inert; `saturate-125` is inert the same way because
  the saturate scale is 0/50/100/150/200. Use a scale value or the arbitrary
  form (`text-white/[0.72]`, `saturate-[1.25]`), and confirm a new utility
  actually emits by grepping the generated CSS under `.next/static/css` (the
  filename is a content hash and changes every build) or the stylesheet URL the
  page loads. `tests/unit/tailwindOpacity.test.ts` fails on any off-scale
  opacity value. When the guard trips, fix the class, not the config: adding the
  off-scale value to `theme.opacity` in `tailwind.config.ts` legalises that one
  typo and leaves the next one silent.
- `site.url` (from `readSiteUrl` in `lib/env.ts`) never carries a trailing
  slash, so on a bare-origin base both `${site.url}/sitemap.xml` and
  `new URL(path, site.url)` are safe. The two idioms diverge once the base
  carries a path, because `new URL('/programs', base)` resolves against the
  origin and drops that path. Keep the normalisation in `readSiteUrl` rather
  than teaching each call site to cope: nothing fails the build when the base
  is wrong, so a bad value only surfaces as doubled slashes in the rendered
  sitemap and robots URLs. Only an operator-set NEXT_PUBLIC_SITE_URL is
  validated (http/https, no query or fragment); the derived bases are just
  slash-stripped, because `readSiteUrl` also runs in the client bundle through
  `components/ContactForm.tsx` and `components/OndemandWaitlistForm.tsx`, and
  must not throw on a base no visitor can correct.
  The `normaliseConfiguredSiteUrl` docblock in `lib/env.ts` holds the rationale
  and `tests/unit/siteUrl.test.ts` guards it.
- `next/image` optimises on request in `next dev` and `next start` alike -
  `next build` does not pre-generate those variants - and with the optional
  `sharp` package absent the optimiser falls back to a WebAssembly encoder whose
  worker pool is only `min(cpus - 1, 6)` wide, so a small CI runner encodes a
  page's variants roughly one at a time - tens of seconds cold for a feed of a
  dozen flyers. An end-to-end test that waits for an image to decode therefore
  asserts how busy the box is: deadlines of 5s, 20s and 90s each failed in CI,
  every time on all three attempts. Assert instead that the referenced file is
  served and is a readable image - the note in `tests/e2e/public-pages.spec.ts`
  owns the measurement and the reasoning, and the header reader is
  `tests/fixtures/imageSize.ts`. Note also that Playwright discards the
  webServer's output, so the dev server's own errors never reach the CI log.
- The `prefers-reduced-motion: reduce` block in `app/globals.css` does not stop
  a scroll-driven animation. It only neutralises `animation-duration`, and an
  `animation-timeline` animation takes its position from the scroller, so
  forcing the duration to 0.01ms merely compresses the whole motion into the
  start of the scroll range - more abrupt, not stiller. Every scroll-driven
  animation therefore needs its own `prefers-reduced-motion: no-preference`
  guard; the hero parallax in `app/globals.css` is the worked example.

- `npx tsc --noEmit` also checks `.next/types/**/*.ts` (see `tsconfig.json`),
  and that directory is only rewritten when `next build` or `next dev` starts.
  After deleting or renaming a route, `tsc` therefore fails on a
  `.next/types/app/...` file that "cannot find module" the removed page until
  the next `npm run build` or `npm run dev`. That is not a source error:
  rebuild, restart dev, or delete `.next/types` before treating it as one. CI
  never sees it because each run starts from a clean checkout.

- Text contrast on this site cannot be checked against a nominal background
  colour. `body` paints a gradient (`app/globals.css`), so no ancestor carries
  an opaque `backgroundColor`: walking up the tree for one finds nothing, and
  `sand` is near but not equal to what any given pixel actually is. Measure the
  rendered page instead - hide every glyph with
  `* { color: transparent !important }`, re-screenshot, and scan the whole box
  behind each run of text for the pixel that MINIMISES the ratio, which for
  dark type on this light page is the darkest one, not the lightest. The
  `Rank and certification` list on `/coaches` was sized that way; its tightest
  runs measure 5.52:1 (bronze rank line) and 5.98:1 (bronze group headings)
  against AA's 4.5:1.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
