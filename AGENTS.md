<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Goosley Digital — Agent Guide

## 1. Company Overview

**Goosley Digital** is a premium Brazilian digital consultancy headquartered in Belo Horizonte, Minas Gerais. The company positions itself as a high-end technology partner that builds bespoke digital solutions — never from templates, never with shortcuts. The core philosophy is **"Simplicidade Radical"** (Radical Simplicity): remove all noise and deliver fast, beautiful, and fundamentally functional products.

The company serves businesses that need custom technology adapted to their specific operations, rather than off-the-shelf software. Goosley is founded and led by **Henrique Lima** (Henrique Lima Gusmão), and the development team includes Caetano, Raul, Rodrigo, and Rick.

**Contact:**
- Phone / WhatsApp: +55 31 99421-7926
- Email: henriquelimagusmao@gmail.com
- Website: https://goosley.com.br/

### 1.1 Services Offered

Goosley Digital offers nine core service lines:

| Service | Route | Description |
|---------|-------|-------------|
| **Landing Pages** | `/landing-pages` | High-conversion, design-exclusive landing pages for lead capture |
| **E-commerce** | `/e-commerce` | Custom online stores with payment integration |
| **Aplicativos** (Mobile Apps) | `/aplicativos` | Native and cross-platform mobile applications |
| **Automações & Voice Tuning** | `/automacoes` | Business process automation and AI voice tuning |
| **Diagnóstico de Automação e IA** | `/diagnostico-automacao-ia` | Consultancy to identify which processes benefit from automation and AI |
| **Sistemas Web & Backend** | `/sistemas-web` | Full-stack web systems and backend architecture |
| **Analytics, Dashboards & BI** | `/analytics-dashboards-bi` | Business intelligence dashboards and data analytics |
| **Agentes IA Corporativos** | `/agentes-corporativos` | Enterprise AI agents for customer service, internal ops, etc. |
| **Workflows Autônomos** | `/workflows` | Autonomous workflow orchestration |

### 1.2 Brand Identity

- **Visual**: Dark-mode-first design, black background (`#000000`) with white text (`#ffffff`). Accent colors are orange-500 and indigo-600 gradients.
- **Typography**: Inter (primary sans-serif) and Dancing Script (cursive accents), both from Google Fonts.
- **Tone**: Premium, confident, lowercase headings, editorial-style copy in Brazilian Portuguese (pt-BR).
- **Animations**: Fluid gradient blobs, parallax scrolling, masked text reveals, grain overlay texture, custom cursor, hover-reveal image effects, and infinite marquee loops.

### 1.3 Target Market

Brazilian businesses (locale `pt_BR`) seeking custom digital transformation. The site, all copy, and all UI are in **Brazilian Portuguese**. When writing code, content, or comments visible to end users, always use pt-BR.

---

## 2. Website Architecture

### 2.1 Public Commercial Site

The public-facing commercial website is a marketing site with the following pages:

| Page | File | Purpose |
|------|------|---------|
| **Home** | `src/app/page.tsx` | Hero section with fluid gradient animation, service listing with hover-reveal images, CTA section with quiz link, methodology statement |
| **Nossas Soluções** | `src/app/a-solucao/page.tsx` | Auto-scrolling horizontal gallery of all nine services with hover interactions |
| **Portfolio** | `src/app/portfolio/` | Project showcase |
| **Contato** | `src/app/contato/page.tsx` | Contact form with country code selector, sends message via API route at `/api/contato` |
| **Simule seu Projeto** | `src/app/precos/page.tsx` | Interactive cost estimator (CostEstimator component) driven by `src/data/pricingData.ts` |
| **Quiz** | `src/app/quiz/page.tsx` | Decision-tree quiz that recommends the best service based on user answers |
| **Metodologia** | `src/app/metodologia/` | Goosley's methodology page |
| Service pages | `src/app/landing-pages/`, `src/app/e-commerce/`, `src/app/aplicativos/`, `src/app/automacoes/`, `src/app/diagnostico-automacao-ia/`, `src/app/sistemas-web/`, `src/app/analytics-dashboards-bi/`, `src/app/agentes-corporativos/`, `src/app/workflows/` | Individual service detail pages |

All public pages are wrapped in `PublicChrome` (Navbar + CustomCursor + Footer). Portal pages (`/meu-portal/*`) bypass this wrapper and use their own shell.

### 2.2 Client Portal ("Meu Portal")

The portal is a full-featured project management system at `/meu-portal` with three RBAC roles:

| Role | Dashboard Route | Description |
|------|----------------|-------------|
| **Admin** | `/meu-portal/admin` | Full platform control — users, projects, tasks, finance, settings, audit logs |
| **Client** | `/meu-portal/client` | View project progress, budgets, payments, messaging |
| **Developer** | `/meu-portal/developer` | Assigned tasks, project details, messaging |

