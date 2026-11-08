# Plan de implementación — Portfolio v2

Guía de trabajo para llevar el portfolio de la v1 a una versión pública y pulida. Se basa en la auditoría del 2026-11-07 y en las decisiones tomadas después (ver [Decisiones](#decisiones-tomadas)).

**Cómo usar este documento**
- Las fases van en orden. Dentro de cada fase, primero las tareas de prioridad **Alta**.
- Marca cada tarea con `[x]` al terminarla. Si cambia una decisión, actualiza la sección de [Decisiones](#decisiones-tomadas).
- Prioridades: **Alta** (visible para un visitante o bloqueante), **Media** (calidad notable), **Baja** (mejora opcional).
- Toda tarea cumple además la [Definición de hecho](#definición-de-hecho) común.

## Índice

- [Fase 0 — Repo, herramientas y deploy](#fase-0--repo-herramientas-y-deploy)
- [Fase 1 — Bugs visibles](#fase-1--bugs-visibles)
- [Fase 2 — Contenido y textos](#fase-2--contenido-y-textos)
- [Fase 3 — Rendimiento, SEO y PWA](#fase-3--rendimiento-seo-y-pwa)
- [Fase 4 — Accesibilidad](#fase-4--accesibilidad)
- [Fase 5 — CV Generator](#fase-5--cv-generator)
- [Fase 6 — Ventas: front](#fase-6--ventas-front)
- [Fase 7 — Ventas: back (.NET + PostgreSQL) y despliegue](#fase-7--ventas-back-net--postgresql-y-despliegue)
- [Fase 8 — Laboratorio de demos](#fase-8--laboratorio-de-demos)
- [Definición de hecho](#definición-de-hecho)
- [Decisiones tomadas](#decisiones-tomadas)
- [Anexo A — Contrato de la API de Ventas](#anexo-a--contrato-de-la-api-de-ventas)
- [Anexo B — Opciones de hosting gratuito](#anexo-b--opciones-de-hosting-gratuito)

---

## Fase 0 — Repo, herramientas y deploy

Objetivo: el código en GitHub al día, con tests, lint y CI funcionando, y la web publicada.

- [x] **F0.1 · Alta — Limpiar el índice de git y subir el estado actual** *(hecho 2026-11-07)*
  - `android/`, `capacitor.config.ts` y `src/assets/cv/CV_David_Diaz_2026_01_visual-1.pdf` están añadidos al índice pero borrados del disco: quitarlos con `git rm -r --cached android capacitor.config.ts src/assets/cv/CV_David_Diaz_2026_01_visual-1.pdf`.
  - Commit de todo el rediseño v1 (unos 34 archivos) y `git push` (hoy `origin/main` va 2 commits por detrás).
  - La futura demo con Capacitor (F8.3) se creará desde cero, no con la carpeta antigua.
  - *Hecho cuando:* `git status` limpio y `origin/main` igual a `main`.

- [ ] **F0.2 · Alta — Arreglar `ng test`**
  - En `angular.json`, target `test`, cambiar el asset `"public"` por `{ "glob": "**/*", "input": "public" }` (el builder de Karma no acepta la forma de texto).
  - *Hecho cuando:* `npx ng test --watch=false --browsers=ChromeHeadless` termina en verde.

- [ ] **F0.3 · Media — Tests mínimos razonables**
  - Sustituir los specs "should create" por tests reales de: `PortfolioLanguageService` (idioma inicial, persistencia, `<html lang>`), `ThemeService` (tema inicial, toggle, `data-theme`) y `NavbarComponent` (abrir/cerrar menú, Escape).
  - Borrar los specs de componentes eliminados (`about-me`, `demos`).
  - Sin objetivo de cobertura.

- [ ] **F0.4 · Media — ESLint y Prettier**
  - `ng add @angular-eslint/schematics`, configurar Prettier respetando `.editorconfig`, scripts `npm run lint` y `npm run format`.
  - Añadir `charset = utf-8` en `.editorconfig` y quitar el BOM de `navbar.component.ts`, `styles.css` y `ventas.component.ts`.

- [ ] **F0.5 · Media — CI con GitHub Actions**
  - Workflow en push y pull request: `npm ci` → lint → tests headless → `ng build`.

- [ ] **F0.6 · Alta — Deploy del front**
  - Elegir entre Vercel y Cloudflare Pages (ver [Anexo B](#anexo-b--opciones-de-hosting-gratuito)); ambos sirven para un portfolio personal gratis.
  - Configurar: directorio de salida `dist/razamy-portfolio/browser`, regla de SPA (toda ruta → `index.html`), `ngsw-worker.js` y `ngsw.json` sin caché (`Cache-Control: no-cache`), previews por pull request.
  - Dominio propio opcional.
  - **Antes de publicar** debe estar hecho F1.9 (que Ventas no se vea rota).
  - *Hecho cuando:* la URL pública carga, navega a `/demos/cv-generator` recargando la página sin 404, y la PWA se instala.

- [ ] **F0.7 · Baja — Limpieza de código muerto**
  - Quitar `title` de `AppComponent`.
  - Assets sin uso: `chevron-left.svg`, `database.svg`, `isotipo_transp.png`, `logo_navbar.png`. Revisar si `razamy_icon_just_legs.svg`, `razamy_logo_left_lent.svg` y `razamy_logo_right_lent.svg` se guardan como recursos de marca (si no, borrar). `brand-github.svg` se usa en F2.2.
  - **No borrar**: `three-logo`, `three`, `gsap`, `@types/three` ni `razamy-logo.glb` (se usan en la demo 3D, F8.2).
  - Silenciar los avisos de CommonJS de `html2pdf.js` con `allowedCommonJsDependencies` en `angular.json`.

- [ ] **F0.8 · Baja — README real**
  - Descripción, stack, scripts, estructura, cómo desplegar y enlace a la web publicada.

---

## Fase 1 — Bugs visibles

Objetivo: que nada de lo que ve un visitante parezca roto.

- [ ] **F1.1 · Alta — Texto corrupto en Ventas**
  - `ventas.component.html` tiene 22 líneas con caracteres mal codificados ("GestiÃ³n", "CategorÃ­as", "Ã—"). Reescribir con los caracteres correctos y guardar en UTF-8 sin BOM.
  - *Hecho cuando:* `grep "Ã" src -r` no devuelve nada.

- [ ] **F1.2 · Alta — Quitar rutas vacías**
  - Eliminar la ruta y el componente `/about-me`.
  - Eliminar la ruta y el componente placeholder `/demos` (se recrea en F8.1). Mantener `/demos/cv-generator` y `/demos/ventas`.

- [ ] **F1.3 · Alta — Las demos respetan el tema claro/oscuro**
  - Hoy, en oscuro, los títulos de Ventas salen blanco sobre blanco (heredan `h1–h6 { color: var(--color-ink) }`) y en el CV Generator no se leen "Formato AWS" / "Formato Visual".
  - Ventas y el panel del CV Generator pasan a usar los tokens de `src/styles.css`. La hoja del CV (el "papel") sigue blanca con colores propios, pero acotados a su contenedor para que no le afecte el tema.
  - *Hecho cuando:* ambas demos se ven bien en claro y oscuro.

- [ ] **F1.4 · Alta — CV en inglés**
  - Hoy `David-Diaz-Martinez-CV-EN.pdf` y `-ES.pdf` son el mismo archivo (en español).
  - Claude traduce el JSON del CV al inglés → David revisa la redacción → se genera el PDF EN con el CV Generator (formato visual).
  - Guardar los JSON fuente en el repo (p. ej. `src/app/components/demos/cv-generator/data/cv-david.es.json` y `.en.json`) para poder regenerar.
  - Cuando exista la opción "PDF con texto" (F5.4) se regeneran los dos (F5.10).

- [ ] **F1.5 · Alta — Modal de la galería**
  - Problemas: el footer se pinta encima cuando está en pantalla (el `<main>` crea un contexto de apilamiento con `z-index: 1` y el footer tiene `z-index: 2`), Escape no cierra y el foco no entra en el modal.
  - Solución recomendada: usar el elemento nativo `<dialog>` con `showModal()`. Va en la capa superior (adiós al problema de z-index), cierra con Escape, deja inerte el resto de la página y devuelve el foco al cerrar. Estilizar el fondo con `::backdrop`.
  - Mover el foco al botón Cerrar al abrir; `alt` distinto por miniatura ("Mojito360 — captura 2 de 3").

- [ ] **F1.6 · Media — Footer**
  - Quitar el `<footer>` que envuelve a `<app-footer>` en `app.component.html` (hoy hay un footer dentro de otro).
  - Año del copyright dinámico.

- [ ] **F1.7 · Media — Idioma en el documento**
  - `<html lang>` se sincroniza también al cargar (hoy solo al cambiar idioma).
  - `document.title` y `<meta name="description">` según idioma (servicios `Title` y `Meta` de Angular).
  - `<noscript>` bilingüe.

- [ ] **F1.8 · Media — Enlaces directos a secciones**
  - Hoy `/#contact` siempre abre arriba porque `handleInitialPosition` (`navbar.component.ts`) borra el hash.
  - Nuevo comportamiento: si la URL trae `#seccion`, hacer scroll a esa sección al cargar; si no, empezar arriba.

- [ ] **F1.9 · Alta — Ventas sin back público**
  - Hasta F7, la demo de Ventas no puede funcionar en la web publicada.
  - La tarjeta de Ventas muestra "Próximamente" sin enlace a la demo (o la ruta muestra un aviso de "demo en construcción"), y la página no debe lanzar errores en consola si la API no responde (hoy lanza `ResourceValueError`).
  - Se revierte en F7.8.

---

## Fase 2 — Contenido y textos

- [ ] **F2.1 · Alta — Sección de experiencia (línea de tiempo compacta)**
  - Entre Stack y Proyectos, con los datos que ya existen en `portfolioContent.experience`.
  - Una fila por empresa: periodo · puesto · empresa (con enlace) y como mucho una línea de descripción. Debe ocupar menos de una pantalla.
  - Cierre con botón "Descargar CV completo".
  - Añadir "Experiencia" al menú (desktop y móvil) y al observador de secciones activas.

- [ ] **F2.2 · Alta — Enlace a GitHub**
  - En contacto y footer, con el icono `brand-github.svg`. Perfil: `https://github.com/ddmartinezpro` (confirmar) y, si es público, enlace al repo del portfolio.

- [ ] **F2.3 · Media — Botón "Copiar email"**
  - Junto a "Enviar email", con la Clipboard API y confirmación visual ("Copiado"). `mailto:` no funciona si no hay un programa de correo configurado.

- [ ] **F2.4 · Media — Textos y traducciones pendientes**
  - Botón de tema en desktop: hoy dice "Light"/"Dark" fijo en inglés → usar `themeLight`/`themeDark`.
  - Etiquetas accesibles en inglés fijas ("Main navigation", "Razamy portfolio home", "Portfolio highlights") → al contenido traducido.
  - Subtítulos de proyectos en español en la versión ES ("Plataforma de supply chain", "Demo interactiva", …).
  - EN: "Let us talk about a role or project." → "Let's talk about a role or project."
  - "Ver CV" / "View CV" → "Descargar CV" / "Download CV" (el enlace descarga).
  - `alt` de la foto con tildes: "David Díaz Martínez".

- [ ] **F2.5 · Media — Stack actualizado**
  - Añadir C# / .NET (ASP.NET Core) y Entity Framework Core al grupo Backend.
  - Revisar si Jest sigue siendo representativo.

- [ ] **F2.6 · Media — Portada y estadísticas**
  - Años de experiencia: desde enero 2023 son casi 4 → "4+" o calcularlo.
  - Estadísticas con cifras reales donde sea posible (proyectos entregados, empresas, demos públicas…).
  - Móvil: estadísticas en cuadrícula 2×2 en lugar de una por fila.

- [ ] **F2.7 · Media — Botón "Volver al portfolio" en las demos**

- [ ] **F2.8 · Baja — Casos de estudio en proyectos**
  - En el modal de cada proyecto: problema → solución → resultado (2–3 líneas cada uno), además de las capturas.

---

## Fase 3 — Rendimiento, SEO y PWA

- [ ] **F3.1 · Alta — Imágenes optimizadas (lo hace Claude)**
  - Script `scripts/optimize-images.mjs` (con `sharp`) que genera WebP a 960, 1600 y 2560 px de cada captura, y 256/512 px de la foto de perfil (hoy 2099 px y 753 KB, mostrada a 82 px).
  - Usar `NgOptimizedImage` (`ngSrc`, `ngSrcset`, `sizes`, `width`/`height`), `priority` en la foto de la portada y carga diferida en las tarjetas. El modal usa la versión de 2560 px.
  - Mover los originales fuera de `src/assets` (p. ej. `assets-src/`) para no desplegarlos.
  - *Hecho cuando:* la calidad se ve igual y la página carga muchos menos MB.

- [ ] **F3.2 · Media — Fuentes**
  - Quitar el `@import` de Google Fonts de `styles.css` → `<link rel="preconnect">` + `<link rel="stylesheet">` en `index.html` (o fuentes alojadas en el propio sitio).
  - CV Generator: cargar Poppins de la misma forma y quitar la referencia a Roboto (no se carga).

- [ ] **F3.3 · Alta — Metaetiquetas para compartir y SEO**
  - En `index.html`: Open Graph y Twitter Card (título, descripción, imagen `og-image.png` de 1200×630, URL), `canonical`, JSON-LD de tipo `Person` (nombre, puesto, LinkedIn, GitHub, ubicación).
  - `robots.txt` y `sitemap.xml` en `public/`.
  - Depende del dominio final (F0.6). La imagen OG hay que diseñarla.
  - *Hecho cuando:* el enlace se ve con imagen y texto en LinkedIn (comprobar con su Post Inspector).

- [ ] **F3.4 · Media — PWA**
  - Manifest: `name` "David Díaz Martínez — Portfolio", `short_name` "Razamy", `theme_color`/`background_color` de la marca (hoy `#1976d2`/`#fafafa`, los de Angular por defecto), `description`, `lang`.
  - Separar iconos `any` y `maskable` (y comprobar la zona segura de los maskable).
  - Mover `favicon.ico` a `public/` (el `ngsw-config.json` lo espera en `/favicon.ico`) y quitar `/index.csr.html` del config.

- [ ] **F3.5 · Media — Auditoría Lighthouse**
  - Objetivo ≥ 90 en rendimiento, accesibilidad, buenas prácticas y SEO, en móvil y escritorio. Anotar los resultados aquí.

- [ ] **F3.6 · Baja — Prerender (SSG) con `@angular/ssr`**
  - Esfuerzo medio: hay que proteger el código que usa `window`, `document` y `localStorage` al arrancar (`PortfolioLanguageService`, `ThemeService`, `HomeComponent`, `NavbarComponent`, `ParticleBackgroundComponent`).
  - Beneficio limitado: es una sola página y el idioma se elige en el cliente, y las metaetiquetas de F3.3 ya las ven los rastreadores. Hacer solo si sobra tiempo.

- [ ] **F3.7 · Baja — Analítica ligera sin cookies**
  - Cloudflare Web Analytics (si se despliega en Cloudflare), Vercel Analytics, Plausible o Umami. Decidir según el hosting.

---

## Fase 4 — Accesibilidad

- [ ] **F4.1 · Media — Menú móvil:** al abrir, mover el foco al primer enlace y mantenerlo dentro del menú; al cerrar, devolverlo al botón (esto último ya existe).
- [ ] **F4.2 · Media — Chips con tooltip del stack:** convertirlos en `<button>` (o `role="button"` + `aria-expanded`) que se abran con Enter/Espacio.
- [ ] **F4.3 · Media — Enlace "Saltar al contenido"** como primer elemento enfocable.
- [ ] **F4.4 · Media — Foco visible global** con `:focus-visible` usando los tokens del tema.
- [ ] **F4.5 · Media — Revisión con axe** (extensión de DevTools) en claro y oscuro, ES y EN; corregir contrastes y etiquetas.
- [ ] **F4.6 · Baja — Movimiento reducido:** comprobar que con `prefers-reduced-motion` se desactivan las animaciones de aparición, la inclinación de tarjetas y las partículas.

---

## Fase 5 — CV Generator

- [ ] **F5.1 · Alta — Versión móvil**
  - Por debajo de ~900 px: pestañas "Editor" / "Vista previa".
  - La hoja A4 se escala al ancho disponible (`transform: scale()` calculado con `ResizeObserver`) sin cambiar su diseño.
  - La descarga usa la hoja a tamaño real (quitar la escala durante la exportación).

- [ ] **F5.2 · Alta — Importar JSON desde archivo**
  - Botón "Importar" y arrastrar y soltar, aceptando `.json` y `.txt`. Se mantiene la opción de pegar el texto.

- [ ] **F5.3 · Alta — Validación y errores**
  - JSON inválido o con forma incorrecta → mensaje visible junto al editor (hoy solo va a la consola y puede dejar la vista previa en blanco).
  - Campos opcionales seguros: sin `website` no se genera `href="undefined"`; `profiles` y `location` opcionales.

- [ ] **F5.4 · Media — Segunda opción: "PDF con texto"**
  - Comprobado: el PDF actual es una única imagen JPEG por página, sin texto (los filtros automáticos de CV no lo leen; si un visor lo deja seleccionar es porque aplica OCR por su cuenta).
  - Añadir un segundo botón que use la impresión del navegador ("Guardar como PDF") con hoja de estilos de impresión: `@page { size: A4; margin: 0 }`, `print-color-adjust: exact`, y ocultar todo menos la hoja.
  - Mostrar una nota: "En el diálogo, elige Guardar como PDF y desactiva encabezados y pies de página".
  - Probar en Chrome, Edge y Firefox que se mantienen fondos y colores.
  - El botón actual (imagen) se mantiene como opción principal.

- [ ] **F5.5 · Media — Accesibilidad del editor**
  - Zona de "Subir img" como `<button>`/`<label>` usable con teclado.
  - Selector AWS/Visual como grupo de radios con etiquetas asociadas (hoy son dos checkboxes dentro de un `div` con `click`).
  - Etiquetas para el selector de idioma y el editor; `alt` correctos en los iconos (hoy todos dicen "phone-icon").

- [ ] **F5.6 · Media — Exportación robusta**
  - `try/catch`, estado "Generando…" en el botón, esperar a `document.fonts.ready`.
  - Nombre de archivo según nombre e idioma (`CV_David_Diaz_EN.pdf`).
  - Saltos de página para CV largos (`pagebreak: { mode: ['css', 'legacy'] }` y `break-inside: avoid` en las secciones).

- [ ] **F5.7 · Baja — Orden del código**
  - Datos del CV y diccionarios a archivos `data/` (los de Laury se quedan comentados de momento).
  - Corregir la errata `sumary` → `summary` aceptando ambas claves para no romper JSON existentes.
  - `track` por índice en las listas que pueden repetir valores.

- [ ] **F5.8 · Baja — Exportar el JSON actual** (botón para descargarlo).

- [ ] **F5.9 · Baja — Tests** de la validación del JSON.

- [ ] **F5.10 · Media — Regenerar los CV del portfolio (ES y EN) con "PDF con texto"** y reemplazar los de `src/assets/cv/`.

---

## Fase 6 — Ventas: front

Todo el trabajo de front y estilos, antes de conectar el back definitivo.

- [ ] **F6.1 · Alta — URL de la API configurable**
  - `InjectionToken` `API_BASE_URL` en `app.config.ts`, con valores por entorno (`environment.ts` / `environment.development.ts` + `fileReplacements`). Desarrollo: `http://localhost:5297/api`.

- [ ] **F6.2 · Alta — Refactor del CRUD**
  - Hoy hay 6 bloques casi idénticos (593 líneas de TS, 545 de HTML) y 30 métodos repetidos en el servicio.
  - Servicio genérico `CrudApi<T, TPayload>` y componente/configuración por entidad (columnas, campos del formulario, textos).
  - Formularios reactivos tipados en lugar de `ngModel` sobre objetos sueltos.

- [ ] **F6.3 · Alta — Estados de carga, error y vacío**
  - Banner de error con "Reintentar" cuando la API no responde (distinto de "no hay datos").
  - Indicador de carga; botones deshabilitados mientras se guarda (hoy se puede enviar dos veces).

- [ ] **F6.4 · Alta — Tema, idioma y fuentes del sitio**
  - Tokens de tema (ver F1.3), textos traducidos usando `PortfolioLanguageService`, fuentes del sitio.

- [ ] **F6.5 · Media — Formularios y validación**
  - `<form>` con envío por Enter, `<label for>` asociados, mensajes de error por campo.
  - Reglas: cantidades y precios > 0, `precioVenta` ≥ `precio` (aviso), cantidad vendida ≤ stock, `fechaPago` ≥ `fechaVenta`.

- [ ] **F6.6 · Media — Tablas**
  - En móvil: scroll horizontal o diseño en tarjetas (hoy se aplastan las de 8–11 columnas).
  - Formato de moneda y fechas (definir la moneda); acciones con contexto ("Editar Producto X").
  - Al editar en móvil, llevar el foco y el scroll al formulario.

- [ ] **F6.7 · Media — Diálogos y avisos propios**
  - Confirmación de borrado con `<dialog>` en lugar de `confirm()`.
  - Avisos con `role="status"`/`role="alert"`, temporizadores limpiados al salir.

- [ ] **F6.8 · Media — Errores del back legibles**
  - Leer tanto `{ message }` como el formato estándar de ASP.NET (`ProblemDetails`: `title`, `detail`, `errors`).

- [ ] **F6.9 · Media — Modo demo (sin servidor)**
  - Interfaz `VentasApi` con dos implementaciones: HTTP y en memoria/localStorage con datos de ejemplo.
  - Si la API no responde, pasar al modo demo con un aviso "Modo demo: los datos se guardan solo en tu navegador".
  - Permite publicar la demo aunque el back esté dormido o caído.

- [ ] **F6.10 · Media — Panel de indicadores, búsqueda y filtros**
  - Ventas del mes, ingresos, margen (`precioVenta` − `precio`), productos con poco stock.
  - Búsqueda, filtros y paginación en las tablas.

- [ ] **F6.11 · Baja — Miniatura de la imagen del producto** (`productoImg`, hoy se guarda pero no se muestra).

- [ ] **F6.12 · Baja — Tests** del servicio genérico y del modo demo.

---

## Fase 7 — Ventas: back (.NET + PostgreSQL) y despliegue

Back actual: ASP.NET Core + Entity Framework Core (con migraciones) + PostgreSQL 16 (`ventasdb`, en local en el puerto 5433).

- [ ] **F7.1 · Alta — Contrato API** — comparar el back con el [Anexo A](#anexo-a--contrato-de-la-api-de-ventas) y ajustar lo que no coincida (sobre todo respuestas 204, formato de errores, fechas y `''` frente a `null`).
- [ ] **F7.2 · Alta — Reglas de negocio en el back**
  - Al crear o editar una venta, descontar o ajustar stock en una transacción; rechazar si no hay stock.
  - Validar cantidades y precios.
  - Borrar un registro con dependencias (p. ej. producto con ventas) → `409` con mensaje claro.
- [ ] **F7.3 · Alta — CORS** para el dominio del portfolio, sus previews y `localhost` en desarrollo.
- [ ] **F7.4 · Alta — Configuración por entorno**
  - Cadena de conexión y secretos por variables de entorno (nunca en el repo); puerto desde `PORT`/`ASPNETCORE_URLS` para hostings con contenedores.
- [ ] **F7.5 · Alta — Dockerfile** multi-stage de .NET y endpoint `/health`.
- [ ] **F7.6 · Alta — Hosting** (ver [Anexo B](#anexo-b--opciones-de-hosting-gratuito))
  - Recomendado: API en Render (Docker, plan gratis; se duerme tras 15 min sin tráfico) o Azure App Service F1 (.NET nativo, 60 min de CPU al día).
  - Base de datos en Neon o Supabase (Postgres gratis). El Postgres gratis de Render caduca a los 30 días.
  - Verificar condiciones actuales en las páginas de precios antes de elegir.
- [ ] **F7.7 · Media — Datos de la demo pública**
  - Migraciones automáticas al desplegar, datos semilla, reinicio diario opcional (tarea programada) y limitación de peticiones (rate limiting de ASP.NET Core).
- [ ] **F7.8 · Alta — Conectar el front publicado**
  - URL de producción en `API_BASE_URL`; estado "Despertando servidor…" en el arranque en frío, con paso al modo demo si tarda demasiado.
  - Revertir F1.9: la tarjeta de Ventas vuelve a enlazar a la demo.
- [ ] **F7.9 · Baja — Documentación de la API** (Swagger/OpenAPI) enlazada desde la demo ("Ver API").
- [ ] **F7.10 · Baja — Convención de nombres en la BD**
  - Hoy hay `proveedors` (plural automático de EF) y mezcla de columnas en camelCase (`beneficiarioNombre`) con snake_case (`created_at`, `estado_venta_id`). Unificar, p. ej. con `EFCore.NamingConventions`.
- [ ] **F7.11 · Baja — Endpoint de contacto** (ejercicio opcional): formulario en el portfolio que envía a este back, con protección anti-spam (campo trampa o Cloudflare Turnstile).

---

## Fase 8 — Laboratorio de demos

Demos públicas propias, separadas de los proyectos de experiencia laboral.

- [ ] **F8.1 · Alta — Página `/demos`**
  - Rejilla de demos con estado, stack y enlace; enlace "Demos" en el menú.
- [ ] **F8.2 · Media — Demo 3D** con el `ThreeLogoComponent` existente
  - Moverlo a `components/demos/`, sustituir su lógica de tema propia (`dark-mode` en `body`) por `ThemeService`, cargar `three` solo en esa ruta, respetar movimiento reducido y liberar geometrías y materiales al salir.
- [ ] **F8.3 · Media — Demo con Capacitor** (proyecto nuevo, sin reutilizar la carpeta `android/` antigua).
- [ ] **F8.4 · Media — Requisitos comunes de cada demo**
  - Ficha con objetivo y stack, idiomas, tema claro/oscuro, botón de volver y sin errores en consola.

---

## Definición de hecho

Una tarea está terminada cuando, además de su criterio propio:

- Funciona en **ES y EN**, en **tema claro y oscuro**, en **móvil (375 px)** y **escritorio**.
- No hay errores en la consola del navegador.
- `npm run build` pasa (ojo: el CSS de cada componente da error por encima de 20 kB).
- Los tests pasan (desde F0.2) y el lint pasa (desde F0.4).
- Los textos nuevos están en `portfolio-content.ts` en los dos idiomas.
- Los colores nuevos usan los tokens de `src/styles.css`.

---

## Decisiones tomadas

| Fecha | Decisión |
|---|---|
| 2026-11-07 | Formato de la guía: Markdown en el repo con casillas. |
| 2026-11-07 | Se elimina `/about-me`; la portada es suficiente. |
| 2026-11-07 | `/demos` se oculta hasta construir el laboratorio de demos (Fase 8). |
| 2026-11-07 | Experiencia como línea de tiempo compacta + botón para descargar el CV completo. |
| 2026-11-07 | Claude traduce el CV al inglés y David revisa la redacción. |
| 2026-11-07 | "PDF con texto" (impresión del navegador) como segunda opción; se mantiene la descarga actual. |
| 2026-11-07 | El CV Generator mantiene su propio selector de idioma. |
| 2026-11-07 | Se mantienen comentados los datos de ejemplo de Laury en el CV Generator. |
| 2026-11-07 | Las capturas con nombres de clientes se pueden publicar. |
| 2026-11-07 | Se conservan `three-logo`, `three` y `gsap` para la demo 3D. |
| 2026-11-07 | Sin formulario de contacto por ahora; botón "Copiar email". Formulario opcional en Fase 7. |
| 2026-11-07 | La integración completa de Ventas va al final (Fase 7); antes se hace todo el front (Fase 6). |
| 2026-11-07 | Back de Ventas: ASP.NET Core + EF Core + PostgreSQL. |
| 2026-11-07 | Hosting del front pendiente de elegir entre Vercel y Cloudflare Pages. |
| 2026-11-07 | SEO: metaetiquetas primero; prerender solo si sobra tiempo (prioridad baja). |
| 2026-11-07 | Tests: mínimo razonable, sin objetivo de cobertura. |
| 2026-11-07 | Solo prioridades (Alta/Media/Baja), sin estimaciones de tiempo. |

---

## Anexo A — Contrato de la API de Ventas

Lo que espera hoy el front (`src/app/services/ventas.service.ts`). Base: `/api`, JSON en camelCase.

**Rutas** — cada recurso tiene `GET` y `POST` en la colección, y `GET`, `PUT` y `DELETE` en `/{id}`:
`/TipoPagos`, `/EstadoVentas`, `/CategoriaProductos`, `/Proveedores`, `/Productos`, `/Ventas`.

**Modelos** (respuesta → payload de creación/edición). Todas las respuestas incluyen además `id`, `createdAt` y `updatedAt`.

| Recurso | Respuesta | Payload |
|---|---|---|
| TipoPago | `tipoPagoNombre` | `tipoPagoNombre` |
| EstadoVenta | `nombre` | `nombre` |
| CategoriaProducto | `categoriaProductoNombre` | `categoriaProductoNombre` |
| Proveedor | `nombreApellidos`, `proveedorTelefono?`, `proveedorDireccion?` | igual |
| Producto | `productoNombre`, `descripcion?`, `productoImg?`, `cantidad`, `precio`, `precioVenta`, `fechaAdquisicion?`, `proveedor {id, nombre}`, `categoriaProducto {id, nombre}` | igual pero con `proveedorId` y `categoriaProductoId` |
| Venta | `beneficiarioNombre`, `beneficiarioTelefono?`, `beneficiarioDireccion?`, `cantidadVenta`, `conDomicilio`, `fechaVenta`, `fechaPago?`, `fechaLiquidacion?`, `producto {id, nombre}`, `tipoPago {id, nombre}`, `estadoVenta {id, nombre}` | igual pero con `productoId`, `tipoPagoId` y `estadoVentaId` |

**Detalles a cuidar**
- `PUT` y `DELETE` deben responder `204 No Content` (el front espera cuerpo vacío).
- Fechas enviadas como `yyyy-MM-dd`; el front lee las de vuelta con `substring(0, 10)`. Las columnas son `timestamp with time zone`: ojo con el desfase horario.
- Los opcionales de texto vacíos se envían como `''`, no como `null` (solo las fechas vacías van como `null`).
- Errores: hoy el front solo lee `{ message }`; tras F6.8 también `ProblemDetails`.

---

## Anexo B — Opciones de hosting gratuito

Comprobado con fuentes secundarias en noviembre 2026. **Verificar siempre en la página de precios oficial**, porque los planes gratuitos cambian con frecuencia.

| Uso | Opción | Notas |
|---|---|---|
| Front | Vercel (Hobby) | Gratis para uso personal no comercial. Previews por PR. |
| Front | Cloudflare Pages | Gratis; incluye Web Analytics sin cookies. |
| Front | Netlify | Plan gratis por créditos mensuales con tope. |
| API .NET | Render (free) | Docker; se duerme tras 15 min sin tráfico (arranque en frío lento). |
| API .NET | Azure App Service F1 | .NET nativo; 60 min de CPU al día; no apto para producción; pide tarjeta. |
| API .NET | Koyeb | Información contradictoria sobre si se duerme; verificar. |
| API JS/TS | Cloudflare Workers + D1 | Muy generoso y no se duerme, pero no ejecuta .NET. |
| Base de datos | Neon / Supabase | Postgres gratis (Supabase pausa proyectos inactivos). |
| Base de datos | Render Postgres (free) | Caduca a los 30 días; no recomendado. |

Fuentes: [flaviocopes — free tiers (sept. 2026)](https://flaviocopes.com/hosting-free-tiers/) · [Render — free tiers 2026](https://render.com/articles/platforms-with-a-real-free-tier-for-developers-in-2026.md) · [SnapDeploy — state of free hosting](https://snapdeploy.dev/state-of-free-hosting) · [DEV — free backend hosting 2026](https://dev.to/snapdeploy/free-backend-hosting-7-platforms-that-wont-kill-your-api-2026-1i1g) · [devplaybook — Cloudflare vs Vercel](https://devplaybook.cc/blog/best-hosting-platforms-developers-2026/)
