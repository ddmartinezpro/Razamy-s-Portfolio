# Razamy — Portfolio de David Díaz Martínez

Portfolio personal de **David Díaz Martínez**, desarrollador web Full Stack especializado en Angular y TypeScript. Muestra experiencia, stack, proyectos y demos interactivas, en español e inglés y con tema claro/oscuro.

> 🌐 Web publicada: *pendiente de despliegue* (ver [plan](docs/plan-implementacion.md), tarea F0.6).

## Características

- **Bilingüe (ES/EN)** sin librerías de traducción: todo el texto vive en [`portfolio-content.ts`](src/app/data/portfolio-content.ts) y se elige con un servicio basado en signals.
- **Tema claro/oscuro** con tokens CSS; respeta la preferencia del sistema y recuerda la elección.
- **Fondo de partículas** en canvas y animaciones de aparición al hacer scroll, desactivadas con `prefers-reduced-motion`.
- **Galería de proyectos** con capturas de trabajos reales.
- **Demos interactivas:**
  - **CV Generator** — editor de CV a partir de un JSON, con dos formatos (AWS y visual) y descarga en PDF.
  - **Gestión de Ventas** — CRUD administrativo contra una API REST en ASP.NET Core + PostgreSQL (en desarrollo).
- **PWA** instalable con service worker.

## Stack

Angular 22 (componentes standalone, signals, sin zone.js) · TypeScript · CSS con custom properties · html2pdf.js · Karma + Jasmine · ESLint (angular-eslint) · Prettier · GitHub Actions.

## Desarrollo

Requisitos: Node.js 24 y npm.

```bash
npm install
npm start            # servidor de desarrollo en http://localhost:4200
```

| Script | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Build de producción en `dist/razamy-portfolio` (con service worker) |
| `npm test` | Tests en modo watch (Chrome) |
| `npm run test:ci` | Tests una sola vez en Chrome headless |
| `npm run lint` | ESLint sobre TypeScript y plantillas |
| `npm run format` | Formatea `src/` con Prettier |

Para ejecutar un solo archivo de tests:

```bash
npx ng test --include=src/app/services/theme.service.spec.ts
```

## Estructura

```
src/app/
├── components/       # home, navbar, footer, fondo de partículas y demos/
├── data/             # portfolio-content.ts: todo el texto en ES y EN
├── directives/       # reveal-on-scroll (animación al entrar en pantalla)
└── services/         # idioma, tema y API de la demo de Ventas
```

- Textos nuevos: añadirlos a la interfaz `PortfolioContent` y rellenar **ambos** idiomas.
- Colores nuevos: usar los tokens de `src/styles.css` (`:root` y `:root[data-theme='dark']`).

## Hoja de ruta

El trabajo pendiente está organizado por fases en [docs/plan-implementacion.md](docs/plan-implementacion.md).

## Contacto

- Email: [lnkddmartinez@gmail.com](mailto:lnkddmartinez@gmail.com)
- LinkedIn: [David Díaz Martínez](https://www.linkedin.com/in/david-d%C3%ADaz-mart%C3%ADnez-3b0b71321/)
