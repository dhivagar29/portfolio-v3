# portfolio-v3

Ground-up, futuristic rebuild of [Dhivagar Kamaraj](https://dhivagar.in)'s portfolio: a single-page "orbital mission control" site with a hand-drawn Canvas 2D hero (a release pipeline orbiting a planet horizon: CI → scan → gate → deploy).

- Vite + React 18 + TypeScript, prerendered to static HTML at build time
- No animation library, no analytics, no third-party requests at runtime; fonts are self-hosted via `@fontsource`
- All copy lives in [`src/content.ts`](src/content.ts), so every fact on the page can be audited in one file
- Respects `prefers-reduced-motion` (canvas freezes, reveals and typing are off), keyboard navigable, skip link, mobile-first

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check, build and prerender into dist/
npm run preview   # serve dist/
```

Deploys as a static site on Vercel (framework preset: Vite, output `dist`).
