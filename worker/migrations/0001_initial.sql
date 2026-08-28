-- Users table (mirror of Cloudflare Access identity)
CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Daily entries
CREATE TABLE IF NOT EXISTS entries (
  user_email TEXT NOT NULL,
  date TEXT NOT NULL,
  class INTEGER NOT NULL DEFAULT 0,
  class_price REAL,
  game INTEGER NOT NULL DEFAULT 0,
  game_price REAL,
  extras TEXT NOT NULL DEFAULT '[]',
  note TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_email, date),
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entries_user_updated
  ON entries(user_email, updated_at DESC);

-- User config (one row per user)
CREATE TABLE IF NOT EXISTS config (
  user_email TEXT PRIMARY KEY,
  class_price REAL NOT NULL DEFAULT 80,
  game_price REAL NOT NULL DEFAULT 30,
  currency TEXT NOT NULL DEFAULT 'BRL',
  professor_name TEXT NOT NULL DEFAULT '',
  notification_hour_offset INTEGER NOT NULL DEFAULT 1,
  schedule TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);

-- Paid months
CREATE TABLE IF NOT EXISTS paid_months (
  user_email TEXT NOT NULL,
  month TEXT NOT NULL,
  paid_at TEXT NOT NULL,
  PRIMARY KEY (user_email, month),
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_paid_months_user
  ON paid_months(user_email, paid_at DESC);
