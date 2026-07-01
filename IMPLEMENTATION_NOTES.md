# Meu Portal Implementation Notes

## What Changed

- Public `/meu-portal` now shows only "Acompanhamento operacional Goosley." plus login, new-account, forgot-password, and reset-password access.
- Authenticated portal routes no longer render the commercial navbar/footer; they use a dedicated app shell with left sidebar navigation, top utility icons, theme toggle, profile shortcut, and logout.
- RBAC is centered on `admin`, `client`, and `developer`. Legacy internal "programmer" route/function names remain compatible, but seeded users and exposed roles use `developer`.
- Admin dashboard now greets with `Oi, Henrique` and removes "GodMode", "full control", and fixed full-name title copy.
- Client and developer dashboards now have role-specific sidebars and functional modules backed by protected route handlers.
- Developer users seeded: `caetano@goosley.local`, `raul@goosley.local`, `rodrigo@goosley.local`, and `rick@goosley.local`.
- Password reset now uses hashed, expiring, one-use tokens and an email delivery abstraction.
- Project records now support progress percentage, GitHub URL, staging URL, production URL, code status, and technical notes.
- Payments now include due dates and remain structured for later payment-provider integration.
- Budgets and estimate calculation were added for client budget requests.
- Security headers, CSP, HttpOnly/SameSite session cookies, input validation, rate limiting, audit logs, and server-side Turnstile verification hooks are in place.

## Cloudflare Direction

Current Cloudflare documentation distinguishes static Next.js on Pages from full-stack SSR/API Next.js on Workers. Because this portal uses authentication, route handlers, email verification, Turnstile validation, and future D1 persistence, the production target should be Cloudflare Workers with the OpenNext adapter. Static Cloudflare Pages is only appropriate for a static export of the public sales site.

Recommended Cloudflare mapping:

- Workers/OpenNext: Next.js runtime and route handlers.
- D1: relational portal data using `migrations/001_meu_portal_schema.sql` as the starting schema.
- KV: low-latency rate-limit counters, session metadata cache, feature flags.
- R2: client attachments, reference files, screenshots, invoices.
- Turnstile: login, registration, password recovery, and other abuse-prone forms. Server-side Siteverify validation is mandatory.
- Workers Logs and audit records: operational monitoring without logging secrets.
- Email provider via `EMAIL_API_KEY`: password recovery, account confirmation, notifications, and project updates.

## Local Seed Users

All local seed users use `Portal123!`.

- `admin@goosley.local`
- `cliente@goosley.local`
- `caetano@goosley.local`
- `raul@goosley.local`
- `rodrigo@goosley.local`
- `rick@goosley.local`

## Main Pages

- `/meu-portal`
- `/meu-portal/admin`
- `/meu-portal/client`
- `/meu-portal/developer`
- `/meu-portal/programmer` redirects to `/meu-portal/developer`

## Important Routes

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /auth/profile`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET|POST /client/budgets`
- `POST /client/estimate`
- `GET|PATCH /developer/projects/:projectId`
- `GET|PATCH /developer/tasks/:taskId`
- `GET|POST /developer/messages?projectId=:projectId`
- `GET|POST|PATCH /admin/projects`
- `GET|POST|PATCH /admin/payments`
- `GET|PATCH /admin/settings`
- `GET /admin/audit-logs`

## Required Environment Variables

- `DATABASE_URL` or Cloudflare D1 binding (`DB`) when persistence is moved from the local store.
- `AUTH_SECRET`
- `PASSWORD_RESET_SECRET`
- `EMAIL_API_KEY`
- `EMAIL_FROM`
- `APP_URL`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_SITE_KEY`
- `ENVIRONMENT`

## Verification

Run:

```bash
npm run typecheck
npm test
npm run build
```

## Current Persistence Note

The app still uses the existing in-memory TypeScript store for local development and tests. The service layer and migration file are structured so the next step can replace `src/server/portal/store.ts` with D1-backed repository functions without rewriting dashboard or route code.
