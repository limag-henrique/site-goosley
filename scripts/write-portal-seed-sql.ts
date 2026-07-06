import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { hashPassword, nowIso } from "../src/server/portal/security";
import { createSeedDatabase } from "../src/server/portal/store";

const outputPath = resolve("scripts", "portal-seed.sql");
const adminEmail = process.env.PORTAL_ADMIN_EMAIL;
const adminPassword = process.env.PORTAL_ADMIN_PASSWORD;

if (!adminEmail) {
  throw new Error("Set PORTAL_ADMIN_EMAIL before generating the production seed.");
}

if (!adminPassword || adminPassword === "Portal123!" || adminPassword.length < 12) {
  throw new Error("Set PORTAL_ADMIN_PASSWORD to a strong password with at least 12 characters.");
}

const timestamp = nowIso();
const db = createSeedDatabase();
const admin = db.users.find((user) => user.role === "admin");

if (!admin) {
  throw new Error("Seed database did not include an admin user.");
}

admin.email = adminEmail;
admin.passwordHash = hashPassword(adminPassword);
admin.createdAt = timestamp;
admin.updatedAt = timestamp;
admin.lastLoginAt = undefined;

db.users = [admin];
db.clientProfiles = [];
db.programmerProfiles = [];
db.projects = [];
db.projectMembers = [];
db.tasks = [];
db.projectUpdates = [];
db.conversations = [];
db.messages = [];
db.visualComments = [];
db.githubRepositories = [];
db.payments = [];
db.budgets = [];
db.passwordResetTokens = [];
db.notifications = [];
db.sessions = [];
db.auditLogs = [
  {
    id: "aud_production_seed",
    actorUserId: admin.id,
    action: "seed.created",
    entityType: "system",
    entityId: "portal",
    after: { adminEmail },
    createdAt: timestamp,
  },
];
db.systemSettings = db.systemSettings.map((setting) => ({
  ...setting,
  updatedByAdminId: admin.id,
  updatedAt: timestamp,
}));

const escapedSnapshot = JSON.stringify(db).replaceAll("'", "''");
const escapedTimestamp = timestamp.replaceAll("'", "''");

const sql = `INSERT INTO portal_state (key, value, updated_at)
VALUES ('default', '${escapedSnapshot}', '${escapedTimestamp}')
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value,
  updated_at = excluded.updated_at;
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, sql);

console.log(`Production portal seed written to ${outputPath}.`);