Legacy route `/meu-portal/programmer` redirects to `/meu-portal/developer`.

**Portal Features:**
- Login, registration, forgot-password, reset-password flows
- Role-specific sidebar navigation (defined in `PortalShell.tsx`)
- Project tracking with progress percentage, GitHub/staging/production URLs
- Task management with priorities, statuses, and sources
- Messaging system with conversations
- Visual comments (pin-on-page feedback with screenshots)
- Payment tracking with due dates
- Budget requests and cost estimation
- System settings management
- Audit logging for all admin actions
- Notifications system
- Theme toggle (light/dark/system)

**Portal Entry Flow:**
1. `/meu-portal` → `PortalEntry.tsx` (login/register/forgot-password)
2. After auth → role-based redirect to `/meu-portal/admin`, `/meu-portal/client`, or `/meu-portal/developer`
3. Authenticated pages use `PortalShell.tsx` as the app shell (sidebar + top bar)

---

## 3. Technology Stack

### 3.1 Core

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2.6 | React framework (App Router) |
| **React** | 19.2.4 | UI library |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | v4 | Utility-first styling (`@import "tailwindcss"` + `@theme inline`) |
| **Framer Motion** | ^12.40.0 | Animations and transitions |
| **Lenis** | ^1.3.23 | Smooth scroll |
| **Lucide React** | ^1.17.0 | Icon library |
| **clsx** + **tailwind-merge** | ^2.1.1 / ^3.6.0 | Class name utilities (via `cn()` in `src/lib/utils.ts`) |

### 3.2 Infrastructure

| Technology | Purpose |
|------------|---------|
| **Cloudflare Workers** | Production runtime (via OpenNext adapter) |
| **Cloudflare D1** | Relational database (SQLite-compatible, binding `DB`) |
| **Cloudflare KV** | Rate-limit counters, session cache, feature flags (planned) |
| **Cloudflare R2** | File storage for attachments, screenshots, invoices (planned) |
| **Cloudflare Turnstile** | Bot protection on forms |
| **OpenNext (@opennextjs/cloudflare)** | ^1.20.1 — Bridges Next.js to Cloudflare Workers |
| **Wrangler** | ^4.107.0 — Cloudflare CLI for deploy and local dev |
| **Nodemailer** | ^9.0.3 — Email delivery for password recovery, notifications |

### 3.3 Development

| Tool | Purpose |
|------|---------|
| `server.mjs` | Custom Node.js HTTP server with gzip compression for local dev |
| `tsx` | TypeScript execution for scripts and tests |
| ESLint + eslint-config-next | Linting |
| PostCSS | CSS processing for Tailwind v4 |

---

## 4. Project File Map

### 4.1 Root Configuration

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, project metadata |
| `next.config.ts` | Next.js config — CSP headers, security headers, image remote patterns (Unsplash) |
| `tsconfig.json` | TypeScript config — `@/*` path alias → `./src/*` |
| `open-next.config.ts` | OpenNext adapter config — bridges Next.js build to Cloudflare Workers |
| `wrangler.jsonc` | Cloudflare Workers config — D1 binding, assets, service bindings, observability |
| `server.mjs` | Custom HTTP server with compression for `npm run dev` and `npm start` |
| `postcss.config.mjs` | PostCSS plugins for Tailwind v4 |
| `eslint.config.mjs` | ESLint flat config |
| `.dev.vars` / `.dev.vars.example` | Local environment variables (Cloudflare Workers convention, NOT `.env`) |

### 4.2 Source Code (`src/`)

#### `src/app/` — Pages & Routes (Next.js App Router)

| Path | Description |
|------|-------------|
| `layout.tsx` | Root layout — html lang="pt-BR", fonts (Inter + Dancing Script), metadata, SmoothScrollProvider, PublicChrome wrapper |
| `globals.css` | Global styles — CSS custom properties, Tailwind v4 `@theme inline`, Lenis styles, fluid gradient keyframes, grain overlay, glassmorphism |
| `page.tsx` | Homepage — Hero, InfiniteMarquee, HoverReveal services, CTA, methodology statement |
| `error.tsx` | Global error boundary |
| `not-found.tsx` | 404 page |
| `a-solucao/page.tsx` | Solutions gallery page |
| `contato/page.tsx` | Contact form page |
| `precos/page.tsx` | Cost estimator page |
| `quiz/page.tsx` | Decision-tree service recommendation quiz |
| `metodologia/` | Methodology page |
| `portfolio/` | Portfolio showcase page |
| `landing-pages/`, `e-commerce/`, `aplicativos/`, `automacoes/`, `diagnostico-automacao-ia/`, `sistemas-web/`, `analytics-dashboards-bi/`, `agentes-corporativos/`, `workflows/` | Individual service detail pages |
| `meu-portal/page.tsx` | Portal entry — renders `PortalEntry` component |
| `admin/`, `client/`, `developer/` | Portal dashboard pages by role |
| `programmer/` | Legacy redirect → `/meu-portal/developer` |
| `auth/` | Authentication route handlers |
| `api/contato/` | Contact form API route |

