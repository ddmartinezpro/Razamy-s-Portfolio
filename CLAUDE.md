# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio site for David Díaz Martínez ("Razamy"), built with Angular 22 (standalone components, signals, no NgModules). Bilingual (Spanish default / English) with light/dark theming, a canvas particle background, and a few interactive demos. Built as a PWA via `@angular/service-worker`.

## Commands

```bash
npm start                 # ng serve on http://localhost:4200
npm run build             # production build -> dist/razamy-portfolio (service worker enabled)
npm run watch             # dev build in watch mode
npm test                  # Karma + Jasmine (Chrome, watch mode)
npm run test:ci           # single headless run (what CI uses)
npx ng test --include=src/app/services/theme.service.spec.ts   # single spec
npm run lint              # angular-eslint over src/**/*.ts and *.html
npm run format            # Prettier (config in .prettierrc.json)
```

CI (`.github/workflows/ci.yml`, Node 24) runs lint → `test:ci` → build on every push to `main` and on PRs; keep all three green. The project is zoneless (no zone.js): in specs call `fixture.detectChanges()` explicitly after interactions, and add `provideRouter([])` for components that use `RouterLink`.

`eslint.config.js` has a **temporary** block that downgrades known a11y/typing issues to warnings for files whose fixes are scheduled in the plan (each line names its task). When finishing one of those tasks, delete its entry there so the rules become errors again. Prettier is configured but the codebase has not been mass-formatted yet (plan task F0.4b) — don't reformat unrelated files in feature commits.

`.claude/launch.json` defines an `ng-serve` preview config on port 4200.

Production build budgets (angular.json) are strict: **component styles error above 20kB** (warn at 18kB), initial bundle errors at 2MB. Large component CSS files will fail `ng build` — split styles or move shared rules to `src/styles.css`.

## Architecture

- **Routing** (`src/app/app.routes.ts`): every page is lazy-loaded with `loadComponent` — `''` (home), `about-me`, `demos`, `demos/cv-generator`, `demos/ventas`; unknown paths redirect home. Anchor scrolling is enabled, so in-page sections (stack, projects, contact…) are reached via fragments.
- **Shell** (`app.component`): `ParticleBackgroundComponent` + `NavbarComponent` + `<router-outlet>` + `FooterComponent`.
- **Content / i18n**: there is no Angular i18n or translation library. All user-facing copy lives in `src/app/data/portfolio-content.ts` as `portfolioContent: Record<'es' | 'en', PortfolioContent>` (plus language-independent `portfolioContact`). Components inject `PortfolioLanguageService` and derive text with `computed(() => portfolioContent[this.language()])`. When adding copy, extend the `PortfolioContent` interface and fill **both** `es` and `en` entries. Language persists in `localStorage['portfolio-language']` and sets `<html lang>`.
- **Theming**: `ThemeService` sets `document.documentElement.dataset.theme` (`light`/`dark`), persisted in `localStorage['portfolio-theme']`, falling back to `prefers-color-scheme`. Colors are CSS custom properties defined in `src/styles.css` under `:root` and overridden in `:root[data-theme='dark']` — use those tokens rather than hard-coded colors.
- **Scroll reveal**: `directives/reveal-on-scroll.directive.ts` is the shared entrance-animation directive.
- **3D logo (unused)**: `components/navbar/three-logo` (Three.js + GSAP, loads `src/assets/models/razamy-logo.glb`) is not imported anywhere, and it has its own `dark-mode` body-class theme logic that predates `ThemeService`. `three` and `gsap` are therefore dead dependencies.
- **Demos**:
  - `cv-generator` — client-side CV builder exported to PDF with `html2pdf.js`.
  - `ventas` — sales/inventory CRUD UI backed by `services/ventas.service.ts`, which calls a **separate .NET-style REST backend hard-coded at `http://localhost:5297/api`** (not in this repo). The demo only works with that backend running locally. Domain names in this service are Spanish (`Venta`, `Producto`, `Proveedor`, `TipoPago`, …).
- **Assets**: `public/` (icons, `manifest.webmanifest`) and `src/assets/` (CV PDFs in `cv/` — ES/EN files referenced from content via `nav.cvFile`, project screenshots in `img/projects/`, 3D models) are both copied to the build output.

## Notes

- **Implementation plan:** `docs/plan-implementacion.md` (Spanish) is the working roadmap — phases F0–F8 with checkbox tasks, priorities and a decisions log. Read it before starting feature work, tick tasks off as they are completed, and record new decisions in its "Decisiones tomadas" table.
- The Ventas backend (separate repo) is ASP.NET Core + EF Core + PostgreSQL; the API contract the frontend expects is in Anexo A of the plan.
- Capacitor is not a current dependency: an earlier `android/` + `capacitor.config.ts` experiment was deleted and never committed. A future Capacitor demo (plan F8.3) starts from scratch.
- `README.md` is the stock Angular CLI README.
