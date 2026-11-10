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
npm run images            # assets-src/ originals -> WebP screenshots (480/960/1600/2560) + profile images
npm run icons             # favicon + PWA icons from src/assets/icons/razamy_logo_icon.svg
npm run og-image          # public/og-image.jpg from scripts/og-image.html (needs Chrome/Edge)
```

Image originals live in `assets-src/` (not deployed); never reference them from the app. Project screenshots are stored as `<name>-<width>.webp` and referenced in the content by base path without extension — build `src`/`srcset` with `responsiveImage()` from `src/app/data/responsive-image.ts` (its widths must match the script).

CI (`.github/workflows/ci.yml`, Node 24) runs lint → `test:ci` → build on every push to `main` and on PRs; keep all three green. The project is zoneless (no zone.js): in specs call `fixture.detectChanges()` explicitly after interactions, and add `provideRouter([])` for components that use `RouterLink`.

`eslint.config.js` has a **temporary** block that downgrades known a11y/typing issues to warnings for files whose fixes are scheduled in the plan (each line names its task). When finishing one of those tasks, delete its entry there so the rules become errors again. Prettier is configured but the codebase has not been mass-formatted yet (plan task F0.4b) — don't reformat unrelated files in feature commits.

`.claude/launch.json` defines an `ng-serve` preview config on port 4200.

Production build budgets (angular.json) are strict: **component styles error above 20kB** (warn at 18kB), initial bundle errors at 2MB. Large component CSS files will fail `ng build` — split styles or move shared rules to `src/styles.css`.

## Architecture

- **Routing** (`src/app/app.routes.ts`): home (`''`) is eager on purpose (lazy-loading the landing page hurt LCP/CLS); `demos/cv-generator` and `demos/ventas` are lazy with `loadComponent`; unknown paths redirect home (a `/demos` landing page comes back in plan F8.1). Keep the hero free of `appReveal` (content hidden until scroll would delay the LCP).
- **Section navigation** is owned by `NavbarComponent`, not the router: links call `navigateToSection()` (smooth scroll + active-link lock), an IntersectionObserver highlights the visible section, and on load a `#section` hash scrolls to that section and is then stripped from the URL. Router navigations with a section fragment (e.g. `routerLink="/" fragment="projects"` from the demos) are also scrolled by the navbar, because the router's own anchor scrolling fires before the lazy home has rendered. To add a home section: give it an `id`, add it to `SectionId`/`sectionIds`/`sectionLinks` in the navbar and a `nav.<id>` label in the content.
- **Home sections** live in `home.component.*`, which is close to the 20kB component-style budget; larger new sections go in their own child component (e.g. `home/experience-timeline`), with the section heading kept in the home template so it reuses the shared section styles.
- **Project gallery** in home is a native `<dialog>` opened with `showModal()` (top layer, Escape and focus restore are native); every close path ends in `onGalleryClosed()`. A project with `comingSoon: true` in the content shows a "coming soon" badge instead of its demo link.
- **Shell** (`app.component`): `ParticleBackgroundComponent` + `NavbarComponent` + `<router-outlet>` + `FooterComponent`.
- **Content / i18n**: there is no Angular i18n or translation library. All user-facing copy lives in `src/app/data/portfolio-content.ts` as `portfolioContent: Record<'es' | 'en', PortfolioContent>` (plus language-independent `portfolioContact`). Components inject `PortfolioLanguageService` and derive text with `computed(() => portfolioContent[this.language()])`. When adding copy, extend the `PortfolioContent` interface and fill **both** `es` and `en` entries. Language persists in `localStorage['portfolio-language']`; the service applies `<html lang>`, `document.title` and the meta description (from `content.meta`) both at startup and on every change. `index.html` holds the Spanish defaults.
- **Theming**: `ThemeService` sets `document.documentElement.dataset.theme` (`light`/`dark`), persisted in `localStorage['portfolio-theme']`, falling back to `prefers-color-scheme`. Colors are CSS custom properties defined in `src/styles.css` under `:root` and overridden in `:root[data-theme='dark']` — use those tokens rather than hard-coded colors.
- **Scroll reveal**: `directives/reveal-on-scroll.directive.ts` is the shared entrance-animation directive.
- **Accessibility conventions** (axe-clean at WCAG 2.2 AA, except the demo form labels scheduled in plan F5.5/F6.5): focus styling comes from the global `:focus-visible` rule with the `--focus-ring` token — don't add `outline: none`. `AppComponent` renders the skip link to `<main id="main-content" tabindex="-1">`. Use the global `.sr-only` class for hidden labels and live regions. When an element has an `aria-label`, it must start with its visible text (WCAG 2.5.3). The navbar traps Tab inside the open mobile menu. Interactive things are real `<button>`/`<a>` elements, not spans with click handlers. To re-audit, inject `node_modules/axe-core/axe.min.js` into the dev server page and run `axe.run()`; a hidden browser pane freezes CSS transitions, so disable them first or contrast results are bogus.
- **3D logo (unused)**: `components/navbar/three-logo` (Three.js + GSAP, loads `src/assets/models/razamy-logo.glb`) is not imported anywhere, and it has its own `dark-mode` body-class theme logic that predates `ThemeService`. `three` and `gsap` are therefore dead dependencies.
- **Demos**:
  - `cv-generator` — client-side CV builder exported to PDF with `html2pdf.js` (output is a JPEG per page, no text layer). David's CV source data lives in `cv-generator/data/cv-david.{es,en}.json`. Its editor panel uses theme tokens, but the CV sheet (`.page-format`) is always white paper with its own fixed colors — keep it that way so the PDF does not depend on the theme.
  - `ventas` — sales/inventory CRUD UI backed by `services/ventas.service.ts`, which calls a **separate ASP.NET Core REST backend hard-coded at `http://localhost:5297/api`** (not in this repo). Without that backend the page shows an "API unavailable" banner (resource getters read through `hasValue()`, because `value()` throws in error state). Domain names are Spanish (`Venta`, `Producto`, `Proveedor`, `TipoPago`, …).
- **Assets**: `public/` (icons, `manifest.webmanifest`) and `src/assets/` (CV PDFs in `cv/` — ES/EN files referenced from content via `nav.cvFile`, project screenshots in `img/projects/`, 3D models) are both copied to the build output.

## Notes

- **Implementation plan:** `docs/plan-implementacion.md` (Spanish) is the working roadmap — phases F0–F8 with checkbox tasks, priorities and a decisions log. Read it before starting feature work, tick tasks off as they are completed, and record new decisions in its "Decisiones tomadas" table.
- The Ventas backend (separate repo) is ASP.NET Core + EF Core + PostgreSQL; the API contract the frontend expects is in Anexo A of the plan.
- Capacitor is not a current dependency: an earlier `android/` + `capacitor.config.ts` experiment was deleted and never committed. A future Capacitor demo (plan F8.3) starts from scratch.
- `README.md` describes the project for visitors (stack, scripts, structure); add the public URL there once the site is deployed (plan F0.6).
