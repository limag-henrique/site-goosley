import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { toErrorResponse } from "./errors";
import { checkRateLimit, clearSessionCookie, getClientIp, SESSION_COOKIE_NAME, setSessionCookie, verifyTurnstileToken } from "./security";
import { withPortalPersistence } from "./store";
import {
  adminDashboard,
  assignProgrammer,
  convertVisualCommentToTask,
  createClientRequest,
  createBudgetRequest,
  createPayment,
  createProgrammer,
  createProject,
  createProjectMessage,
  createTask,
  createVisualComment,
  destroySession,
  findUserBySession,
  getClientProject,
  getEarningsForProject,
  getMessages,
  getNotifications,
  getSettings,
  listAuditLogs,
  listBudgetsForActor,
  listClientProjects,
  listGithubMetrics,
  listPaymentsForActor,
  listPayoutRequests,
  listProgrammerDashboard,
  listProgrammerEarnings,
  listProgrammerProjects,
  listProjectTasksForActor,
  listProjectUpdates,
  listTimeEntries,
  listUsers,
  listVisualComments,
  login,
  realtimeSnapshot,
  recalculateEarnings,
  registerClient,
  requestPasswordReset,
  removeProgrammer,
  requestPayout,
  requireActor,
  syncGithubRepository,
  toSafeUser,
  updateAdminTask,
  updateEarning,
  updateGithubMetric,
  updateOwnProfile,
  updatePayment,
  updatePayoutRequest,
  updateProgrammerRateApproval,
  updateProject,
  updateProgrammerTask,
  updateSettings,
  updateUser,
  resetPassword,
  estimateBudget,
} from "./services";

export async function parseJson(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") {
    return {};
  }

  const text = await request.text();
  if (!text) {
    return {};
  }

  return JSON.parse(text) as unknown;
}

export function actorFromRequest(request: NextRequest) {
  const user = findUserBySession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  return requireActor(user, {
    ipAddress: getClientIp(request),
    userAgent: request.headers.get("user-agent") || undefined,
  });
}

export async function handleAuth(request: NextRequest, segments: string[]) {
  return withPortalPersistence(async () => {
    try {
    const action = segments[0] || "me";
    const ip = getClientIp(request);
    if (["login", "register", "invite-programmer", "forgot-password", "reset-password"].includes(action)) {
      const rate = checkRateLimit(`auth:${action}:${ip}`, 12, 60_000);
      if (!rate.allowed) {
        return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Rate limit exceeded" } }, { status: 429 });
      }
    }

    if (request.method === "GET" && action === "me") {
      const actor = actorFromRequest(request);
      return NextResponse.json({ user: toSafeUser(actor.user), redirectTo: roleRedirect(actor.user.role) });
    }

    if (request.method === "POST" && action === "register") {
      const payload = await parseJson(request);
      if (!(await verifyTurnstileFromPayload(payload, ip))) {
        return NextResponse.json({ error: { code: "TURNSTILE_FAILED", message: "Security challenge failed" } }, { status: 403 });
      }
      const user = registerClient(payload);
      return NextResponse.json({ user, redirectTo: "/meu-portal/client" }, { status: 201 });
    }

    if (request.method === "POST" && action === "login") {
      const payload = await parseJson(request);
      if (!(await verifyTurnstileFromPayload(payload, ip))) {
        return NextResponse.json({ error: { code: "TURNSTILE_FAILED", message: "Security challenge failed" } }, { status: 403 });
      }
      const result = login(payload);
      const response = NextResponse.json({ user: result.user, redirectTo: result.redirectTo });
      setSessionCookie(response, result.session.id, result.session.expiresAt);
      return response;
    }

    if (request.method === "POST" && action === "logout") {
      destroySession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
      const response = NextResponse.json({ ok: true });
      clearSessionCookie(response);
      return response;
    }

    if (request.method === "PATCH" && action === "profile") {
      const actor = actorFromRequest(request);
      return NextResponse.json({ user: updateOwnProfile(actor, await parseJson(request)) });
    }

    if (request.method === "POST" && action === "forgot-password") {
      const payload = await parseJson(request);
      if (!(await verifyTurnstileFromPayload(payload, ip))) {
        return NextResponse.json({ error: { code: "TURNSTILE_FAILED", message: "Security challenge failed" } }, { status: 403 });
      }
      return NextResponse.json(await requestPasswordReset(payload, process.env.APP_URL));
    }

    if (request.method === "POST" && action === "reset-password") {
      const payload = await parseJson(request);
      if (!(await verifyTurnstileFromPayload(payload, ip))) {
        return NextResponse.json({ error: { code: "TURNSTILE_FAILED", message: "Security challenge failed" } }, { status: 403 });
      }
      return NextResponse.json(resetPassword(payload));
    }

    if (request.method === "POST" && action === "invite-programmer") {
      const actor = actorFromRequest(request);
      return NextResponse.json({ user: createProgrammer(actor, await parseJson(request)) }, { status: 201 });
    }

    return notFound();
    } catch (error) {
      return toErrorResponse(error);
    }
  }, { persist: shouldPersistPortalRequest(request) });
}

