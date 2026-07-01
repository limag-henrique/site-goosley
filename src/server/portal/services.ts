import type {
  AuditLog,
  EarningStatus,
  GitHubCommitMetric,
  Notification,
  ProgrammerEarning,
  Project,
  RequestActor,
  Task,
  TimeEntry,
  User,
  UserRole,
  VisualComment,
} from "./types";
import { ForbiddenError, NotFoundError, PortalError, UnauthorizedError } from "./errors";
import { getDb } from "./store";
import { addDays, createId, createSecureToken, hashPassword, hashToken, nowIso, verifyPassword } from "./security";
import { sendPasswordResetEmail } from "./email";
import {
  asRecord,
  emailField,
  enumField,
  integerCents,
  numberField,
  optionalStringArray,
  safeJsonRecord,
  stringField,
} from "./validation";

const userStatuses = ["active", "invited", "suspended", "disabled"] as const;
const taskStatuses = ["todo", "in_progress", "review", "done", "rejected", "cancelled"] as const;
const paymentStatuses = ["pending", "paid", "verified", "failed", "refunded", "cancelled"] as const;
const payoutStatuses = ["requested", "approved", "rejected", "paid", "cancelled"] as const;
const earningStatuses = ["pending", "available", "payout_requested", "paid", "cancelled"] as const;
const userRoles = ["client", "developer", "admin"] as const;

export type SafeUser = Omit<User, "passwordHash">;

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    themePreference: user.themePreference,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
}

function isDeveloperRole(role: UserRole | string) {
  return role === "developer" || role === "programmer";
}

function roleAllowed(role: UserRole, roles: UserRole[]) {
  return roles.includes(role) || (isDeveloperRole(role) && roles.some(isDeveloperRole));
}

function isActive(user: User) {
  return user.status === "active" || user.status === "invited";
}

export function findUserBySession(sessionId?: string) {
  if (!sessionId) {
    return undefined;
  }

  const db = getDb();
  const session = db.sessions.find((item) => item.id === sessionId && new Date(item.expiresAt).getTime() > Date.now());
  if (!session) {
    return undefined;
  }

  return db.users.find((user) => user.id === session.userId && isActive(user));
}

export function requireActor(user?: User, meta: Pick<RequestActor, "ipAddress" | "userAgent"> = {}): RequestActor {
  if (!user) {
    throw new UnauthorizedError();
  }

  return { user, ...meta };
}

export function requireRole(actor: RequestActor, roles: UserRole[]) {
  if (!roleAllowed(actor.user.role, roles)) {
    throw new ForbiddenError(`Requires role: ${roles.join(" or ")}`);
  }
}

export function createSession(userId: string) {
  const db = getDb();
  const createdAt = nowIso();
  const expiresAt = addDays(new Date(), 7).toISOString();
  const session = {
    id: createId("ses"),
    userId,
    createdAt,
    expiresAt,
  };

  db.sessions.push(session);
  return session;
}

export function destroySession(sessionId?: string) {
  if (!sessionId) {
    return;
  }

  const db = getDb();
  db.sessions = db.sessions.filter((session) => session.id !== sessionId);
}

