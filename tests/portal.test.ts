import test from "node:test";
import assert from "node:assert/strict";
import { resetPortalDatabaseForTests } from "../src/server/portal/store";
import {
  createProgrammer,
  createProject,
  createVisualComment,
  getClientProject,
  listUsers,
  listVisualComments,
  parseGitHubRepositoryUrl,
  recalculateEarnings,
  registerClient,
  requestPayout,
  requireActor,
  shouldIgnoreGithubPath,
  startTimeEntry,
  stopTimeEntry,
  updateEarning,
  convertVisualCommentToTask,
} from "../src/server/portal/services";

function actors() {
  const db = resetPortalDatabaseForTests();
  return {
    db,
    admin: requireActor(db.users.find((user) => user.role === "admin")),
    client: requireActor(db.users.find((user) => user.role === "client")),
    programmer: requireActor(db.users.find((user) => user.role === "programmer")),
  };
}

test("public registration always creates client users and rejects programmer self-registration", () => {
  actors();
  const user = registerClient({ name: "Nova Cliente", email: "nova@example.com", password: "Portal123!" });
  assert.equal(user.role, "client");

  assert.throws(
    () => registerClient({ name: "Dev", email: "dev@example.com", password: "Portal123!", role: "programmer" }),
    /client accounts/
  );
});

test("admin can create programmers and list users", () => {
  const { admin } = actors();
  const programmer = createProgrammer(admin, {
    name: "Dev Criado",
    email: "dev-criado@example.com",
    password: "Portal123!",
    skills: ["Next.js"],
  });

  assert.equal(programmer.role, "programmer");
  assert.ok(listUsers(admin).some((user) => user.email === "dev-criado@example.com"));
});

test("RBAC prevents clients and unrelated programmers from reading projects", () => {
  const { admin, client, db } = actors();
  const otherClient = registerClient({ name: "Outro Cliente", email: "outro@example.com", password: "Portal123!" });
  const otherActor = requireActor(db.users.find((user) => user.id === otherClient.id));
  const project = createProject(admin, {
    clientId: client.user.id,
    title: "Projeto Restrito",
    description: "Somente o cliente dono pode ver.",
    grossAmountPaidByClientCents: 100000,
  });
  const unassignedProgrammer = createProgrammer(admin, {
    name: "Dev Sem Projeto",
    email: "sem-projeto@example.com",
    password: "Portal123!",
  });

  assert.throws(() => getClientProject(otherActor, project.id), /cannot access/);
  assert.throws(() => getClientProject(requireActor(db.users.find((user) => user.id === unassignedProgrammer.id)), project.id), /cannot access/);
  assert.equal(getClientProject(admin, project.id).id, project.id);
});

test("earnings calculator uses the default split and requires override reasons", () => {
  const { admin, db } = actors();
  const result = recalculateEarnings(admin, "prj_goosley", { notes: "test" });
  assert.equal(result.calculation.taxAndFeesAmountCents, 500000);
  assert.equal(result.calculation.henriqueAmountCents, 250000);
  assert.equal(result.calculation.programmerPoolAmountCents, 250000);
  assert.equal(result.earnings[0].finalAmountCents, 250000);

  assert.throws(() => updateEarning(admin, result.earnings[0].id, { finalAmountCents: 200000 }), /reason is required/i);
  updateEarning(admin, result.earnings[0].id, {
    finalAmountCents: 200000,
    manualAdjustmentReason: "Deployment work handled outside GitHub.",
  });
  assert.ok(db.auditLogs.some((log) => log.action === "admin.updated_earning"));
});

test("time tracking is server calculated and prevents concurrent running timers", () => {
  const { programmer } = actors();
  assert.throws(
    () =>
      startTimeEntry(programmer, {
        projectId: "prj_goosley",
        repositoryUrl: "https://github.com/goosley/site-goosley",
        description: "short",
      }),
    /at least 10/
  );

  const entry = startTimeEntry(programmer, {
    projectId: "prj_goosley",
    repositoryUrl: "https://github.com/goosley/site-goosley",
    description: "Implementing portal backend services.",
  });
  assert.throws(
    () =>
      startTimeEntry(programmer, {
        projectId: "prj_goosley",
        repositoryUrl: "https://github.com/goosley/site-goosley",
        description: "Trying to start another valid timer.",
      }),
    /Only one running timer/
  );

  const stopped = stopTimeEntry(programmer, entry.id, {
    description: "Implemented portal backend services and tests.",
    repositoryUrl: "https://github.com/goosley/site-goosley",
  });
  assert.equal(stopped.status, "submitted");
  assert.ok(stopped.durationSeconds >= 0);
});

test("visual comments are project scoped and convertible by admins", () => {
  const { admin, client, programmer, db } = actors();
  const comment = createVisualComment(client, "prj_goosley", {
    url: "https://goosley.local/home",
    xPercent: 30,
    yPercent: 40,
    viewportWidth: 1440,
    viewportHeight: 900,
    comment: "Ajustar texto do banner.",
  });
  assert.equal(listVisualComments(programmer, "prj_goosley")[0].id, comment.id);

  const unassignedProgrammer = createProgrammer(admin, {
    name: "Dev Isolado",
    email: "isolado@example.com",
    password: "Portal123!",
  });
  assert.throws(() => listVisualComments(requireActor(db.users.find((user) => user.id === unassignedProgrammer.id)), "prj_goosley"), /cannot access/);

  const converted = convertVisualCommentToTask(admin, comment.id, { assignedToProgrammerId: programmer.user.id });
  assert.equal(converted.comment.status, "converted_to_task");
  assert.equal(converted.task.source, "visual_comment");
});

test("payout requests cannot exceed available earnings", () => {
  const { programmer } = actors();
  const payout = requestPayout(programmer, { amountCents: 100000, currency: "BRL" });
  assert.equal(payout.status, "requested");
  assert.throws(() => requestPayout(programmer, { amountCents: 99999999, currency: "BRL" }), /exceeds available/);
});

test("GitHub URL validation and generated file ignores are centralized", () => {
  assert.deepEqual(parseGitHubRepositoryUrl("https://github.com/goosley/site-goosley.git"), {
    owner: "goosley",
    repo: "site-goosley",
  });
  assert.throws(() => parseGitHubRepositoryUrl("https://example.com/not/github"), /Invalid GitHub/);
  assert.equal(shouldIgnoreGithubPath("node_modules/pkg/index.js"), true);
  assert.equal(shouldIgnoreGithubPath("src/app/page.tsx"), false);
});