export async function handleClient(request: NextRequest, segments: string[]) {
  return withPortalPersistence(async () => {
    try {
    const actor = actorFromRequest(request);
    const projectId = segments[1];

    if (request.method === "GET" && segments[0] === "projects" && segments.length === 1) {
      return NextResponse.json({ projects: listClientProjects(actor) });
    }

    if (segments[0] === "projects" && projectId && segments.length === 2 && request.method === "GET") {
      return NextResponse.json({ project: getClientProject(actor, projectId) });
    }

    if (segments[0] === "projects" && projectId && segments[2] === "updates" && request.method === "GET") {
      return NextResponse.json({ updates: listProjectUpdates(actor, projectId) });
    }

    if (segments[0] === "projects" && projectId && segments[2] === "tasks" && request.method === "GET") {
      return NextResponse.json({ tasks: listProjectTasksForActor(actor, projectId) });
    }

    if (segments[0] === "projects" && projectId && segments[2] === "payments" && request.method === "GET") {
      return NextResponse.json({ payments: listPaymentsForActor(actor, projectId) });
    }

    if (segments[0] === "projects" && projectId && segments[2] === "messages") {
      if (request.method === "GET") return NextResponse.json(getMessages(actor, projectId));
      if (request.method === "POST") return NextResponse.json({ message: createProjectMessage(actor, projectId, await parseJson(request)) }, { status: 201 });
    }

    if (segments[0] === "projects" && projectId && segments[2] === "requests" && request.method === "POST") {
      return NextResponse.json({ task: createClientRequest(actor, projectId, await parseJson(request)) }, { status: 201 });
    }

    if (segments[0] === "projects" && projectId && segments[2] === "visual-comments") {
      if (request.method === "GET") return NextResponse.json({ visualComments: listVisualComments(actor, projectId) });
      if (request.method === "POST") return NextResponse.json({ visualComment: createVisualComment(actor, projectId, await parseJson(request)) }, { status: 201 });
    }

    if (segments[0] === "notifications" && request.method === "GET") {
      return NextResponse.json({ notifications: getNotifications(actor) });
    }

    if (segments[0] === "budgets") {
      if (request.method === "GET") return NextResponse.json({ budgets: listBudgetsForActor(actor) });
      if (request.method === "POST") return NextResponse.json({ budget: createBudgetRequest(actor, await parseJson(request)) }, { status: 201 });
    }

    if (segments[0] === "estimate" && request.method === "POST") {
      return NextResponse.json(estimateBudget(await parseJson(request)));
    }

    if (segments[0] === "realtime" && request.method === "GET") {
      return NextResponse.json(realtimeSnapshot(actor));
    }

    return notFound();
    } catch (error) {
      return toErrorResponse(error);
    }
  }, { persist: shouldPersistPortalRequest(request) });
}

