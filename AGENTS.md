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
  slash, so both `${site.url}/sitemap.xml` and `new URL(path, site.url)` are
  safe. Keep it that way: `new URL(value).toString()` appends a slash to a bare
  origin, and when that reached the concatenating call sites it silently
  produced `https://host//programs` in every non-root sitemap entry and in
  robots.txt. Nothing failed the build - the bug only appeared once
  `NEXT_PUBLIC_SITE_URL` was set, because the `https://${VERCEL_URL}` fallback
  happens to carry no slash. `tests/unit/siteUrl.test.ts` guards the invariant
  and the rendered sitemap/robots output.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
