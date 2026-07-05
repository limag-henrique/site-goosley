import test from "node:test";
import assert from "node:assert/strict";
import { resetPortalDatabaseForTests } from "../src/server/portal/store";
import {
  createProgrammer,
  createProjectUpdate,
  createClientRequest,
  createProject,
  createVisualComment,
  getClientProject,
  listUsers,
  listVisualComments,
  parseGitHubRepositoryUrl,
  registerClient,
  requireActor,
  shouldIgnoreGithubPath,
  convertVisualCommentToTask,
} from "../src/server/portal/services";

function actors() {
  const db = resetPortalDatabaseForTests();
  return {
    db,
    admin: requireActor(db.users.find((user) => user.role === "admin")),
    client: requireActor(db.users.find((user) => user.role === "client")),
    programmer: requireActor(db.users.find((user) => user.role === "developer")),
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

  assert.equal(programmer.role, "developer");
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

test("developers can publish project updates visible to clients", () => {
  const { client, programmer } = actors();
  const update = createProjectUpdate(programmer, "prj_goosley", {
    title: "Homologacao liberada",
    description: "A equipe publicou uma nova versao para revisao do cliente.",
    status: "review",
    visibleToClient: true,
  });

  const project = getClientProject(client, "prj_goosley");
  assert.equal(project.updates.some((item) => item.id === update.id), true);
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

test("clients can request new demands for their project", () => {
  const { client } = actors();
  const task = createClientRequest(client, "prj_goosley", {
    title: "Adicionar area de reunioes",
    description: "Quero solicitar horarios com os desenvolvedores pelo portal.",
    priority: "high",
  });

  assert.equal(task.source, "client_request");
  assert.equal(task.createdByUserId, client.user.id);
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