#### `src/components/` — Reusable UI Components

| File | Description |
|------|-------------|
| `Navbar.tsx` | Fixed-position navbar — transparent → blurred on scroll, desktop + mobile menu, nav links, "Simule seu Projeto" CTA |
| `Footer.tsx` | Full-width footer — logo, tagline, service links grid, contact info, WhatsApp link |
| `Hero.tsx` | Homepage hero — fluid gradient background with parallax, masked text reveal animation ("SOLUÇÕES CRIATIVAS PARA SEU NEGÓCIO"), CTA buttons |
| `HoverReveal.tsx` | Interactive link that reveals an image on hover, used for service listings |
| `InfiniteMarquee.tsx` | Infinite horizontal scrolling text marquee |
| `CustomCursor.tsx` | Custom cursor that follows mouse on desktop |
| `CostEstimator.tsx` | Interactive project cost calculator — category selection, variable toggles, real-time pricing summary |
| `SmoothScrollProvider.tsx` | Wraps app in Lenis smooth scroll context |
| `PublicChrome.tsx` | Conditionally renders Navbar + Footer + CustomCursor for public pages (excluded for `/meu-portal/*`) |
| `ErrorState.tsx` | Reusable error display component |

#### `src/components/portal/` — Portal-Specific Components

| File | Description |
|------|-------------|
| `PortalEntry.tsx` | Public portal landing — login form, new account, forgot-password, and reset-password flows |
| `PortalForms.tsx` | Form components used within the portal (budget requests, project editing, etc.) |
| `PortalPages.tsx` | Dashboard page content for admin, client, and developer roles |
| `PortalShell.tsx` | Authenticated portal app shell — left sidebar navigation (role-specific), top bar with utility icons, theme toggle, profile, logout |
| `PortalTopActions.tsx` | Top-right action buttons in portal (notifications, calendar) |

#### `src/components/portfolio/` — Portfolio Assets

Contains project images for the portfolio showcase (e.g., `kitchlean.png`).

#### `src/data/`

| File | Description |
|------|-------------|
| `pricingData.ts` | Structured pricing data for all service categories — defines `PricingCategory`, `PricingVariable`, and `PricingOption` types with setup/recurring costs and delivery timelines |

#### `src/lib/`

| File | Description |
|------|-------------|
| `utils.ts` | Utility function `cn()` — combines `clsx` and `twMerge` for Tailwind class merging |

#### `src/server/portal/` — Backend Logic

| File | Description |
|------|-------------|
| `types.ts` | Full TypeScript type system for the portal — `User`, `Project`, `Task`, `Payment`, `Budget`, `VisualComment`, `AuditLog`, `Notification`, `Session`, `PortalDatabase`, `RequestActor`, and all associated enums/unions |
| `store.ts` | In-memory data store for local development — seeded users, projects, tasks. Will be replaced by D1-backed repository functions |
| `services.ts` | Business logic layer — auth services, project CRUD, task management, payments, budgets, messaging, audit logging, notifications |
| `http.ts` | Route handlers — maps HTTP methods/paths to service functions, handles request parsing and response formatting |
| `security.ts` | Security middleware — rate limiting, input validation, CSRF protection, Turnstile verification |
| `validation.ts` | Input validation schemas and helper functions |
| `email.ts` | Email sending abstraction — password recovery, account confirmation, notifications (uses Nodemailer / email provider API) |
| `errors.ts` | Custom error classes for the portal |
| `page-auth.ts` | Server-side page authentication helpers |

### 4.3 Database Migrations

| File | Description |
|------|-------------|
| `migrations/001_meu_portal_schema.sql` | Initial D1 schema — users, projects, tasks, messages, payments, budgets, visual comments, audit logs, etc. |
| `migrations/002_drop_unused_portal_tables.sql` | Schema cleanup migration |

### 4.4 Scripts

| File | Description |
|------|-------------|
| `scripts/seed-portal.ts` | Seeds the in-memory store with development users |
| `scripts/write-portal-seed-sql.ts` | Generates SQL INSERT statements from seed data for D1 |

### 4.5 Tests

