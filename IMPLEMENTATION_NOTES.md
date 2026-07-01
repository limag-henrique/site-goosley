# Meu Portal Implementation Notes

## Architecture Decisions

- The existing app is a Next.js 16 App Router project with no backend layer, so the portal was added as a Backend-for-Frontend using App Router `route.ts` handlers.
- Business logic lives in `src/server/portal/*`; route handlers only dispatch, authenticate, validate, and format responses.
- The current persistence layer is a seeded local development store. It is suitable for local demos and tests, not production multi-instance hosting.
- Passwords are hashed with Node `scrypt`; sessions are server-side records referenced by HTTP-only cookies.
- Money is stored as integer cents.
- RBAC is centralized in `requireActor`, `requireRole`, and project ownership/member checks.
- Earnings calculation is centralized in `recalculateEarnings`.
- GitHub repository parsing and ignored-file logic are centralized in portal services.

## Assumptions

- Public registration creates `client` users only.
- Programmers and admins are created or promoted only through admin routes.
- Default revenue split is 50% tax/fees, 25% Henrique Lima Gusmao, and 25% programmer pool.
- GitHub effective LOC is a default signal, not the only source of truth.
- Admin overrides require a reason and create audit logs.

## Local Seed Users

All local seed users use `Portal123!`.

- `admin@goosley.local`
- `cliente@goosley.local`
- `programador@goosley.local`

## New Pages

- `/meu-portal`
- `/meu-portal/client`
- `/meu-portal/programmer`
- `/meu-portal/admin`

## New Routes

Authentication:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/invite-programmer`

Client:

- `GET /client/projects`
- `GET /client/projects/:projectId`
- `GET /client/projects/:projectId/updates`
- `GET /client/projects/:projectId/tasks`
- `GET /client/projects/:projectId/payments`
- `GET /client/projects/:projectId/messages`
- `POST /client/projects/:projectId/messages`
- `POST /client/projects/:projectId/requests`
- `GET /client/projects/:projectId/visual-comments`
- `POST /client/projects/:projectId/visual-comments`
- `GET /client/realtime`

Programmer:

- `GET /programmer/dashboard`
- `GET /programmer/tasks`
- `PATCH /programmer/tasks/:taskId`
- `GET /programmer/projects`
- `GET /programmer/earnings`
- `GET /programmer/time-entries`
- `POST /programmer/time-entries/start`
- `POST /programmer/time-entries/:timeEntryId/stop`
- `POST /programmer/payout-requests`
- `GET /programmer/messages`
- `POST /programmer/messages?projectId=:projectId`
- `GET /programmer/realtime`

Admin:

- `GET /admin/users`
- `POST /admin/users/programmers`
- `PATCH /admin/users/:userId`
- `GET /admin/projects`
- `POST /admin/projects`
- `PATCH /admin/projects/:projectId`
- `POST /admin/projects/:projectId/programmers`
- `DELETE /admin/projects/:projectId/programmers/:programmerId`
- `GET /admin/tasks`
- `POST /admin/tasks`
- `PATCH /admin/tasks/:taskId`
- `POST /admin/visual-comments/:visualCommentId/convert-to-task`
- `GET /admin/messages`
- `POST /admin/messages?projectId=:projectId`
- `POST /admin/broadcasts`
- `GET /admin/payments`
- `POST /admin/payments`
- `PATCH /admin/payments/:paymentId`
- `GET /admin/earnings/projects/:projectId`
- `POST /admin/earnings/projects/:projectId/recalculate`
- `PATCH /admin/earnings/:earningId`
- `GET /admin/payout-requests`
- `PATCH /admin/payout-requests/:payoutRequestId`
- `POST /admin/github/projects/:projectId/sync`
- `GET /admin/github/projects/:projectId/metrics`
- `PATCH /admin/github/metrics/:metricId`
- `GET /admin/audit-logs`
- `GET /admin/settings`
- `PATCH /admin/settings`
- `GET /admin/realtime`

## Models

Typed models live in `src/server/portal/types.ts` and cover users, profiles, projects, members, tasks, updates, conversations, messages, visual comments, time entries, GitHub repositories and metrics, payments, earnings calculations, programmer earnings, payouts, settings, audit logs, notifications, and sessions.

## Migrations And Seeds

- Draft schema: `migrations/001_meu_portal_schema.sql`
- Current local seed data is created by `src/server/portal/store.ts`.
- Local seed preview script: `npm run seed:portal`
- For production, replace the local store with Postgres, MySQL, or another transactional database, then map the service layer to repository functions.

## Environment Variables

No required secrets were introduced for the local implementation. Production should add:

- `SESSION_SECRET`
- `DATABASE_URL`
- `GITHUB_TOKEN`
- payment provider secrets
- email provider secrets for invite and reset flows

## Testing

Run:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Pending Future Improvements

- Replace the local seeded store with real migrations and transactional persistence.
- Add durable database-backed sessions.
- Add password reset emails and invite emails.
- Replace near-real-time polling snapshots with SSE or WebSocket channels.
- Add real GitHub API/webhook sync using credentials.
- Add real payment provider webhooks.
- Add admin CRUD screens for every route; the backend endpoints are already present.