export async function handleProgrammer(request: NextRequest, segments: string[]) {
  return withPortalPersistence(async () => {
    try {
    const actor = actorFromRequest(request);

    if (segments[0] === "dashboard" && request.method === "GET") return NextResponse.json(listProgrammerDashboard(actor));
    if (segments[0] === "projects" && request.method === "GET") return NextResponse.json({ projects: listProgrammerProjects(actor) });
    if (segments[0] === "projects" && segments[1] && request.method === "PATCH") return NextResponse.json({ project: updateProject(actor, segments[1], await parseJson(request)) });
    if (segments[0] === "tasks" && segments.length === 1 && request.method === "GET") return NextResponse.json({ tasks: listProjectTasksForActor(actor) });
    if (segments[0] === "tasks" && segments[1] && request.method === "PATCH") {
      return NextResponse.json({ task: updateProgrammerTask(actor, segments[1], await parseJson(request)) });
    }
    if (segments[0] === "earnings" && request.method === "GET") return NextResponse.json({ earnings: listProgrammerEarnings(actor) });
    if (segments[0] === "time-entries" && segments.length === 1 && request.method === "GET") return NextResponse.json({ timeEntries: listTimeEntries(actor) });
    if (segments[0] === "time-entries" && segments[1] === "start" && request.method === "POST") {
      const { startTimeEntry } = await import("./services");
      return NextResponse.json({ timeEntry: startTimeEntry(actor, await parseJson(request)) }, { status: 201 });
    }
    if (segments[0] === "time-entries" && segments[1] && segments[2] === "stop" && request.method === "POST") {
      const { stopTimeEntry } = await import("./services");
      return NextResponse.json({ timeEntry: stopTimeEntry(actor, segments[1], await parseJson(request)) });
    }
    if (segments[0] === "payout-requests" && request.method === "POST") return NextResponse.json({ payoutRequest: requestPayout(actor, await parseJson(request)) }, { status: 201 });
    if (segments[0] === "messages" && request.method === "GET") return NextResponse.json(getMessages(actor));
    if (segments[0] === "messages" && request.method === "POST") {
      const projectId = new URL(request.url).searchParams.get("projectId");
      if (!projectId) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "projectId query parameter is required" } }, { status: 422 });
      return NextResponse.json({ message: createProjectMessage(actor, projectId, await parseJson(request)) }, { status: 201 });
    }
    if (segments[0] === "notifications" && request.method === "GET") return NextResponse.json({ notifications: getNotifications(actor) });
    if (segments[0] === "realtime" && request.method === "GET") return NextResponse.json(realtimeSnapshot(actor));

    return notFound();
    } catch (error) {
      return toErrorResponse(error);
    }
  }, { persist: shouldPersistPortalRequest(request) });
}

