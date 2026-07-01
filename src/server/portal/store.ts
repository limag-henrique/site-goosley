import type { PortalDatabase, SystemSetting } from "./types";
import { createId, hashPassword, nowIso } from "./security";

declare global {
  var goosleyPortalDatabase: PortalDatabase | undefined;
}

const defaultSettings = (adminId: string, timestamp: string): SystemSetting[] => [
  {
    key: "revenue.taxAndFeesPercent",
    value: 50,
    description: "Default tax, fees, and operating reserve percentage.",
    updatedByAdminId: adminId,
    updatedAt: timestamp,
  },
  {
    key: "revenue.henriquePercent",
    value: 25,
    description: "Default revenue share percentage for the configured internal recipient.",
    updatedByAdminId: adminId,
    updatedAt: timestamp,
  },
  {
    key: "revenue.programmerPoolPercent",
    value: 25,
    description: "Default programmer pool percentage.",
    updatedByAdminId: adminId,
    updatedAt: timestamp,
  },
  {
    key: "revenue.internalRecipientName",
    value: "Henrique Lima Gusmao",
    description: "Configurable internal revenue recipient.",
    updatedByAdminId: adminId,
    updatedAt: timestamp,
  },
  {
    key: "github.defaultBranch",
    value: "main",
    description: "Fallback branch for repositories added without branch metadata.",
    updatedByAdminId: adminId,
    updatedAt: timestamp,
  },
];

function createSeedDatabase(): PortalDatabase {
  const timestamp = nowIso();
  const adminId = "usr_admin";
  const clientId = "usr_client";
  const programmerId = "usr_programmer";
  const projectId = "prj_goosley";
  const repositoryId = "ghr_goosley_site";
  const conversationId = "cnv_goosley";
  const calculationId = "calc_seed";

  return {
    users: [
      {
        id: adminId,
        name: "Henrique Lima Gusmao",
        email: "admin@goosley.local",
        passwordHash: hashPassword("Portal123!"),
        role: "admin",
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
        name: "Programador Demo",
        email: "programador@goosley.local",
        passwordHash: hashPassword("Portal123!"),
        role: "programmer",
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
      {
        userId: programmerId,
        displayName: "Programador Demo",
        skills: ["Next.js", "TypeScript", "Automations"],
        githubUsername: "goosley-dev",
        hourlyReferenceRateCents: 12000,
        status: "active",
      },
    ],
    projects: [
      {
        id: projectId,
        clientId,
        title: "Meu Portal Goosley",
        description: "Portal operacional com acompanhamento de projeto, tarefas, comentarios e ganhos.",
        status: "active",
        grossAmountPaidByClientCents: 1000000,
        currency: "BRL",
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
      {
        projectId,
        programmerId,
        roleInProject: "full-stack",
        assignedByAdminId: adminId,
        createdAt: timestamp,
      },
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
        estimatedHours: 12,
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
    timeEntries: [],
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
    githubCommitMetrics: [
      {
        id: "ghm_seed",
        projectId,
        repositoryId,
        programmerId,
        githubAuthorName: "Programador Demo",
        githubAuthorEmail: "programador@goosley.local",
        commitSha: "seed",
        commitDate: timestamp,
        message: "Seed portal metric",
        effectiveLinesAdded: 750,
        effectiveLinesDeleted: 20,
        effectiveLinesModified: 250,
        ignoredLines: 80,
        ignoredReason: "Generated files and lock files ignored.",
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
        paymentProvider: "manual",
        providerReference: "seed-payment",
        paidAt: timestamp,
        verifiedByAdminId: adminId,
        notes: "Seed payment for local development.",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    earningsCalculations: [
      {
        id: calculationId,
        projectId,
        grossAmountCents: 1000000,
        taxAndFeesAmountCents: 500000,
        henriqueAmountCents: 250000,
        programmerPoolAmountCents: 250000,
        calculationVersion: 1,
        calculatedByUserId: "system",
        adminOverride: false,
        finalized: false,
        notes: "Seed calculation.",
        createdAt: timestamp,
      },
    ],
    programmerEarnings: [
      {
        id: "ern_seed",
        calculationId,
        projectId,
        programmerId,
        participationPercent: 100,
        githubEffectiveLines: 1000,
        manualAdjustmentAmountCents: 0,
        finalAmountCents: 250000,
        status: "available",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    payoutRequests: [],
    systemSettings: defaultSettings(adminId, timestamp),
    auditLogs: [
      {
        id: "aud_seed",
        actorUserId: adminId,
        action: "seed.created",
        entityType: "system",
        entityId: "portal",
        after: { seedUsers: ["admin@goosley.local", "cliente@goosley.local", "programador@goosley.local"] },
        createdAt: timestamp,
      },
    ],
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

export function resetPortalDatabaseForTests() {
  globalThis.goosleyPortalDatabase = createSeedDatabase();
  return globalThis.goosleyPortalDatabase;
}