| File | Description |
|------|-------------|
| `tests/portal.test.ts` | Portal integration tests — auth flows, RBAC, project/task operations |

### 4.6 Public Assets

| Path | Description |
|------|-------------|
| `public/images/logo branco transparente.png` | White transparent logo (used in Navbar on dark backgrounds) |
| `public/images/logo preto transparente.png` | Black transparent logo (used in Footer on light backgrounds) |
| `public/images/logo com fundo.png` | Logo with background (used as favicon) |
| `public/images/portfolio/` | Portfolio project screenshots |
| `public/_headers` | Cloudflare Pages custom headers |

---

## 5. NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server (`node server.mjs --dev`) on port 3000 |
| `npm run build` | Production build via OpenNext for Cloudflare Workers |
| `npm run build:next` | Standard Next.js build with webpack |
| `npm start` | Start production server locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests with tsx (`tsx --test tests/*.test.ts`) |
| `npm run typecheck` | TypeScript type checking (`tsc --noEmit`) |
| `npm run seed:portal` | Seed portal with development users |
| `npm run seed:d1:sql` | Generate D1 seed SQL |
| `npm run preview` | Build and preview on Cloudflare Workers locally |
| `npm run deploy` | Build and deploy to Cloudflare Workers |
| `npm run upload` | Alias for deploy |

---

## 6. Environment Variables

Local development uses `.dev.vars` (Cloudflare Workers convention):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTJS_ENV` | Yes | Environment identifier (`development` / `production`) |
| `AUTH_SECRET` | Yes | Secret for signing auth tokens |
| `PASSWORD_RESET_SECRET` | Yes | Secret for password reset tokens |
| `EMAIL_API_KEY` | Yes | Email provider API key |
| `EMAIL_FROM` | Yes | Sender address (e.g., `Goosley <goosleytech@gmail.com>`) |
| `GMAIL_APP_PASSWORD` | Dev | Gmail app password for Nodemailer in local dev |
| `APP_URL` | Yes | Base URL of the application |
| `TURNSTILE_SECRET_KEY` | Yes | Cloudflare Turnstile server-side secret |
| `TURNSTILE_SITE_KEY` | Yes | Cloudflare Turnstile client-side key |
| `ENVIRONMENT` | Yes | Runtime environment flag |

Cloudflare bindings (in `wrangler.jsonc`): `DB` (D1), `ASSETS`, `WORKER_SELF_REFERENCE`, `IMAGES`.

---

## 7. Development Seed Users

All local seed users use password `Portal123!`:

| Email | Role |
|-------|------|
| `admin@goosley.local` | Admin |
| `cliente@goosley.local` | Client |
| `caetano@goosley.local` | Developer |
| `raul@goosley.local` | Developer |
| `rodrigo@goosley.local` | Developer |
| `rick@goosley.local` | Developer |

---

## 8. Conventions & Guidelines

### 8.1 Language
- All user-facing text is in **Brazilian Portuguese (pt-BR)**.
- Code comments, variable names, and commit messages can be in English.

### 8.2 Styling
- Use **Tailwind CSS v4** with the `@theme inline` directive and CSS custom properties defined in `globals.css`.
- Combine classes with the `cn()` utility from `src/lib/utils.ts`.
- Follow the dark-mode-first design system: black bg, white text, orange/indigo accents.

### 8.3 Components
- Client components must start with `"use client"`.
- Use `framer-motion` for all animations.
- Icons come from `lucide-react`.
- Image optimization uses `next/image` with Unsplash as the allowed remote pattern.

### 8.4 Portal Architecture
- The portal uses a service-layer pattern: `types.ts` → `store.ts` → `services.ts` → `http.ts`.
- The current persistence is an in-memory store (`store.ts`). The migration to Cloudflare D1 is in progress — the schema is defined in `migrations/`.
- All portal actions go through `services.ts` which enforces RBAC and audit logging.
- Portal pages do NOT use the public Navbar/Footer; they use `PortalShell.tsx`.

### 8.5 Security
- CSP, HSTS, X-Frame-Options, and other security headers are set in `next.config.ts`.
- Auth uses HttpOnly/SameSite session cookies.
- Password reset tokens are hashed, expiring, and single-use.
- All forms exposed to the public should integrate Cloudflare Turnstile.
- Rate limiting is applied to auth endpoints.

### 8.6 Deployment
- Production target is **Cloudflare Workers** via the OpenNext adapter.
- Build: `npm run build` → deploys with `wrangler deploy --no-autoconfig`.
- The worker entry point is `.open-next/worker.js` as configured in `wrangler.jsonc`.

### 8.7 Verification
Always verify changes with:
```bash
npm run typecheck
npm test
npm run build
```
