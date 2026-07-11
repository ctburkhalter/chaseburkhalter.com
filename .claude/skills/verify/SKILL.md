# Verify: chaseburkhalter.com

## Launch

```bash
NEXT_PUBLIC_AMPLITUDE_API_KEY=ci-placeholder-key pnpm dev
```

Port 3000 is often already occupied by a stray dev server from a prior
session; Next.js silently falls back to 3001 and prints the actual port.
Always read the "Local:" line rather than assuming 3000, or `curl` will get
a 500 from whatever else is listening on 3000.

`.env.local` in this repo has `WEATHER_DATA_URL` configured, so `/weather`
serves live published pipeline data (`sourceMode: "pipeline"`), not the
fixture. The fixture-mode amber banner only renders when that env var is
unset or the remote contract fails validation (don't expect to see it in a
normal local run).

## Drive it

Browser automation: Playwright is available via the system Python
(`python3 -c "from playwright.sync_api import sync_playwright"`, pyenv
3.13.1, not project-local). Chromium is already cached at
`~/Library/Caches/ms-playwright/`, no `playwright install` needed. Write a
throwaway script to `/tmp` or the scratchpad and run it with `python3`.

Useful hooks already built into the app for verification:
- `window.__lastTrackedPageViewPath`: sourced from `hooks/use-analytics.ts`,
  tells you the last pathname a `page_view` fired for.
- `window.addEventListener('analytics:event', ...)`: every tracked event
  (page_view, section_viewed, weather_page_viewed, event_explorer_interaction,
  project_explorer_interaction, etc.) dispatches this
  CustomEvent with `{ name, properties, timestamp }` regardless of whether
  the actual Amplitude network call succeeds or fails. This is the same
  mechanism the "Live Analytics Showcase" section's Live Events tab uses, so
  listening for it from a test script is equivalent to reading that UI.
- Map markers on `/weather` render as `.leaflet-interactive` SVG elements
  (`stroke`/`fill` attributes) once you open an event detail sheet (click
  "Inspect" on a table row); close it with `page.keyboard.press("Escape")`
  before continuing, otherwise the Sheet's overlay div intercepts clicks on
  anything else on the page.
- Nav links: `nav a[href="/weather"]`, home logo is
  `a[aria-label="Chase Burkhalter Home"]` (not a nav link).

Console noise to ignore, not a regression: `Invalid API key:
ci-placeholder-key` and `400 Bad Request` from the Amplitude proxy whenever
you don't pass a real `NEXT_PUBLIC_AMPLITUDE_API_KEY`. It doesn't block the
`analytics:event` dispatch above.

## Gotchas

- React Strict Mode is on by default in `next dev` (no `reactStrictMode:
  false` in `next.config.mjs`), which double-invokes effects. This can
  produce a duplicate `section_viewed` for the first section on initial
  mount in dev only, not necessarily present in a production build. Don't
  mistake this for a real bug without checking `pnpm build && pnpm start`.
- The Tailwind accent system (`lib/accent.ts`) and the weather page's
  `chart-*` callout colors depend on `tailwind.config.ts`'s `content` array
  including `./lib/**` and the `chart` palette referencing the real
  `--chart-*` CSS vars: if either regresses, accent colors and the
  fixture/methodology callout boxes silently render unstyled. Check with
  `grep -c "text-emerald-300\|border-chart-3" .next/static/chunks/*.css`
  after `pnpm build` (Next 16 + Turbopack puts CSS under
  `.next/static/chunks/`, not `.next/static/css/` like Webpack builds).
