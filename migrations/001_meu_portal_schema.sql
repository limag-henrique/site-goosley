-- Draft production schema for Meu Portal.
-- The current app uses a local TypeScript store for development and tests.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'programmer', 'admin')),
  status TEXT NOT NULL CHECK (status IN ('active', 'invited', 'suspended', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  last_login_at TIMESTAMPTZ
);

CREATE TABLE client_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  company_name TEXT,
  phone TEXT,
  billing_info JSONB,
  notes TEXT
);

CREATE TABLE programmer_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  display_name TEXT NOT NULL,
  skills JSONB NOT NULL DEFAULT '[]',
  github_username TEXT,
  hourly_reference_rate_cents INTEGER NOT NULL DEFAULT 0,
  payout_info JSONB,
  status TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  gross_amount_paid_by_client_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  live_url TEXT,
  repository_url TEXT,
  performance_url TEXT,
  start_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE project_members (
  project_id TEXT NOT NULL REFERENCES projects(id),
  programmer_id TEXT NOT NULL REFERENCES users(id),
  role_in_project TEXT NOT NULL,
  assigned_by_admin_id TEXT NOT NULL REFERENCES users(id),
  participation_weight_override NUMERIC,
  participation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (project_id, programmer_id)
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  assigned_to_programmer_id TEXT REFERENCES users(id),
  created_by_user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  source TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  estimated_hours NUMERIC,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE TABLE project_updates (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  visible_to_client BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  participant_ids JSONB NOT NULL DEFAULT '[]',
  created_by_user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  sender_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE visual_comments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  client_id TEXT NOT NULL REFERENCES users(id),
  url TEXT NOT NULL,
  page_title TEXT,
  x_percent NUMERIC NOT NULL,
  y_percent NUMERIC NOT NULL,
  viewport_width INTEGER NOT NULL,
  viewport_height INTEGER NOT NULL,
  css_selector TEXT,
  element_text TEXT,
  screenshot_url TEXT,
  comment TEXT NOT NULL,
  status TEXT NOT NULL,
  linked_task_id TEXT REFERENCES tasks(id),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE time_entries (
  id TEXT PRIMARY KEY,
  programmer_id TEXT NOT NULL REFERENCES users(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  task_id TEXT REFERENCES tasks(id),
  repository_url TEXT NOT NULL,
  description TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  admin_review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX one_running_timer_per_programmer
ON time_entries(programmer_id)
WHERE status = 'running';

CREATE TABLE github_repositories (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  repository_url TEXT NOT NULL,
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  default_branch TEXT NOT NULL,
  added_by_user_id TEXT NOT NULL REFERENCES users(id),
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE github_commit_metrics (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  repository_id TEXT NOT NULL REFERENCES github_repositories(id),
  programmer_id TEXT REFERENCES users(id),
  github_author_name TEXT NOT NULL,
  github_author_email TEXT NOT NULL,
  commit_sha TEXT NOT NULL,
  commit_date TIMESTAMPTZ NOT NULL,
  message TEXT NOT NULL,
  effective_lines_added INTEGER NOT NULL DEFAULT 0,
  effective_lines_deleted INTEGER NOT NULL DEFAULT 0,
  effective_lines_modified INTEGER NOT NULL DEFAULT 0,
  ignored_lines INTEGER NOT NULL DEFAULT 0,
  ignored_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  client_id TEXT NOT NULL REFERENCES users(id),
  gross_amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_provider TEXT,
  provider_reference TEXT,
  paid_at TIMESTAMPTZ,
  verified_by_admin_id TEXT REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE earnings_calculations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  gross_amount_cents INTEGER NOT NULL,
  tax_and_fees_amount_cents INTEGER NOT NULL,
  henrique_amount_cents INTEGER NOT NULL,
  programmer_pool_amount_cents INTEGER NOT NULL,
  calculation_version INTEGER NOT NULL,
  calculated_by_user_id TEXT NOT NULL,
  admin_override BOOLEAN NOT NULL DEFAULT FALSE,
  finalized BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE programmer_earnings (
  id TEXT PRIMARY KEY,
  calculation_id TEXT NOT NULL REFERENCES earnings_calculations(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  programmer_id TEXT NOT NULL REFERENCES users(id),
  participation_percent NUMERIC NOT NULL,
  github_effective_lines INTEGER NOT NULL DEFAULT 0,
  manual_adjustment_amount_cents INTEGER NOT NULL DEFAULT 0,
  manual_adjustment_reason TEXT,
  final_amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE payout_requests (
  id TEXT PRIMARY KEY,
  programmer_id TEXT NOT NULL REFERENCES users(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL,
  reviewed_by_admin_id TEXT REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT NOT NULL,
  updated_by_admin_id TEXT REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before JSONB,
  after JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL
);