export function registerClient(payload: unknown) {
  const body = asRecord(payload);
  const name = stringField(body, "name", { min: 2, max: 120 });
  const email = emailField(body);
  const password = stringField(body, "password", { min: 8, max: 200 });
  const requestedRole = body.role;

  if (requestedRole && requestedRole !== "client") {
    throw new ForbiddenError("Public registration can only create client accounts.");
  }

  const db = getDb();
  if (db.users.some((user) => user.email.toLowerCase() === email)) {
    throw new PortalError("Email already registered", 409, "EMAIL_EXISTS");
  }

  const timestamp = nowIso();
  const user: User = {
    id: createId("usr"),
    name,
    email,
    passwordHash: hashPassword(password),
    role: "client",
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.users.push(user);
  db.clientProfiles.push({ userId: user.id });
  logAudit({ actorUserId: user.id, action: "auth.registered_client", entityType: "user", entityId: user.id, after: toSafeUser(user) });
  return toSafeUser(user);
}

export function login(payload: unknown) {
  const body = asRecord(payload);
  const email = emailField(body);
  const password = stringField(body, "password", { min: 1, max: 200 });
  const db = getDb();
  const user = db.users.find((item) => item.email.toLowerCase() === email);

  if (!user || !isActive(user) || !verifyPassword(password, user.passwordHash)) {
    throw new UnauthorizedError("Invalid email or password");
  }

  user.lastLoginAt = nowIso();
  user.updatedAt = user.lastLoginAt;
  const session = createSession(user.id);

  return {
    user: toSafeUser(user),
    session,
    redirectTo: getRoleHome(user.role),
  };
}

export async function requestPasswordReset(payload: unknown, appUrl = process.env.APP_URL || "http://localhost:3000") {
  const body = asRecord(payload);
  const email = emailField(body);
  const db = getDb();
  const user = db.users.find((item) => item.email.toLowerCase() === email);

  if (!user || !isActive(user)) {
    return { ok: true };
  }

  const token = createSecureToken();
  const timestamp = nowIso();
  db.passwordResetTokens.push({
    id: createId("prt"),
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    createdAt: timestamp,
  });

  const resetUrl = `${appUrl.replace(/\/$/, "")}/meu-portal?resetToken=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  await sendPasswordResetEmail(email, resetUrl);
  logAudit({ actorUserId: user.id, action: "auth.password_reset_requested", entityType: "user", entityId: user.id });
  return { ok: true };
}

export function resetPassword(payload: unknown) {
  const body = asRecord(payload);
  const email = emailField(body);
  const token = stringField(body, "token", { min: 20, max: 300 });
  const password = stringField(body, "password", { min: 8, max: 200 });
  const db = getDb();
  const user = db.users.find((item) => item.email.toLowerCase() === email);

  if (!user) {
    throw new UnauthorizedError("Invalid or expired reset token");
  }

  const tokenHash = hashToken(token);
  const resetToken = db.passwordResetTokens.find(
    (item) => item.userId === user.id && item.tokenHash === tokenHash && !item.usedAt && new Date(item.expiresAt).getTime() > Date.now()
  );

  if (!resetToken) {
    throw new UnauthorizedError("Invalid or expired reset token");
  }

  user.passwordHash = hashPassword(password);
  user.updatedAt = nowIso();
  resetToken.usedAt = user.updatedAt;
  destroyUserSessions(user.id);
  logAudit({ actorUserId: user.id, action: "auth.password_reset_completed", entityType: "user", entityId: user.id });
  return { ok: true };
}

export function updateOwnProfile(actor: RequestActor, payload: unknown) {
  const body = asRecord(payload);
  const db = getDb();
  const user = findById(db.users, actor.user.id, "User");
  const before = toSafeUser(user);
  const name = stringField(body, "name", { optional: true, min: 2, max: 120 });
  const avatar = stringField(body, "avatar", { optional: true, max: 1000 });
  const themePreference = enumField(body, "themePreference", ["light", "dark", "system"] as const, { optional: true });
  const currentPassword = stringField(body, "currentPassword", { optional: true, min: 1, max: 200 });
  const newPassword = stringField(body, "newPassword", { optional: true, min: 8, max: 200 });

  if (name) user.name = name;
  if (avatar) user.avatar = avatar;
  if (themePreference) user.themePreference = themePreference;
  if (newPassword) {
    if (!currentPassword || !verifyPassword(currentPassword, user.passwordHash)) {
      throw new UnauthorizedError("Current password is invalid");
    }
    user.passwordHash = hashPassword(newPassword);
  }
  user.updatedAt = nowIso();
  logAudit({ actorUserId: actor.user.id, action: "user.updated_profile", entityType: "user", entityId: user.id, before, after: toSafeUser(user), actor });
  return toSafeUser(user);
}

export function getRoleHome(role: UserRole) {
  if (role === "admin") return "/meu-portal/admin";
  if (isDeveloperRole(role)) return "/meu-portal/developer";
  return "/meu-portal/client";
}

function destroyUserSessions(userId: string) {
  const db = getDb();
  db.sessions = db.sessions.filter((session) => session.userId !== userId);
}

export function createProgrammer(actor: RequestActor, payload: unknown) {
  requireRole(actor, ["admin"]);
  const body = asRecord(payload);
  const name = stringField(body, "name", { min: 2, max: 120 });
  const email = emailField(body);
  const password = stringField(body, "password", { min: 8, max: 200 });
  const db = getDb();

  if (db.users.some((user) => user.email.toLowerCase() === email)) {
    throw new PortalError("Email already registered", 409, "EMAIL_EXISTS");
  }

  const timestamp = nowIso();
  const user: User = {
    id: createId("usr"),
    name,
    email,
    passwordHash: hashPassword(password),
    role: "developer",
    themePreference: "dark",
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.users.push(user);
  db.programmerProfiles.push({
    userId: user.id,
    displayName: stringField(body, "displayName", { optional: true }) || name,
    skills: optionalStringArray(body, "skills"),
    githubUsername: stringField(body, "githubUsername", { optional: true }),
    hourlyReferenceRateCents: integerCents(body, "hourlyReferenceRateCents", { optional: true, min: 0 }) || 0,
    payoutInfo: safeJsonRecord(body.payoutInfo),
    status: "active",
    notes: stringField(body, "notes", { optional: true }),
  });

  logAudit({ actorUserId: actor.user.id, action: "admin.created_programmer", entityType: "user", entityId: user.id, after: toSafeUser(user), actor });
  notify(user.id, "account.created", "Conta de desenvolvedor criada", "Seu acesso ao Meu Portal foi criado.", "/meu-portal/developer");
  return toSafeUser(user);
}

export function updateProgrammerRateApproval(actor: RequestActor, programmerId: string, payload: unknown) {
  requireRole(actor, ["admin"]);
  const body = asRecord(payload);
  const db = getDb();
  const user = findById(db.users, programmerId, "Developer");
  if (!isDeveloperRole(user.role)) throw new PortalError("User must be a developer.", 422, "INVALID_DEVELOPER");

  let profile = db.programmerProfiles.find((item) => item.userId === programmerId);
  if (!profile) {
    profile = {
      userId: programmerId,
      displayName: user.name,
      skills: [],
      hourlyReferenceRateCents: 0,
      status: user.status,
    };
    db.programmerProfiles.push(profile);
  }

  const before = { ...profile };
  const hourlyReferenceRateCents = integerCents(body, "hourlyReferenceRateCents", { optional: true, min: 0 });
  const approveRate = typeof body.approveRate === "boolean" ? body.approveRate : String(body.approveRate || "") === "true";
  const revokeRate = typeof body.revokeRate === "boolean" ? body.revokeRate : String(body.revokeRate || "") === "true";

  if (hourlyReferenceRateCents != null) profile.hourlyReferenceRateCents = hourlyReferenceRateCents;
  profile.notes = stringField(body, "notes", { optional: true, max: 1000 }) || profile.notes;
  if (approveRate) {
    profile.hourlyRateApprovedAt = nowIso();
    profile.hourlyRateApprovedByAdminId = actor.user.id;
  }
  if (revokeRate) {
    delete profile.hourlyRateApprovedAt;
    delete profile.hourlyRateApprovedByAdminId;
  }

  logAudit({ actorUserId: actor.user.id, action: "admin.updated_programmer_rate", entityType: "programmerProfile", entityId: programmerId, before, after: profile, actor });
  notify(programmerId, "rate.updated", "Valor/hora atualizado", profile.hourlyRateApprovedAt ? "Seu valor/hora foi aprovado." : "Seu valor/hora aguarda aprovacao.", "/meu-portal/developer/profile");
  return profile;
}

export function updateUser(actor: RequestActor, userId: string, payload: unknown) {
  requireRole(actor, ["admin"]);
  const body = asRecord(payload);
  const db = getDb();
  const user = findById(db.users, userId, "User");
  const before = toSafeUser(user);

  const status = enumField(body, "status", userStatuses, { optional: true });
  const role = enumField(body, "role", userRoles, { optional: true });
  const name = stringField(body, "name", { optional: true, min: 2, max: 120 });

  if (status) user.status = status;
  if (role) user.role = role;
  if (name) user.name = name;
  user.updatedAt = nowIso();

  logAudit({ actorUserId: actor.user.id, action: "admin.updated_user", entityType: "user", entityId: user.id, before, after: toSafeUser(user), actor });
  return toSafeUser(user);
}

export function listUsers(actor: RequestActor, search?: string) {
  requireRole(actor, ["admin"]);
  const query = search?.toLowerCase();
  return getDb().users
    .filter((user) => !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query) || user.role.includes(query))
    .map(toSafeUser);
}

export function listClientProjects(actor: RequestActor) {
  requireRole(actor, ["client", "admin"]);
  const db = getDb();
  const projects = actor.user.role === "admin" ? db.projects : db.projects.filter((project) => project.clientId === actor.user.id);
  return projects.map((project) => projectDto(project, actor));
}

export function getClientProject(actor: RequestActor, projectId: string) {
  const db = getDb();
  const project = findProjectForActor(actor, projectId);
  return {
    ...projectDto(project, actor),
    updates: db.projectUpdates.filter((update) => update.projectId === project.id && (actor.user.role !== "client" || update.visibleToClient)),
    tasks: listProjectTasksForActor(actor, project.id),
    repositories: db.githubRepositories.filter((repository) => repository.projectId === project.id),
  };
}

export function listProjectUpdates(actor: RequestActor, projectId: string) {
  const db = getDb();
  findProjectForActor(actor, projectId);
  return db.projectUpdates.filter((update) => update.projectId === projectId && (actor.user.role !== "client" || update.visibleToClient));
}

export function listProjectTasksForActor(actor: RequestActor, projectId?: string) {
  const db = getDb();
  let tasks = db.tasks;
  if (projectId) {
    findProjectForActor(actor, projectId);
    tasks = tasks.filter((task) => task.projectId === projectId);
  }

  if (actor.user.role === "client") {
    const clientProjectIds = db.projects.filter((project) => project.clientId === actor.user.id).map((project) => project.id);
    tasks = tasks.filter((task) => clientProjectIds.includes(task.projectId));
  }

  if (isDeveloperRole(actor.user.role)) {
    tasks = tasks.filter((task) => task.assignedToProgrammerId === actor.user.id || isProjectMember(task.projectId, actor.user.id));
  }

  return tasks;
}

export function listPaymentsForActor(actor: RequestActor, projectId?: string) {
  const db = getDb();
  let payments = db.payments;
  if (projectId) {
    findProjectForActor(actor, projectId);
    payments = payments.filter((payment) => payment.projectId === projectId);
  }

  if (actor.user.role === "client") {
    payments = payments.filter((payment) => payment.clientId === actor.user.id);
  }

  return payments.map((payment) => {
    if (actor.user.role === "client") {
      return {
        id: payment.id,
        projectId: payment.projectId,
        clientId: payment.clientId,
        grossAmountCents: payment.grossAmountCents,
        currency: payment.currency,
        status: payment.status,
        paymentProvider: payment.paymentProvider,
        providerReference: payment.providerReference,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      };
    }

    return payment;
  });
}

export function getMessages(actor: RequestActor, projectId?: string) {
  const db = getDb();
  if (projectId) {
    findProjectForActor(actor, projectId);
  }

  const conversations = db.conversations.filter((conversation) => {
    if (projectId && conversation.projectId !== projectId) return false;
    return actor.user.role === "admin" || conversation.participantIds.includes(actor.user.id);
  });
  const conversationIds = conversations.map((conversation) => conversation.id);

  return {
    conversations,
    messages: db.messages.filter((message) => conversationIds.includes(message.conversationId)),
  };
}

export function createProjectMessage(actor: RequestActor, projectId: string, payload: unknown) {
  const body = asRecord(payload);
  const db = getDb();
  const project = findProjectForActor(actor, projectId);
  const bodyText = stringField(body, "body", { min: 1, max: 5000 });
  let conversation = db.conversations.find((item) => item.projectId === projectId && item.type === "project");

  if (!conversation) {
    conversation = {
      id: createId("cnv"),
      projectId,
      participantIds: conversationParticipants(project),
      createdByUserId: actor.user.id,
      type: "project",
      createdAt: nowIso(),
    };
    db.conversations.push(conversation);
  }

  const message = {
    id: createId("msg"),
    conversationId: conversation.id,
    senderId: actor.user.id,
    body: bodyText,
    attachments: optionalStringArray(body, "attachments"),
    createdAt: nowIso(),
  };

  db.messages.push(message);
  conversation.participantIds
    .filter((userId) => userId !== actor.user.id)
    .forEach((userId) => notify(userId, "message.created", "Nova mensagem", bodyText.slice(0, 120), `/meu-portal/${roleSegmentForUser(userId)}`));
  return message;
}

export function createClientRequest(actor: RequestActor, projectId: string, payload: unknown) {
  requireRole(actor, ["client", "admin"]);
  const body = asRecord(payload);
  const db = getDb();
  findProjectForActor(actor, projectId);
  const timestamp = nowIso();
  const task: Task = {
    id: createId("tsk"),
    projectId,
    createdByUserId: actor.user.id,
    title: stringField(body, "title", { min: 3, max: 160 }),
    description: stringField(body, "description", { min: 5, max: 5000 }),
    status: "todo",
    priority: enumField(body, "priority", ["low", "medium", "high", "urgent"] as const, { optional: true }) || "medium",
    source: "client_request",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.tasks.push(task);
  notifyProjectMembers(projectId, "request.created", "Nova solicitacao do cliente", task.title);
  return task;
}

export function createBudgetRequest(actor: RequestActor, payload: unknown) {
  requireRole(actor, ["client", "admin"]);
  const body = asRecord(payload);
  const db = getDb();
  const timestamp = nowIso();
  const budget = {
    id: createId("bdg"),
    clientId: actor.user.role === "client" ? actor.user.id : stringField(body, "clientId", { min: 1 }),
    projectId: stringField(body, "projectId", { optional: true }),
    title: stringField(body, "title", { min: 3, max: 160 }),
    description: stringField(body, "description", { min: 10, max: 5000 }),
    estimatedValueCents: integerCents(body, "estimatedValueCents", { optional: true, min: 0 }) || estimateBudgetCents(body),
    status: "submitted" as const,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.budgets.push(budget);
  notifyAdmins("budget.submitted", "Novo orcamento enviado", budget.title);
  logAudit({ actorUserId: actor.user.id, action: "budget.submitted", entityType: "budget", entityId: budget.id, after: budget, actor });
  return budget;
}

export function listBudgetsForActor(actor: RequestActor) {
  const db = getDb();
  if (actor.user.role === "admin") return db.budgets;
  requireRole(actor, ["client"]);
  return db.budgets.filter((budget) => budget.clientId === actor.user.id);
}

export function estimateBudget(payload: unknown) {
  const body = asRecord(payload);
  return {
    estimatedValueCents: estimateBudgetCents(body),
    estimatedDays: Math.max(7, Math.round(numberField(body, "complexity", { optional: true, min: 1, max: 5 }) || 2) * 10),
    scopeScore: Math.round((numberField(body, "features", { optional: true, min: 1, max: 50 }) || 5) * 1.35),
  };
}

export function createVisualComment(actor: RequestActor, projectId: string, payload: unknown) {
  requireRole(actor, ["client", "admin"]);
  const body = asRecord(payload);
  const db = getDb();
  const project = findProjectForActor(actor, projectId);
  const timestamp = nowIso();
  const comment: VisualComment = {
    id: createId("vcm"),
    projectId,
    clientId: actor.user.role === "client" ? actor.user.id : project.clientId,
    url: stringField(body, "url", { min: 5, max: 1000 }),
    pageTitle: stringField(body, "pageTitle", { optional: true, max: 300 }),
    xPercent: numberField(body, "xPercent", { min: 0, max: 100 }),
    yPercent: numberField(body, "yPercent", { min: 0, max: 100 }),
    viewportWidth: numberField(body, "viewportWidth", { min: 1 }),
    viewportHeight: numberField(body, "viewportHeight", { min: 1 }),
    cssSelector: stringField(body, "cssSelector", { optional: true, max: 1000 }),
    elementText: stringField(body, "elementText", { optional: true, max: 1000 }),
    screenshotUrl: stringField(body, "screenshotUrl", { optional: true, max: 1000 }),
    comment: stringField(body, "comment", { min: 2, max: 5000 }),
    status: "open",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.visualComments.push(comment);
  notifyProjectMembers(projectId, "visual_comment.created", "Novo comentario visual", comment.comment);
  return comment;
}

export function listVisualComments(actor: RequestActor, projectId: string) {
  findProjectForActor(actor, projectId);
  return getDb().visualComments.filter((comment) => comment.projectId === projectId);
}

export function listProgrammerDashboard(actor: RequestActor) {
  requireRole(actor, ["developer", "admin"]);
  const userId = actor.user.id;
  const db = getDb();
  const profile = db.programmerProfiles.find((item) => item.userId === userId);
  return {
    tasks: listProjectTasksForActor(actor).filter((task) => actor.user.role === "admin" || task.assignedToProgrammerId === userId),
    projects: listProgrammerProjects(actor),
    earnings: listProgrammerEarnings(actor),
    timeEntries: listTimeEntries(actor),
    notifications: db.notifications.filter((notification) => actor.user.role === "admin" || notification.userId === userId).slice(-20),
    programmerProfile:
      actor.user.role === "admin"
        ? undefined
        : profile
          ? {
              userId: profile.userId,
              displayName: profile.displayName,
              skills: profile.skills,
              githubUsername: profile.githubUsername,
              status: profile.status,
              hourlyReferenceRateCents: profile.hourlyRateApprovedAt ? profile.hourlyReferenceRateCents : undefined,
              hourlyRateApprovedAt: profile.hourlyRateApprovedAt,
              hourlyRatePendingCents: profile.hourlyRateApprovedAt ? undefined : profile.hourlyReferenceRateCents,
            }
          : undefined,
  };
}

export function listProgrammerProjects(actor: RequestActor) {
  requireRole(actor, ["developer", "admin"]);
  const db = getDb();
  if (actor.user.role === "admin") {
    return db.projects.map((project) => projectDto(project, actor));
  }

  const projectIds = db.projectMembers.filter((member) => member.programmerId === actor.user.id).map((member) => member.projectId);
  return db.projects.filter((project) => projectIds.includes(project.id)).map((project) => projectDto(project, actor));
}

export function updateProgrammerTask(actor: RequestActor, taskId: string, payload: unknown) {
  requireRole(actor, ["developer", "admin"]);
  const body = asRecord(payload);
  const db = getDb();
  const task = findById(db.tasks, taskId, "Task");
  if (isDeveloperRole(actor.user.role) && task.assignedToProgrammerId !== actor.user.id) {
    throw new ForbiddenError("Task is not assigned to this developer.");
  }

  const status = enumField(body, "status", taskStatuses, { optional: true });
  const description = stringField(body, "description", { optional: true, min: 1, max: 5000 });
  if (status) {
    task.status = status;
    if (status === "done") task.completedAt = nowIso();
  }
  if (description) task.description = description;
  task.updatedAt = nowIso();

  notifyProjectParticipants(task.projectId, "task.updated", "Status de tarefa atualizado", task.title);
  return task;
}

export function startTimeEntry(actor: RequestActor, payload: unknown) {
  requireRole(actor, ["developer"]);
  const body = asRecord(payload);
  const db = getDb();
  if (db.timeEntries.some((entry) => entry.programmerId === actor.user.id && entry.status === "running")) {
    throw new PortalError("Only one running timer is allowed per developer.", 409, "RUNNING_TIMER_EXISTS");
  }

  const projectId = stringField(body, "projectId", { min: 1 });
  if (!isProjectMember(projectId, actor.user.id)) {
    throw new ForbiddenError("Developer is not assigned to this project.");
  }

  const taskId = stringField(body, "taskId", { optional: true });
  if (taskId) {
    const task = findById(db.tasks, taskId, "Task");
    if (task.projectId !== projectId || task.assignedToProgrammerId !== actor.user.id) {
      throw new ForbiddenError("Task is not assigned to this developer on this project.");
    }
  }

  const timestamp = nowIso();
  const entry: TimeEntry = {
    id: createId("tim"),
    programmerId: actor.user.id,
    projectId,
    taskId,
    repositoryUrl: stringField(body, "repositoryUrl", { min: 5, max: 1000 }),
    description: stringField(body, "description", { min: 10, max: 5000 }),
    startedAt: timestamp,
    durationSeconds: 0,
    status: "running",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.timeEntries.push(entry);
  return entry;
}

export function stopTimeEntry(actor: RequestActor, timeEntryId: string, payload: unknown) {
  requireRole(actor, ["developer"]);
  const body = asRecord(payload ?? {});
  const db = getDb();
  const entry = findById(db.timeEntries, timeEntryId, "Time entry");
  if (entry.programmerId !== actor.user.id) {
    throw new ForbiddenError("Time entry belongs to another developer.");
  }

  if (entry.status !== "running") {
    throw new PortalError("Time entry is not running.", 409, "TIME_ENTRY_NOT_RUNNING");
  }

  const description = stringField(body, "description", { optional: true, min: 10, max: 5000 });
  const repositoryUrl = stringField(body, "repositoryUrl", { optional: true, min: 5, max: 1000 });
  if (description) entry.description = description;
  if (repositoryUrl) entry.repositoryUrl = repositoryUrl;

  const endedAt = nowIso();
  entry.endedAt = endedAt;
  entry.durationSeconds = Math.max(0, Math.round((new Date(endedAt).getTime() - new Date(entry.startedAt).getTime()) / 1000));
  entry.status = "submitted";
  entry.updatedAt = endedAt;

  notifyAdmins("time_entry.submitted", "Apontamento enviado", `${actor.user.name} enviou ${entry.durationSeconds} segundos.`);
  return entry;
}

export function listTimeEntries(actor: RequestActor) {
  const db = getDb();
  if (actor.user.role === "admin") return db.timeEntries;
  requireRole(actor, ["developer"]);
  return db.timeEntries.filter((entry) => entry.programmerId === actor.user.id);
}

export function listProgrammerEarnings(actor: RequestActor) {
  const db = getDb();
  if (actor.user.role === "admin") return db.programmerEarnings;
  requireRole(actor, ["developer"]);
  return db.programmerEarnings.filter((earning) => earning.programmerId === actor.user.id);
}

export function requestPayout(actor: RequestActor, payload: unknown) {
  requireRole(actor, ["developer"]);
  const body = asRecord(payload);
  const amountCents = integerCents(body, "amountCents", { min: 1 });
  const currency = stringField(body, "currency", { optional: true, min: 3, max: 3 }) || "BRL";
  const available = listProgrammerEarnings(actor)
    .filter((earning) => earning.status === "available")
    .reduce((sum, earning) => sum + earning.finalAmountCents, 0);

  if (amountCents > available) {
    throw new PortalError("Payout amount exceeds available earnings.", 422, "INSUFFICIENT_EARNINGS");
  }

  const payout = {
    id: createId("pyo"),
    programmerId: actor.user.id,
    amountCents,
    currency,
    status: "requested" as const,
    requestedAt: nowIso(),
    notes: stringField(body, "notes", { optional: true, max: 1000 }),
  };
  getDb().payoutRequests.push(payout);
  notifyAdmins("payout.requested", "Novo pedido de saque", `${actor.user.name} solicitou ${amountCents / 100} ${currency}.`);
  return payout;
}

export function createProject(actor: RequestActor, payload: unknown) {
  requireRole(actor, ["admin"]);
  const body = asRecord(payload);
  const db = getDb();
  const clientId = stringField(body, "clientId", { min: 1 });
  const client = findById(db.users, clientId, "Client");
  if (client.role !== "client") {
    throw new PortalError("Project clientId must belong to a client user.", 422, "INVALID_CLIENT");
  }

  const timestamp = nowIso();
  const project: Project = {
    id: createId("prj"),
    clientId,
    title: stringField(body, "title", { min: 3, max: 160 }),
    description: stringField(body, "description", { min: 5, max: 5000 }),
    status: enumField(body, "status", ["draft", "active", "paused", "completed", "cancelled"] as const, { optional: true }) || "draft",
    progressPercentage: numberField(body, "progressPercentage", { optional: true, min: 0, max: 100 }) || 0,
    budgetEstimateCents: integerCents(body, "budgetEstimateCents", { optional: true, min: 0 }),
    finalPriceCents: integerCents(body, "finalPriceCents", { optional: true, min: 0 }),
    grossAmountPaidByClientCents: integerCents(body, "grossAmountPaidByClientCents", { optional: true, min: 0 }) || 0,
    currency: stringField(body, "currency", { optional: true, min: 3, max: 3 }) || "BRL",
    githubUrl: stringField(body, "githubUrl", { optional: true, max: 1000 }),
    stagingUrl: stringField(body, "stagingUrl", { optional: true, max: 1000 }),
    productionUrl: stringField(body, "productionUrl", { optional: true, max: 1000 }),
    codeStatus: stringField(body, "codeStatus", { optional: true, max: 200 }),
    technicalNotes: stringField(body, "technicalNotes", { optional: true, max: 3000 }),
    liveUrl: stringField(body, "liveUrl", { optional: true, max: 1000 }),
    repositoryUrl: stringField(body, "repositoryUrl", { optional: true, max: 1000 }),
    performanceUrl: stringField(body, "performanceUrl", { optional: true, max: 1000 }),
    startDate: stringField(body, "startDate", { optional: true }),
    dueDate: stringField(body, "dueDate", { optional: true }),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.projects.push(project);
  logAudit({ actorUserId: actor.user.id, action: "admin.created_project", entityType: "project", entityId: project.id, after: project, actor });
  notify(clientId, "project.created", "Projeto criado", project.title, "/meu-portal/client");
  return project;
}

export function updateProject(actor: RequestActor, projectId: string, payload: unknown) {
  requireRole(actor, ["admin", "developer"]);
  const body = asRecord(payload);
  const project = findProjectForActor(actor, projectId);
  const before = { ...project };
  const title = stringField(body, "title", { optional: true, min: 3, max: 160 });
  const description = stringField(body, "description", { optional: true, min: 5, max: 5000 });
  const status = enumField(body, "status", ["draft", "active", "paused", "completed", "cancelled"] as const, { optional: true });
  const progressPercentage = numberField(body, "progressPercentage", { optional: true, min: 0, max: 100 });
  const grossAmountPaidByClientCents = integerCents(body, "grossAmountPaidByClientCents", { optional: true, min: 0 });

  if (actor.user.role === "admin") {
    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;
    if (grossAmountPaidByClientCents != null) project.grossAmountPaidByClientCents = grossAmountPaidByClientCents;
  }
  if (progressPercentage != null) project.progressPercentage = progressPercentage;
  project.githubUrl = stringField(body, "githubUrl", { optional: true, max: 1000 }) || project.githubUrl;
  project.stagingUrl = stringField(body, "stagingUrl", { optional: true, max: 1000 }) || project.stagingUrl;
  project.productionUrl = stringField(body, "productionUrl", { optional: true, max: 1000 }) || project.productionUrl;
  project.codeStatus = stringField(body, "codeStatus", { optional: true, max: 200 }) || project.codeStatus;
  project.technicalNotes = stringField(body, "technicalNotes", { optional: true, max: 3000 }) || project.technicalNotes;
  project.liveUrl = stringField(body, "liveUrl", { optional: true, max: 1000 }) || project.liveUrl;
  project.repositoryUrl = stringField(body, "repositoryUrl", { optional: true, max: 1000 }) || project.repositoryUrl;
  project.performanceUrl = stringField(body, "performanceUrl", { optional: true, max: 1000 }) || project.performanceUrl;
  project.updatedAt = nowIso();

  logAudit({ actorUserId: actor.user.id, action: "admin.updated_project", entityType: "project", entityId: project.id, before, after: project, actor });
  return project;
}

export function assignProgrammer(actor: RequestActor, projectId: string, payload: unknown) {
  requireRole(actor, ["admin"]);
  const body = asRecord(payload);
  const db = getDb();
  findById(db.projects, projectId, "Project");
  const programmerId = stringField(body, "programmerId", { min: 1 });
  const programmer = findById(db.users, programmerId, "Programmer");
  if (!isDeveloperRole(programmer.role)) throw new PortalError("User must be a developer.", 422, "INVALID_DEVELOPER");
  if (isProjectMember(projectId, programmerId)) throw new PortalError("Developer is already assigned.", 409, "ALREADY_ASSIGNED");

  const member = {
    projectId,
    programmerId,
    roleInProject: stringField(body, "roleInProject", { optional: true, max: 120 }) || "developer",
    assignedByAdminId: actor.user.id,
    participationWeightOverride: numberField(body, "participationWeightOverride", { optional: true, min: 0, max: 100 }),
    participationNotes: stringField(body, "participationNotes", { optional: true, max: 1000 }),
    createdAt: nowIso(),
  };

  db.projectMembers.push(member);
  logAudit({ actorUserId: actor.user.id, action: "admin.assigned_programmer", entityType: "projectMember", entityId: `${projectId}:${programmerId}`, after: member, actor });
  notify(programmerId, "project.assigned", "Projeto atribuido", "Voce foi adicionado a um projeto.", "/meu-portal/developer");
  return member;
}

export function removeProgrammer(actor: RequestActor, projectId: string, programmerId: string) {
  requireRole(actor, ["admin"]);
  const db = getDb();
  const before = db.projectMembers.find((member) => member.projectId === projectId && member.programmerId === programmerId);
  db.projectMembers = db.projectMembers.filter((member) => !(member.projectId === projectId && member.programmerId === programmerId));
  logAudit({ actorUserId: actor.user.id, action: "admin.removed_programmer", entityType: "projectMember", entityId: `${projectId}:${programmerId}`, before, actor });
  return { removed: Boolean(before) };
}

export function createTask(actor: RequestActor, payload: unknown) {
  requireRole(actor, ["admin"]);
  const body = asRecord(payload);
  const db = getDb();
  const projectId = stringField(body, "projectId", { min: 1 });
  findById(db.projects, projectId, "Project");
  const timestamp = nowIso();
  const task: Task = {
    id: createId("tsk"),
    projectId,
    assignedToProgrammerId: stringField(body, "assignedToProgrammerId", { optional: true }),
    createdByUserId: actor.user.id,
    title: stringField(body, "title", { min: 3, max: 160 }),
    description: stringField(body, "description", { min: 5, max: 5000 }),
    status: enumField(body, "status", taskStatuses, { optional: true }) || "todo",
    priority: enumField(body, "priority", ["low", "medium", "high", "urgent"] as const, { optional: true }) || "medium",
    source: enumField(body, "source", ["admin", "client_request", "visual_comment", "github", "system"] as const, { optional: true }) || "admin",
    dueDate: stringField(body, "dueDate", { optional: true }),
    estimatedHours: numberField(body, "estimatedHours", { optional: true, min: 0 }),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.tasks.push(task);
  if (task.assignedToProgrammerId) {
    notify(task.assignedToProgrammerId, "task.assigned", "Nova tarefa atribuida", task.title, "/meu-portal/developer");
  }
  logAudit({ actorUserId: actor.user.id, action: "admin.created_task", entityType: "task", entityId: task.id, after: task, actor });
  return task;
}

export function updateAdminTask(actor: RequestActor, taskId: string, payload: unknown) {
  requireRole(actor, ["admin"]);
  const before = { ...findById(getDb().tasks, taskId, "Task") };
  const task = updateProgrammerTask(actor, taskId, payload);
  const body = asRecord(payload);
  const assignedToProgrammerId = stringField(body, "assignedToProgrammerId", { optional: true });
  if (assignedToProgrammerId) task.assignedToProgrammerId = assignedToProgrammerId;
  logAudit({ actorUserId: actor.user.id, action: "admin.updated_task", entityType: "task", entityId: task.id, before, after: task, actor });
  return task;
}

export function convertVisualCommentToTask(actor: RequestActor, visualCommentId: string, payload: unknown) {
  requireRole(actor, ["admin"]);
  const db = getDb();
  const comment = findById(db.visualComments, visualCommentId, "Visual comment");
  const task = createTask(actor, {
    projectId: comment.projectId,
    title: stringField(asRecord(payload), "title", { optional: true }) || `Comentario visual: ${comment.comment.slice(0, 80)}`,
    description: `${comment.comment}\n\nURL: ${comment.url}`,
    source: "visual_comment",
    priority: "medium",
    assignedToProgrammerId: stringField(asRecord(payload), "assignedToProgrammerId", { optional: true }),
  });
  comment.status = "converted_to_task";
  comment.linkedTaskId = task.id;
  comment.updatedAt = nowIso();
  logAudit({ actorUserId: actor.user.id, action: "admin.converted_visual_comment", entityType: "visualComment", entityId: comment.id, after: { comment, task }, actor });
  return { comment, task };
}

export function createPayment(actor: RequestActor, payload: unknown) {
  requireRole(actor, ["admin"]);
  const body = asRecord(payload);
  const db = getDb();
  const projectId = stringField(body, "projectId", { min: 1 });
  const project = findById(db.projects, projectId, "Project");
  const timestamp = nowIso();
  const payment = {
    id: createId("pay"),
    projectId,
    clientId: project.clientId,
    grossAmountCents: integerCents(body, "grossAmountCents", { min: 1 }),
    currency: stringField(body, "currency", { optional: true, min: 3, max: 3 }) || project.currency,
    status: enumField(body, "status", paymentStatuses, { optional: true }) || "pending",
    dueDate: stringField(body, "dueDate", { optional: true }),
    paymentProvider: stringField(body, "paymentProvider", { optional: true, max: 120 }),
    providerReference: stringField(body, "providerReference", { optional: true, max: 200 }),
    paidAt: stringField(body, "paidAt", { optional: true }),
    notes: stringField(body, "notes", { optional: true, max: 1000 }),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.payments.push(payment);
  logAudit({ actorUserId: actor.user.id, action: "admin.created_payment", entityType: "payment", entityId: payment.id, after: payment, actor });
  if (payment.status === "verified") recalculateEarnings(actor, projectId, { notes: "Payment created as verified." });
  return payment;
}

export function updatePayment(actor: RequestActor, paymentId: string, payload: unknown) {
  requireRole(actor, ["admin"]);
  const body = asRecord(payload);
  const db = getDb();
  const payment = findById(db.payments, paymentId, "Payment");
  const before = { ...payment };
  const status = enumField(body, "status", paymentStatuses, { optional: true });
  if (status) payment.status = status;
  const notes = stringField(body, "notes", { optional: true, max: 1000 });
  if (notes) payment.notes = notes;
  if (status === "verified") {
    payment.verifiedByAdminId = actor.user.id;
    payment.paidAt ||= nowIso();
  }
  payment.updatedAt = nowIso();
  logAudit({ actorUserId: actor.user.id, action: "admin.updated_payment", entityType: "payment", entityId: payment.id, before, after: payment, actor });
  if (status === "verified") recalculateEarnings(actor, payment.projectId, { notes: "Payment verified." });
  return payment;
}

export function getEarningsForProject(actor: RequestActor, projectId: string) {
  requireRole(actor, ["admin"]);
  const db = getDb();
  return {
    calculations: db.earningsCalculations.filter((calculation) => calculation.projectId === projectId),
    earnings: db.programmerEarnings.filter((earning) => earning.projectId === projectId),
    metrics: db.githubCommitMetrics.filter((metric) => metric.projectId === projectId),
  };
}

export function recalculateEarnings(actor: RequestActor, projectId: string, payload: unknown = {}) {
  requireRole(actor, ["admin"]);
  const body = asRecord(payload ?? {});
  const db = getDb();
  const project = findById(db.projects, projectId, "Project");
  const settings = getRevenueSettings();
  validateRevenueSettings(settings);
  const verifiedGross = db.payments
    .filter((payment) => payment.projectId === projectId && payment.status === "verified")
    .reduce((sum, payment) => sum + payment.grossAmountCents, 0);
  const grossAmountCents = verifiedGross || project.grossAmountPaidByClientCents;
  const calculationVersion = db.earningsCalculations.filter((calculation) => calculation.projectId === projectId).length + 1;
  const programmerPoolAmountCents = Math.round((grossAmountCents * settings.programmerPoolPercent) / 100);
  const calculation = {
    id: createId("calc"),
    projectId,
    grossAmountCents,
    taxAndFeesAmountCents: Math.round((grossAmountCents * settings.taxAndFeesPercent) / 100),
    henriqueAmountCents: Math.round((grossAmountCents * settings.henriquePercent) / 100),
    programmerPoolAmountCents,
    calculationVersion,
    calculatedByUserId: actor.user.id,
    adminOverride: false,
    finalized: false,
    notes: stringField(body, "notes", { optional: true, max: 1000 }),
    createdAt: nowIso(),
  };

  db.earningsCalculations.push(calculation);

  const members = db.projectMembers.filter((member) => member.projectId === projectId);
  const contributions = members.map((member) => {
    const lines = calculateEffectiveLines(
      db.githubCommitMetrics.filter((metric) => metric.projectId === projectId && metric.programmerId === member.programmerId)
    );
    return {
      programmerId: member.programmerId,
      lines,
      override: member.participationWeightOverride,
    };
  });
  const overrideTotal = contributions.reduce((sum, contribution) => sum + (contribution.override || 0), 0);
  const totalLines = contributions.reduce((sum, contribution) => sum + contribution.lines, 0);

  const earnings: ProgrammerEarning[] = contributions.map((contribution, index) => {
    const participationPercent =
      contribution.override != null
        ? contribution.override
        : totalLines > 0
          ? (contribution.lines / totalLines) * Math.max(0, 100 - overrideTotal)
          : members.length > 0
            ? 100 / members.length
            : 0;
    const finalAmountCents =
      index === contributions.length - 1
        ? programmerPoolAmountCents -
          db.programmerEarnings
            .filter((earning) => earning.calculationId === calculation.id)
            .reduce((sum, earning) => sum + earning.finalAmountCents, 0)
        : Math.round((programmerPoolAmountCents * participationPercent) / 100);

    return {
      id: createId("ern"),
      calculationId: calculation.id,
      projectId,
      programmerId: contribution.programmerId,
      participationPercent: Number(participationPercent.toFixed(4)),
      githubEffectiveLines: contribution.lines,
      manualAdjustmentAmountCents: 0,
      finalAmountCents,
      status: "pending" as EarningStatus,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
  });

  db.programmerEarnings.push(...earnings);
  logAudit({ actorUserId: actor.user.id, action: "admin.recalculated_earnings", entityType: "project", entityId: projectId, after: { calculation, earnings }, actor });
  notifyProjectMembers(projectId, "earnings.updated", "Ganhos recalculados", "Uma nova versao de calculo foi criada.");
  return { calculation, earnings };
}

export function updateEarning(actor: RequestActor, earningId: string, payload: unknown) {
  requireRole(actor, ["admin"]);
  const body = asRecord(payload);
  const db = getDb();
  const earning = findById(db.programmerEarnings, earningId, "Earning");
  const before = { ...earning };
  const status = enumField(body, "status", earningStatuses, { optional: true });
  const manualAdjustmentAmountCents = integerCents(body, "manualAdjustmentAmountCents", { optional: true });
  const finalAmountCents = integerCents(body, "finalAmountCents", { optional: true, min: 0 });
  const participationPercent = numberField(body, "participationPercent", { optional: true, min: 0, max: 100 });
  const reason = stringField(body, "manualAdjustmentReason", { optional: true, min: 5, max: 1000 });

  if ((manualAdjustmentAmountCents != null || finalAmountCents != null || participationPercent != null) && !reason) {
    throw new PortalError("Override reason is required.", 422, "OVERRIDE_REASON_REQUIRED");
  }

  if (status) earning.status = status;
  if (manualAdjustmentAmountCents != null) {
    earning.manualAdjustmentAmountCents = manualAdjustmentAmountCents;
    earning.manualAdjustmentReason = reason;
    earning.finalAmountCents += manualAdjustmentAmountCents;
  }
  if (finalAmountCents != null) {
    earning.finalAmountCents = finalAmountCents;
    earning.manualAdjustmentReason = reason;
  }
  if (participationPercent != null) {
    earning.participationPercent = participationPercent;
    earning.manualAdjustmentReason = reason;
  }
  earning.updatedAt = nowIso();
  logAudit({ actorUserId: actor.user.id, action: "admin.updated_earning", entityType: "programmerEarning", entityId: earning.id, before, after: earning, actor });
  return earning;
}

export function listPayoutRequests(actor: RequestActor) {
  const db = getDb();
  if (actor.user.role === "admin") return db.payoutRequests;
  requireRole(actor, ["developer"]);
  return db.payoutRequests.filter((payout) => payout.programmerId === actor.user.id);
}

export function updatePayoutRequest(actor: RequestActor, payoutRequestId: string, payload: unknown) {
  requireRole(actor, ["admin"]);
  const body = asRecord(payload);
  const db = getDb();
  const payout = findById(db.payoutRequests, payoutRequestId, "Payout request");
  const before = { ...payout };
  const status = enumField(body, "status", payoutStatuses, { optional: true });
  if (status) {
    payout.status = status;
    payout.reviewedByAdminId = actor.user.id;
    payout.reviewedAt = nowIso();
    if (status === "paid") payout.paidAt = nowIso();
  }
  payout.notes = stringField(body, "notes", { optional: true, max: 1000 }) || payout.notes;
  logAudit({ actorUserId: actor.user.id, action: "admin.updated_payout", entityType: "payoutRequest", entityId: payout.id, before, after: payout, actor });
  notify(payout.programmerId, `payout.${payout.status}`, "Pedido de saque atualizado", `Status: ${payout.status}`, "/meu-portal/developer");
  return payout;
}

export function syncGithubRepository(actor: RequestActor, projectId: string, payload: unknown = {}) {
  requireRole(actor, ["admin", "developer"]);
  const body = asRecord(payload ?? {});
  const db = getDb();
  const project = findProjectForActor(actor, projectId);
  const repositoryUrl = stringField(body, "repositoryUrl", { optional: true, min: 5, max: 1000 }) || project.repositoryUrl;
  if (!repositoryUrl) throw new PortalError("repositoryUrl is required.", 422, "REPOSITORY_URL_REQUIRED");
  const parsed = parseGitHubRepositoryUrl(repositoryUrl);
  let repository = db.githubRepositories.find((item) => item.projectId === projectId && item.repositoryUrl === repositoryUrl);
  const timestamp = nowIso();

  if (!repository) {
    repository = {
      id: createId("ghr"),
      projectId,
      repositoryUrl,
      owner: parsed.owner,
      repo: parsed.repo,
      defaultBranch: stringField(body, "defaultBranch", { optional: true }) || "main",
      addedByUserId: actor.user.id,
      syncStatus: "pending",
      createdAt: timestamp,
    };
    db.githubRepositories.push(repository);
  }

  const metric: GitHubCommitMetric = {
    id: createId("ghm"),
    projectId,
    repositoryId: repository.id,
    programmerId: isDeveloperRole(actor.user.role) ? actor.user.id : stringField(body, "programmerId", { optional: true }),
    githubAuthorName: stringField(body, "githubAuthorName", { optional: true }) || actor.user.name,
    githubAuthorEmail: stringField(body, "githubAuthorEmail", { optional: true }) || actor.user.email,
    commitSha: stringField(body, "commitSha", { optional: true }) || createId("sha"),
    commitDate: stringField(body, "commitDate", { optional: true }) || timestamp,
    message: stringField(body, "message", { optional: true }) || "Manual GitHub sync snapshot",
    effectiveLinesAdded: numberField(body, "effectiveLinesAdded", { optional: true, min: 0 }) || 0,
    effectiveLinesDeleted: numberField(body, "effectiveLinesDeleted", { optional: true, min: 0 }) || 0,
    effectiveLinesModified: numberField(body, "effectiveLinesModified", { optional: true, min: 0 }) || 0,
    ignoredLines: numberField(body, "ignoredLines", { optional: true, min: 0 }) || 0,
    ignoredReason: stringField(body, "ignoredReason", { optional: true, max: 1000 }),
    createdAt: timestamp,
  };

  repository.lastSyncedAt = timestamp;
  repository.syncStatus = "synced";
  db.githubCommitMetrics.push(metric);
  logAudit({ actorUserId: actor.user.id, action: "github.synced", entityType: "project", entityId: projectId, after: { repository, metric }, actor });
  notifyProjectParticipants(projectId, "github.sync_completed", "GitHub sincronizado", repository.repositoryUrl);
  return { repository, metric };
}

export function listGithubMetrics(actor: RequestActor, projectId: string) {
  requireRole(actor, ["admin"]);
  return getDb().githubCommitMetrics.filter((metric) => metric.projectId === projectId);
}

export function updateGithubMetric(actor: RequestActor, metricId: string, payload: unknown) {
  requireRole(actor, ["admin"]);
  const body = asRecord(payload);
  const metric = findById(getDb().githubCommitMetrics, metricId, "GitHub metric");
  const before = { ...metric };
  metric.effectiveLinesAdded = numberField(body, "effectiveLinesAdded", { optional: true, min: 0 }) ?? metric.effectiveLinesAdded;
  metric.effectiveLinesDeleted = numberField(body, "effectiveLinesDeleted", { optional: true, min: 0 }) ?? metric.effectiveLinesDeleted;
  metric.effectiveLinesModified = numberField(body, "effectiveLinesModified", { optional: true, min: 0 }) ?? metric.effectiveLinesModified;
  metric.ignoredLines = numberField(body, "ignoredLines", { optional: true, min: 0 }) ?? metric.ignoredLines;
  metric.ignoredReason = stringField(body, "ignoredReason", { optional: true, min: 5, max: 1000 }) || metric.ignoredReason;
  if (!metric.ignoredReason) {
    throw new PortalError("A reason is required when overriding GitHub metrics.", 422, "OVERRIDE_REASON_REQUIRED");
  }
  logAudit({ actorUserId: actor.user.id, action: "admin.updated_github_metric", entityType: "githubCommitMetric", entityId: metric.id, before, after: metric, actor });
  return metric;
}

export function listAuditLogs(actor: RequestActor) {
  requireRole(actor, ["admin"]);
  return getDb().auditLogs.slice().reverse();
}

export function getSettings(actor: RequestActor) {
  requireRole(actor, ["admin"]);
  return getDb().systemSettings;
}

export function updateSettings(actor: RequestActor, payload: unknown) {
  requireRole(actor, ["admin"]);
  const body = asRecord(payload);
  const db = getDb();
  const updates = safeJsonRecord(body.settings) || body;
  const before = db.systemSettings.map((setting) => ({ ...setting }));
  Object.entries(updates).forEach(([key, value]) => {
    let setting = db.systemSettings.find((item) => item.key === key);
    if (!setting) {
      setting = {
        key,
        value,
        description: stringField(body, "description", { optional: true }) || "Custom system setting.",
        updatedByAdminId: actor.user.id,
        updatedAt: nowIso(),
      };
      db.systemSettings.push(setting);
    } else {
      setting.value = value;
      setting.updatedByAdminId = actor.user.id;
      setting.updatedAt = nowIso();
    }
  });
  validateRevenueSettings(getRevenueSettings());
  logAudit({ actorUserId: actor.user.id, action: "admin.updated_settings", entityType: "systemSetting", entityId: "bulk", before, after: db.systemSettings, actor });
  return db.systemSettings;
}

export function getNotifications(actor: RequestActor) {
  return getDb().notifications.filter((notification) => notification.userId === actor.user.id || actor.user.role === "admin").slice(-100);
}

export function realtimeSnapshot(actor: RequestActor) {
  return {
    timestamp: nowIso(),
    notifications: getNotifications(actor),
    dashboard:
      actor.user.role === "client"
        ? { projects: listClientProjects(actor) }
        : isDeveloperRole(actor.user.role)
          ? listProgrammerDashboard(actor)
          : adminDashboard(actor),
  };
}

export function adminDashboard(actor: RequestActor) {
  requireRole(actor, ["admin"]);
  const db = getDb();
  return {
    users: db.users.map(toSafeUser),
    programmerProfiles: db.programmerProfiles,
    projects: db.projects,
    tasks: db.tasks,
    payments: db.payments,
    budgets: db.budgets,
    payoutRequests: db.payoutRequests,
    auditLogCount: db.auditLogs.length,
    settings: db.systemSettings,
  };
}

export function parseGitHubRepositoryUrl(url: string) {
  const match = url.match(/^https:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+?)(?:\.git)?(?:[/?#].*)?$/i);
  if (!match) {
    throw new PortalError("Invalid GitHub repository URL.", 422, "INVALID_GITHUB_URL");
  }

  return { owner: match[1], repo: match[2] };
}

export function shouldIgnoreGithubPath(path: string) {
  const normalized = path.replace(/\\/g, "/").toLowerCase();
  const ignoredSegments = [
    "node_modules/",
    "dist/",
    "build/",
    ".next/",
    ".turbo/",
    "coverage/",
    "vendor/",
    "public/assets/",
  ];
  const ignoredExtensions = [".lock", ".min.js", ".min.css", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".pdf", ".zip"];
  return ignoredSegments.some((segment) => normalized.includes(segment)) || ignoredExtensions.some((extension) => normalized.endsWith(extension));
}

function calculateEffectiveLines(metrics: GitHubCommitMetric[]) {
  return metrics.reduce(
    (sum, metric) => sum + metric.effectiveLinesAdded + metric.effectiveLinesModified + Math.max(0, Math.round(metric.effectiveLinesDeleted * 0.25)),
    0
  );
}

function getRevenueSettings() {
  const settingValue = (key: string, fallback: number) => {
    const value = getDb().systemSettings.find((setting) => setting.key === key)?.value;
    return typeof value === "number" ? value : fallback;
  };

  return {
    taxAndFeesPercent: settingValue("revenue.taxAndFeesPercent", 50),
    henriquePercent: settingValue("revenue.henriquePercent", 25),
    programmerPoolPercent: settingValue("revenue.programmerPoolPercent", 25),
  };
}

function validateRevenueSettings(settings: ReturnType<typeof getRevenueSettings>) {
  const total = settings.taxAndFeesPercent + settings.henriquePercent + settings.programmerPoolPercent;
  if (total !== 100) {
    throw new PortalError("Revenue percentages must add up to 100.", 422, "INVALID_REVENUE_SETTINGS");
  }
}

function estimateBudgetCents(body: Record<string, unknown>) {
  const features = numberField(body, "features", { optional: true, min: 1, max: 50 }) || 5;
  const complexity = numberField(body, "complexity", { optional: true, min: 1, max: 5 }) || 2;
  const integrations = numberField(body, "integrations", { optional: true, min: 0, max: 20 }) || 0;
  return Math.round((features * 90000 + complexity * 180000 + integrations * 120000) / 10000) * 10000;
}

function findProjectForActor(actor: RequestActor, projectId: string) {
  const project = findById(getDb().projects, projectId, "Project");
  if (actor.user.role === "admin") return project;
  if (actor.user.role === "client" && project.clientId === actor.user.id) return project;
  if (isDeveloperRole(actor.user.role) && isProjectMember(project.id, actor.user.id)) return project;
  throw new ForbiddenError("User cannot access this project.");
}

function projectDto(project: Project, actor: RequestActor) {
  if (actor.user.role !== "client") {
    return project;
  }

  return {
    id: project.id,
    clientId: project.clientId,
    title: project.title,
    description: project.description,
    status: project.status,
    progressPercentage: project.progressPercentage,
    currency: project.currency,
    liveUrl: project.liveUrl || project.productionUrl,
    repositoryUrl: project.repositoryUrl || project.githubUrl,
    githubUrl: project.githubUrl || project.repositoryUrl,
    stagingUrl: project.stagingUrl,
    productionUrl: project.productionUrl || project.liveUrl,
    codeStatus: project.codeStatus,
    technicalNotes: project.technicalNotes,
    performanceUrl: project.performanceUrl,
    startDate: project.startDate,
    dueDate: project.dueDate,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

function findById<T extends { id: string }>(items: T[], id: string, label: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new NotFoundError(`${label} not found.`);
  return item;
}

function isProjectMember(projectId: string, programmerId: string) {
  return getDb().projectMembers.some((member) => member.projectId === projectId && member.programmerId === programmerId);
}

function conversationParticipants(project: Project) {
  const programmerIds = getDb().projectMembers.filter((member) => member.projectId === project.id).map((member) => member.programmerId);
  return Array.from(new Set([project.clientId, ...programmerIds, ...getDb().users.filter((user) => user.role === "admin").map((user) => user.id)]));
}

function notifyProjectMembers(projectId: string, type: string, title: string, body: string) {
  getDb().projectMembers
    .filter((member) => member.projectId === projectId)
    .forEach((member) => notify(member.programmerId, type, title, body, "/meu-portal/developer"));
  notifyAdmins(type, title, body);
}

function notifyProjectParticipants(projectId: string, type: string, title: string, body: string) {
  const project = getDb().projects.find((item) => item.id === projectId);
  if (!project) return;
  conversationParticipants(project).forEach((userId) => notify(userId, type, title, body, `/meu-portal/${roleSegmentForUser(userId)}`));
}

function notifyAdmins(type: string, title: string, body: string) {
  getDb().users.filter((user) => user.role === "admin").forEach((user) => notify(user.id, type, title, body, "/meu-portal/admin"));
}

function notify(userId: string, type: string, title: string, body: string, link?: string) {
  const notification: Notification = {
    id: createId("ntf"),
    userId,
    type,
    title,
    body,
    link,
    createdAt: nowIso(),
  };
  getDb().notifications.push(notification);
  return notification;
}

function roleSegmentForUser(userId: string) {
  const role = getDb().users.find((user) => user.id === userId)?.role;
  return role === "admin" ? "admin" : isDeveloperRole(role || "") ? "developer" : "client";
}

function logAudit(input: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  actor?: RequestActor;
}) {
  const auditLog: AuditLog = {
    id: createId("aud"),
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    before: input.before,
    after: input.after,
    ipAddress: input.actor?.ipAddress,
    userAgent: input.actor?.userAgent,
    createdAt: nowIso(),
  };
  getDb().auditLogs.push(auditLog);
  return auditLog;
}
