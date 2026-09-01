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
  An arbitrary value fails the same silent way when Tailwind cannot tell which
  property it belongs to. `font-` is both `font-family` and `font-weight`, so
  `font-[var(--font-body)]` compiles to `font-weight: var(--font-body)` - a
  rule that emits, applies, and does nothing - and the page keeps rendering in
  whatever the browser picks for `ui-sans-serif`. The body in `app/layout.tsx`
  carried exactly that from the first commit, so every page on the site
  rendered in the browser's fallback face and no test noticed. Give an
  ambiguous arbitrary value its data-type hint
  (`font-[family-name:var(--font-body)]`), and read the compiled declaration,
  not just the presence of the class. Reading the class list, the source, or a
  React render proves nothing here; `tests/e2e/body-font.spec.ts` reads the
  computed `font-family` off `body` in a real browser, which is the only place
  the mistake shows.
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
- The public pages are prerendered at build time (`○` in the `next build`
  route table), so a client component that reads the clock while rendering
  (`new Date()` in a `useState` initialiser or the render body) ships the
  build's clock in the HTML and hydrates against the visitor's. React then
  reports error 425 and, as the root `app/loading.tsx` Suspense boundary gives
  up, 422, and the whole page re-renders on the client. Read the clock only
  after mount and render the same time-free markup on both sides;
  `components/HomeUpcomingClasses.tsx` is the worked example. Testing Library's
  `render()` never sees a mismatch: prove it the way
  `tests/components/home-upcoming-classes.test.tsx` does, server-rendering at
  one time with `react-dom/server` and calling `hydrateRoot` at another with
  `onRecoverableError` spied. `next dev` renders per request on the dev
  server's clock, which agrees with the browser's at the moment of the visit,
  so in the e2e suite the mismatch only appears with the browser clock moved,
  which `tests/e2e/home.spec.ts` does through `page.clock`. Note also
  that `next dev` and `next build`/`next start` share `.next`: starting the dev
  server beside a production server makes every chunk 500 and React never
  runs, so reproduce production-only hydration issues with dev stopped.

- Gate a wide layout on the width the layout measurably needs, not on the
  nearest standard breakpoint above it. The header's desktop navigation is
  gated at `min-[1035px]`, and 1035 is a measurement: it was read off a
  rendered browser with the wide layout forced visible, rather than guessed at
  the next Tailwind size up. `md` and `lg` were each wrong here for the same
  underlying reason - flex children shrink, so the row stops overflowing long
  before it fits, and "Book Free Trial" was crushed into a three-line pill at
  892px and onto two lines across 1024-1034 with no overflow to show for it.
  So `documentElement.scrollWidth === clientWidth` is a floor, not proof the
  layout is right; check what the text does, not just the box.
  `tests/e2e/header-widths.spec.ts` pins both boundaries and owns the rest of
  that reasoning, including why it carries no assertion on text width at all:
  a wrap boundary is a text measurement, Chromium shapes text through the
  platform's own stack, and the same page is single-line on macOS but came
  back wrapped at 1035 on the Linux CI runner.
  An assertion widened until it passes everywhere is one that can no longer
  fail, so no guard is the honest answer here. When a width or text assertion
  fails on another platform, remove or report that assertion rather than
  moving the breakpoint or restyling the header to make the measurement pass:
  changing the product to satisfy a machine-local number is how 1035 became
  1152 and had to be put back.
  One residual is live, accepted and unfixed at roughly 1035-1049 on
  classic-scrollbar platforms: a CSS `@media (min-width: ...)` is evaluated
  against `window.innerWidth`, which counts a classic scrollbar, while the row
  lays out in `documentElement.clientWidth`, which does not, so the row is
  handed about 15px less than the query promised and the call to action can
  wrap. Every width here was measured under overlay scrollbars, which is what
  headless Chromium and macOS give you, which is exactly why that went
  unnoticed. Sizing this header from its own content instead of from a number
  somebody measured is filed as dma-header-size-from-content, which owns both
  that residual and the machine-local pixel.
  Read those widths knowing they predate the body font working at all. Until
  `font-[family-name:var(--font-body)]` landed, the header laid out in
  `ui-sans-serif`, which is by definition a different typeface on every
  platform - San Francisco on macOS, whatever fontconfig hands Chromium on the
  Linux runner - so the disagreement the note above records was measured
  between two different fonts, not two rendering stacks. Manrope is a
  self-hosted file that is byte-identical everywhere, which should narrow that
  gap considerably. Measured with the query forced on, the row's own content
  now fits at 985px against 1003px in the fallback face, so 1035 keeps the
  desktop header and gains headroom; the numbers to re-take when picking that
  work up are these, not the pre-fix ones. Both figures are the narrowest
  viewport at which the desktop row keeps "Book Free Trial" on a single line
  and leaves neither the row nor the document overflowing, so the call to
  action's wrap was measured there, not just the box.

