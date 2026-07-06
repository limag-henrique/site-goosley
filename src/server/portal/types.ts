export type UserRole = "client" | "developer" | "programmer" | "admin";
type UserStatus = "active" | "invited" | "suspended" | "disabled";
type ProjectStatus = "draft" | "active" | "paused" | "completed" | "cancelled";
type TaskStatus = "todo" | "in_progress" | "review" | "done" | "rejected" | "cancelled";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type TaskSource = "admin" | "client_request" | "visual_comment" | "github" | "system";
type ConversationType = "direct" | "project" | "support" | "broadcast";
type VisualCommentStatus = "open" | "acknowledged" | "converted_to_task" | "resolved" | "rejected";
type PaymentStatus = "pending" | "paid" | "verified" | "failed" | "refunded" | "cancelled";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  themePreference?: "light" | "dark" | "system";
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

interface ClientProfile {
  userId: string;
  companyName?: string;
  phone?: string;
  billingInfo?: Record<string, unknown>;
  notes?: string;
}

interface ProgrammerProfile {
  userId: string;
  displayName: string;
  skills: string[];
  githubUsername?: string;
  status: UserStatus;
  notes?: string;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progressPercentage: number;
  budgetEstimateCents?: number;
  finalPriceCents?: number;
  grossAmountPaidByClientCents: number;
  currency: string;
  githubUrl?: string;
  stagingUrl?: string;
  productionUrl?: string;
  codeStatus?: string;
  technicalNotes?: string;
  liveUrl?: string;
  repositoryUrl?: string;
  performanceUrl?: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectMember {
  projectId: string;
  programmerId: string;
  roleInProject: string;
  assignedByAdminId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  assignedToProgrammerId?: string;
  createdByUserId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  source: TaskSource;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  order: number;
  visibleToClient: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  id: string;
  projectId?: string;
  participantIds: string[];
  createdByUserId: string;
  type: ConversationType;
  createdAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachments: string[];
  readAt?: string;
  createdAt: string;
}

export interface VisualComment {
  id: string;
  projectId: string;
  clientId: string;
  url: string;
  pageTitle?: string;
  xPercent: number;
  yPercent: number;
  viewportWidth: number;
  viewportHeight: number;
  cssSelector?: string;
  elementText?: string;
  screenshotUrl?: string;
  comment: string;
  status: VisualCommentStatus;
  linkedTaskId?: string;
  createdAt: string;
  updatedAt: string;
}

interface GitHubRepository {
  id: string;
  projectId: string;
  repositoryUrl: string;
  owner: string;
  repo: string;
  defaultBranch: string;
  addedByUserId: string;
  lastSyncedAt?: string;
  syncStatus: "pending" | "synced" | "failed";
  createdAt: string;
}

interface Payment {
  id: string;
  projectId: string;
  clientId: string;
  grossAmountCents: number;
  currency: string;
  status: PaymentStatus;
  dueDate?: string;
  paymentProvider?: string;
  providerReference?: string;
  paidAt?: string;
  verifiedByAdminId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Budget {
  id: string;
  clientId: string;
  projectId?: string;
  title: string;
  description: string;
  estimatedValueCents: number;
  status: "draft" | "submitted" | "approved" | "rejected" | "converted";
  createdAt: string;
  updatedAt: string;
}

export interface SystemSetting {
  key: string;
  value: unknown;
  description: string;
  updatedByAdminId?: string;
  updatedAt: string;
}

interface PasswordResetToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  readAt?: string;
  createdAt: string;
}

interface Session {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface PortalDatabase {
  users: User[];
  clientProfiles: ClientProfile[];
  programmerProfiles: ProgrammerProfile[];
  projects: Project[];
  projectMembers: ProjectMember[];
  tasks: Task[];
  projectUpdates: ProjectUpdate[];
  conversations: Conversation[];
  messages: Message[];
  visualComments: VisualComment[];
  githubRepositories: GitHubRepository[];
  payments: Payment[];
  budgets: Budget[];
  systemSettings: SystemSetting[];
  auditLogs: AuditLog[];
  passwordResetTokens: PasswordResetToken[];
  notifications: Notification[];
  sessions: Session[];
}

export interface RequestActor {
  user: User;
  ipAddress?: string;
  userAgent?: string;
}
