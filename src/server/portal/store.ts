import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { PortalDatabase, SystemSetting } from "./types";
import { createId, hashPassword, nowIso } from "./security";

declare global {
  var goosleyPortalDatabase: PortalDatabase | undefined;
}

type D1Result<T = unknown> = {
  results?: T[];
};

type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
};

type D1DatabaseBinding = {
  prepare(query: string): D1Statement;
};

type PortalStateRow = {
  value: string;
};

const PORTAL_STATE_KEY = "default";

const defaultSettings = (adminId: string, timestamp: string): SystemSetting[] => [
  {
    key: "github.defaultBranch",
    value: "main",
    description: "Fallback branch for repositories added without branch metadata.",
    updatedByAdminId: adminId,
    updatedAt: timestamp,
  },
];

export function createSeedDatabase(): PortalDatabase {
  const timestamp = nowIso();
  const adminId = "usr_admin";
  const clientId = "usr_client";
  const programmerId = "usr_caetano";
  const developerIds = ["usr_caetano", "usr_raul", "usr_rodrigo", "usr_rick"];
  const projectId = "prj_goosley";
  const repositoryId = "ghr_goosley_site";
  const conversationId = "cnv_goosley";

  return {
    users: [
      {
        id: adminId,
        name: "Henrique",
        email: "admin@goosley.local",
        passwordHash: hashPassword("Portal123!"),
        role: "admin",
        themePreference: "dark",
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: clientId,
        name: "Cliente Demo",
        email: "cliente@goosley.local",
        passwordHash: hashPassword("Portal123!"),
        role: "client",
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: programmerId,
        name: "Caetano",
        email: "caetano@goosley.local",
        passwordHash: hashPassword("Portal123!"),
        role: "developer",
        themePreference: "dark",
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "usr_raul",
        name: "Raul",
        email: "raul@goosley.local",
        passwordHash: hashPassword("Portal123!"),
        role: "developer",
        themePreference: "dark",
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "usr_rodrigo",
        name: "Rodrigo",
        email: "rodrigo@goosley.local",
        passwordHash: hashPassword("Portal123!"),
        role: "developer",
        themePreference: "dark",
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "usr_rick",
        name: "Rick",
        email: "rick@goosley.local",
        passwordHash: hashPassword("Portal123!"),
        role: "developer",
        themePreference: "dark",
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    clientProfiles: [
      {
        userId: clientId,
        companyName: "Cliente Demo Ltda",
        phone: "+55 11 90000-0000",
        billingInfo: { document: "demo" },
      },
    ],
    programmerProfiles: [
      ...[
        ["usr_caetano", "Caetano", "caetano-dev", ["Next.js", "TypeScript", "Cloudflare"]],
        ["usr_raul", "Raul", "raul-dev", ["React", "UX", "Automation"]],
        ["usr_rodrigo", "Rodrigo", "rodrigo-dev", ["API", "Security", "D1"]],
        ["usr_rick", "Rick", "rick-dev", ["Full-stack", "QA", "Deploy"]],
      ].map(([userId, displayName, githubUsername, skills]) => ({
        userId: String(userId),
        displayName: String(displayName),
        skills: skills as string[],
        githubUsername: String(githubUsername),
        status: "active" as const,
      })),
    ],
    projects: [
      {
        id: projectId,
        clientId,
        title: "Meu Portal Goosley",
        description: "Portal operacional com acompanhamento de projeto, tarefas, comentarios e financeiro do cliente.",
        status: "active",
        progressPercentage: 68,
        budgetEstimateCents: 1200000,
        finalPriceCents: 1000000,
        grossAmountPaidByClientCents: 1000000,
        currency: "BRL",
        githubUrl: "https://github.com/goosley/site-goosley",
        stagingUrl: "https://staging.goosley.local",
        productionUrl: "https://goosley.local",
        codeStatus: "Em desenvolvimento",
        technicalNotes: "Base preparada para Cloudflare Workers, D1, R2, KV, Turnstile e email transacional.",
        liveUrl: "https://goosley.local",
        repositoryUrl: "https://github.com/goosley/site-goosley",
        performanceUrl: "https://pagespeed.web.dev/",
        startDate: timestamp,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    projectMembers: [
      ...developerIds.map((developerId) => ({
        projectId,
        programmerId: developerId,
        roleInProject: developerId === "usr_caetano" ? "lead full-stack" : "developer",
        assignedByAdminId: adminId,
        createdAt: timestamp,
      })),
    ],
    tasks: [
      {
        id: "tsk_seed",
        projectId,
        assignedToProgrammerId: programmerId,
        createdByUserId: adminId,
        title: "Implementar base do portal",
        description: "Criar autenticacao, RBAC, dashboards e endpoints iniciais.",
        status: "in_progress",
        priority: "high",
        source: "admin",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "tsk_review",
        projectId,
        assignedToProgrammerId: "usr_rodrigo",
        createdByUserId: adminId,
        title: "Revisar seguranca das rotas",
        description: "Validar RBAC, reset de senha, auditoria e protecao contra acesso indevido.",
        status: "review",
        priority: "urgent",
        source: "admin",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    projectUpdates: [
      {
        id: "upd_seed",
        projectId,
        title: "Backend em estruturacao",
        description: "Rotas, permissoes e modelos foram mapeados para o Meu Portal.",
        status: "active",
        order: 1,
        visibleToClient: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    conversations: [
      {
        id: conversationId,
        projectId,
        participantIds: [clientId, programmerId, adminId],
        createdByUserId: adminId,
        type: "project",
        createdAt: timestamp,
      },
    ],
    messages: [
      {
        id: "msg_seed",
        conversationId,
        senderId: adminId,
        body: "Bem-vindos ao Meu Portal. As atualizacoes do projeto ficarao centralizadas aqui.",
        attachments: [],
        createdAt: timestamp,
      },
    ],
    visualComments: [],
    githubRepositories: [
      {
        id: repositoryId,
        projectId,
        repositoryUrl: "https://github.com/goosley/site-goosley",
        owner: "goosley",
        repo: "site-goosley",
        defaultBranch: "main",
        addedByUserId: adminId,
        lastSyncedAt: timestamp,
        syncStatus: "synced",
        createdAt: timestamp,
      },
    ],
    payments: [
      {
        id: "pay_seed",
        projectId,
        clientId,
        grossAmountCents: 1000000,
        currency: "BRL",
        status: "verified",
        dueDate: timestamp,
        paymentProvider: "manual",
        providerReference: "seed-payment",
        paidAt: timestamp,
        verifiedByAdminId: adminId,
        notes: "Seed payment for local development.",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    budgets: [
      {
        id: "bdg_seed",
        clientId,
        projectId,
        title: "Portal operacional Goosley",
        description: "Dashboard por perfil, mensagens, pagamentos, projetos e autenticacao segura.",
        estimatedValueCents: 1200000,
        status: "approved",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    systemSettings: defaultSettings(adminId, timestamp),
    auditLogs: [
      {
        id: "aud_seed",
        actorUserId: adminId,
        action: "seed.created",
        entityType: "system",
        entityId: "portal",
        after: { seedUsers: ["admin@goosley.local", "cliente@goosley.local", "caetano@goosley.local", "raul@goosley.local", "rodrigo@goosley.local", "rick@goosley.local"] },
        createdAt: timestamp,
      },
    ],
    passwordResetTokens: [],
    notifications: [
      {
        id: createId("ntf"),
        userId: programmerId,
        type: "task.assigned",
        title: "Nova tarefa atribuida",
        body: "Implementar base do portal",
        link: "/meu-portal/programmer",
        createdAt: timestamp,
      },
    ],
    sessions: [],
  };
}

export function getDb() {
  if (!globalThis.goosleyPortalDatabase) {
    globalThis.goosleyPortalDatabase = createSeedDatabase();
  }

  return globalThis.goosleyPortalDatabase;
}

export async function loadPortalDatabaseFromD1() {
  const d1 = getD1Binding();
  if (!d1) {
    return getDb();
  }

  await ensurePortalStateTable(d1);
  const row = await d1
    .prepare("SELECT value FROM portal_state WHERE key = ?")
    .bind(PORTAL_STATE_KEY)
    .first<PortalStateRow>();

  if (row?.value) {
    globalThis.goosleyPortalDatabase = JSON.parse(row.value) as PortalDatabase;
    return globalThis.goosleyPortalDatabase;
  }

  if (process.env.PORTAL_ALLOW_DEMO_SEED === "1") {
    const seeded = getDb();
    await savePortalDatabaseToD1(seeded, d1);
    return seeded;
  }

  throw new Error("Portal D1 state is empty. Generate and apply migrations/seed.sql before using the portal.");
}

export async function savePortalDatabaseToD1(database = getDb(), existingD1?: D1DatabaseBinding) {
  const d1 = existingD1 || getD1Binding();
  if (!d1) {
    return;
  }

  await ensurePortalStateTable(d1);
  await d1
    .prepare(
      `INSERT INTO portal_state (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`
    )
    .bind(PORTAL_STATE_KEY, JSON.stringify(database), nowIso())
    .run();
}

export async function withPortalPersistence<T>(operation: () => T | Promise<T>, options: { persist?: boolean } = {}) {
  await loadPortalDatabaseFromD1();
  const result = await operation();

  if (options.persist) {
    await savePortalDatabaseToD1();
  }

  return result;
}

export function resetPortalDatabaseForTests() {
  globalThis.goosleyPortalDatabase = createSeedDatabase();
  return globalThis.goosleyPortalDatabase;
}

function getD1Binding() {
  try {
    const context = getCloudflareContext({ async: false });
    return (context.env as CloudflareEnv & { DB?: D1DatabaseBinding }).DB;
  } catch {
    return undefined;
  }
}

async function ensurePortalStateTable(d1: D1DatabaseBinding) {
  await d1
    .prepare(
      `CREATE TABLE IF NOT EXISTS portal_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    )
    .run();
}