- The home page's coming-up card is the narrowest layout on the site. It is
  `w-[min(92vw,390px)]`, so at a 320px viewport its "Later" rows have very
  little width to split between a class name and a time, and a `truncate` (or
  any `nowrap`) child does not quietly clip there. A grid track sized `auto` and
  an `li` with the default `min-width: auto` may not shrink below their
  min-content, so the nowrap text becomes a floor that pushes
  `document.scrollWidth` past the viewport and scrolls the whole page sideways -
  350 against 320, before the fix. Clipping is not the answer either: an earlier
  attempt clipped this and cut times to `Tuesday 7:0`, AM/PM gone with no way to
  reveal it, which is worse than a scrollbar. Make the row fit instead - wrap
  the name, shorten the visible day label to three letters while an `sr-only`
  span keeps the full day for screen readers, and add `min-w-0` to release the
  content-based minimums so the next long class name wraps rather than widening
  the page. Check 320px explicitly: the `Mobile` Playwright project is 390px
  wide and sees none of this. `components/HomeUpcomingClasses.tsx` and the
  "Coming-up card fits the narrowest phones" block in `tests/e2e/home.spec.ts`
  own that reasoning, including why that block measures against the card's edge
  as well as the viewport. Neither states a per-cell pixel width, deliberately:
  those are machine-local in exactly the way `header-widths.spec.ts` records, so
  a number belongs only where a test reproduces it and everything else is prose
  about mechanism.

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

- A `.display` heading is one long word away from scrolling the whole page
  sideways, and no test on this site sees it until one is written for that
  page. `/announcements` did it at every width from 300 to 439px and again
  from 640 to 658px, because ANNOUNCEMENTS has no break opportunity of its
  own. The fix is a soft hyphen in the word (`&shy;` in the JSX), not a
  smaller type step: it costs nothing until the word does not fit, so it
  needs no measured pixel constant, and `hyphens: manual` being the CSS
  default means it breaks the same way in every browser. `hyphens: auto` is
  not an alternative - it does nothing in a browser carrying no hyphenation
  dictionary, which headless Chromium is - and `overflow-wrap: break-word`
  breaks mid-syllable with no hyphen drawn. `app/announcements/page.tsx`
  holds the reasoning and the measurements.
  Guard such a heading with the scrollWidth/clientWidth relation, which is
  platform-independent, and NOT with `toHaveText`: Playwright normalises
  U+00AD away, so `toHaveText('Announce\u00ADments')` passes just as happily
  on the unhyphenated word. Read `textContent` raw instead. Chromium strips
  U+00AD from the accessible name too, which is what keeps `getByRole` name
  lookups working - and is why only the raw read can fail.
  `tests/e2e/public-pages.spec.ts` owns both guards.

- A dialog's key handling must not be bound to the dialog element. A handler
  there only runs while focus is inside it, and focus is not guaranteed to be:
  `tabIndex={0}` on an overlay means a click on non-focusable content inside it
  lands on the overlay ROOT, because Chrome gives such a click to the nearest
  focusable ancestor - and a trap built from `querySelectorAll`, which returns
  descendants only, does not list that root. The flyer lightbox shipped exactly
  that pair. Clicking the flyer (the one click in the overlay that deliberately
  does not close it) left focus on the root, which was neither the trap's first
  stop nor its last, so Tab fell through to the browser and one Shift+Tab put
  focus on the card behind an opaque scrim - where Escape, bound to the
  overlay, reached nothing and the lightbox could not be closed from the
  keyboard at all. Listen on the document for as long as the dialog is open,
  and wrap the trap from any position that is not one of its own stops, not
  only from its first and last. `components/AnnouncementFlyerGallery.tsx` is
  the worked example; `tests/e2e/announcement-lightbox.spec.ts` owns the
  reproduction and drives it with a real keyboard, which is the only place the
  fall-through shows - jsdom does not model that focus rule, so a component
  test has to place focus on the root itself.
  Any e2e that reaches for `focus()` or `keyboard.press()` must first wait for
  hydration. Neither carries an actionability check, so against `next dev` a
  press can land before React has attached the handler and is swallowed with
  nothing to retry. `waitForHydration` in `tests/fixtures/hydration.ts` is the
  shared wait.

- The toolchain is pinned three ways - `packageManager` and `engines.node` in
  `package.json`, plus `.nvmrc` - because without them any npm rewrites
  `package-lock.json` into its own format, and one already did: commit
  `a55222b` (2026-08-03) stripped `libc` from all 24 platform-specific
  optional dependencies and left a stray `dev: true`, and `10aa81d` and
  `5ffb730` carried that forward until it was restored from `6a982e4`. `libc`
  marks which C library a prebuilt binary targets, which is how npm tells a
  glibc artifact from a musl one.
  The floor for writing `libc` is npm 11.11.0, bisected by regenerating this
  lockfile from scratch with each release - 11.10.0 and below emit none. There
  is no npm 10.10; the 10.x line ends at 10.9.9, so do not reach for a 10.x
  pin. The pin stops at the newest 11.x because npm 12 requires Node
  `^22.22.2 || ^24.15.0 || >=26.0.0` and cannot run on the Node 20 that
  `.github/workflows/quality.yml` uses; raising the npm pin past 11 means
  raising CI's Node first.
  Note that `libc` does not heal on its own. npm reuses locked metadata, so no
  version re-adds it on a plain `npm install` - a stripped lockfile stays
  stripped until the fields are put back deliberately, which is why the
  damage sat unnoticed through two later commits. The check that catches all
  of this is `npm install` on a clean checkout leaving `package-lock.json`
  byte-unchanged; `npm ci` never writes the lockfile and so proves nothing
  here.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