export async function handleAdmin(request: NextRequest, segments: string[]) {
  return withPortalPersistence(async () => {
    try {
    const actor = actorFromRequest(request);
    const body = async () => parseJson(request);

    if (segments.length === 0 && request.method === "GET") return NextResponse.json(adminDashboard(actor));
    if (segments[0] === "users" && segments.length === 1 && request.method === "GET") {
      return NextResponse.json({ users: listUsers(actor, new URL(request.url).searchParams.get("search") || undefined) });
    }
    if (segments[0] === "users" && segments[1] === "programmers" && request.method === "POST") return NextResponse.json({ user: createProgrammer(actor, await body()) }, { status: 201 });
    if (segments[0] === "users" && segments[1] && segments[2] === "programmer-profile" && request.method === "PATCH") {
      return NextResponse.json({ programmerProfile: updateProgrammerRateApproval(actor, segments[1], await body()) });
    }
    if (segments[0] === "users" && segments[1] && request.method === "PATCH") return NextResponse.json({ user: updateUser(actor, segments[1], await body()) });

    if (segments[0] === "projects" && segments.length === 1 && request.method === "GET") return NextResponse.json({ projects: listClientProjects(actor) });
    if (segments[0] === "projects" && segments.length === 1 && request.method === "POST") return NextResponse.json({ project: createProject(actor, await body()) }, { status: 201 });
    if (segments[0] === "projects" && segments[1] && segments.length === 2 && request.method === "PATCH") return NextResponse.json({ project: updateProject(actor, segments[1], await body()) });
    if (segments[0] === "projects" && segments[1] && segments[2] === "programmers" && request.method === "POST") {
      return NextResponse.json({ member: assignProgrammer(actor, segments[1], await body()) }, { status: 201 });
    }
    if (segments[0] === "projects" && segments[1] && segments[2] === "programmers" && segments[3] && request.method === "DELETE") {
      return NextResponse.json(removeProgrammer(actor, segments[1], segments[3]));
    }

    if (segments[0] === "tasks" && segments.length === 1 && request.method === "GET") return NextResponse.json({ tasks: listProjectTasksForActor(actor) });
    if (segments[0] === "tasks" && segments.length === 1 && request.method === "POST") return NextResponse.json({ task: createTask(actor, await body()) }, { status: 201 });
    if (segments[0] === "tasks" && segments[1] && request.method === "PATCH") return NextResponse.json({ task: updateAdminTask(actor, segments[1], await body()) });
    if (segments[0] === "visual-comments" && segments[1] && segments[2] === "convert-to-task" && request.method === "POST") {
      return NextResponse.json(convertVisualCommentToTask(actor, segments[1], await body()), { status: 201 });
    }

    if (segments[0] === "messages" && request.method === "GET") return NextResponse.json(getMessages(actor));
    if (segments[0] === "messages" && request.method === "POST") {
      const projectId = new URL(request.url).searchParams.get("projectId");
      if (!projectId) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "projectId query parameter is required" } }, { status: 422 });
      return NextResponse.json({ message: createProjectMessage(actor, projectId, await body()) }, { status: 201 });
    }
    if (segments[0] === "broadcasts" && request.method === "POST") {
      return NextResponse.json({ message: createProjectMessage(actor, "prj_goosley", await body()) }, { status: 201 });
    }

    if (segments[0] === "payments" && segments.length === 1 && request.method === "GET") return NextResponse.json({ payments: listPaymentsForActor(actor) });
    if (segments[0] === "payments" && segments.length === 1 && request.method === "POST") return NextResponse.json({ payment: createPayment(actor, await body()) }, { status: 201 });
    if (segments[0] === "payments" && segments[1] && request.method === "PATCH") return NextResponse.json({ payment: updatePayment(actor, segments[1], await body()) });

    if (segments[0] === "earnings" && segments[1] === "projects" && segments[2] && segments.length === 3 && request.method === "GET") {
      return NextResponse.json(getEarningsForProject(actor, segments[2]));
    }
    if (segments[0] === "earnings" && segments[1] === "projects" && segments[2] && segments[3] === "recalculate" && request.method === "POST") {
      return NextResponse.json(recalculateEarnings(actor, segments[2], await body()));
    }
    if (segments[0] === "earnings" && segments[1] && request.method === "PATCH") return NextResponse.json({ earning: updateEarning(actor, segments[1], await body()) });

    if (segments[0] === "payout-requests" && segments.length === 1 && request.method === "GET") return NextResponse.json({ payoutRequests: listPayoutRequests(actor) });
    if (segments[0] === "payout-requests" && segments[1] && request.method === "PATCH") return NextResponse.json({ payoutRequest: updatePayoutRequest(actor, segments[1], await body()) });

    if (segments[0] === "github" && segments[1] === "projects" && segments[2] && segments[3] === "sync" && request.method === "POST") {
      return NextResponse.json(syncGithubRepository(actor, segments[2], await body()));
    }
    if (segments[0] === "github" && segments[1] === "projects" && segments[2] && segments[3] === "metrics" && request.method === "GET") {
      return NextResponse.json({ metrics: listGithubMetrics(actor, segments[2]) });
    }
    if (segments[0] === "github" && segments[1] === "metrics" && segments[2] && request.method === "PATCH") {
      return NextResponse.json({ metric: updateGithubMetric(actor, segments[2], await body()) });
    }

    if (segments[0] === "audit-logs" && request.method === "GET") return NextResponse.json({ auditLogs: listAuditLogs(actor) });
    if (segments[0] === "budgets" && request.method === "GET") return NextResponse.json({ budgets: listBudgetsForActor(actor) });
    if (segments[0] === "settings" && request.method === "GET") return NextResponse.json({ settings: getSettings(actor) });
    if (segments[0] === "settings" && request.method === "PATCH") return NextResponse.json({ settings: updateSettings(actor, await body()) });
    if (segments[0] === "notifications" && request.method === "GET") return NextResponse.json({ notifications: getNotifications(actor) });
    if (segments[0] === "realtime" && request.method === "GET") return NextResponse.json(realtimeSnapshot(actor));

    return notFound();
    } catch (error) {
      return toErrorResponse(error);
    }
  }, { persist: shouldPersistPortalRequest(request) });
}

function roleRedirect(role: string) {
  if (role === "admin") return "/meu-portal/admin";
  if (role === "developer" || role === "programmer") return "/meu-portal/developer";
  return "/meu-portal/client";
}

async function verifyTurnstileFromPayload(payload: unknown, ip: string) {
  const body = payload && typeof payload === "object" && !Array.isArray(payload) ? (payload as Record<string, unknown>) : {};
  const token = typeof body.turnstileToken === "string" ? body.turnstileToken : undefined;
  return verifyTurnstileToken(token, ip);
}

function notFound() {
  return NextResponse.json({ error: { code: "NOT_FOUND", message: "Route not found" } }, { status: 404 });
}

function shouldPersistPortalRequest(request: NextRequest) {
  return !["GET", "HEAD", "OPTIONS"].includes(request.method);
}
