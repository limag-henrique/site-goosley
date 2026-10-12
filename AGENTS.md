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
- Email: henrique@goosley.com.br
- Website: https://goosley.com.br/

### 1.1 Services Offered

Goosley Digital offers six core service lines:

| Service | Route | Description |
|---------|-------|-------------|
| **Landing Pages** | `/landing-pages` | High-conversion, design-exclusive landing pages for lead capture |
| **E-commerce** | `/e-commerce` | Custom online stores with payment integration |
| **Automação** | `/automacoes` | Business process automation and AI voice tuning |
| **Sistemas web** | `/sistemas-web` | Full-stack web systems and backend architecture |
| **Analytics e BI** | `/analytics-dashboards-bi` | Business intelligence dashboards and data analytics |
| **Agentes de IA** | `/agentes-corporativos` | Enterprise AI agents for customer service, internal ops, etc. |

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
| Service pages | `src/app/landing-pages/`, `src/app/e-commerce/`, `src/app/automacoes/`, `src/app/sistemas-web/`, `src/app/analytics-dashboards-bi/`, `src/app/agentes-corporativos/` | Individual service detail pages |

All commercial pages use PublicChrome (Navbar, CustomCursor and Footer).

## Engineering conventions

Work on the current branch. A human decides when to commit and performs the commit action.

Use Matt Pocock skills: align meaningful changes with grilling, specify scope before building, prefer TDD for features and bug fixes, diagnose failures before proposing fixes, and periodically review module boundaries.

Read relevant Next.js guides in `node_modules/next/dist/docs/` before editing framework code.

User-facing text is pt-BR. Use the existing dark visual identity, Tailwind v4, `cn()`, Framer Motion and Lucide icons. Respect reduced motion, visible keyboard focus and mobile touch targets.

The commercial site includes services, portfolio, contact, quiz and the project estimator. Contact delivery lives in `src/server/contact/email.ts`. Its email provider configuration is independent of the facial experience.

The `/criminalidadefacial` experience and its APIs use their own immersive presentation and backend. Preserve this integration during commercial-site changes.

Deploy to Cloudflare Workers using OpenNext. Consult `package.json` and `wrangler.jsonc` for current commands and bindings. Local configuration uses `.dev.vars`.

Verify changes with `npm run typecheck`, `npm test`, and `npm run build`. When Graphify is available or `graphify-out/` exists, run `graphify update .` after substantial exploration or code changes. Graph output stays local unless a human decides otherwise.
