-- Migration file to fix user ID types in additional tables

-- 1. First create backups of affected tables
CREATE TABLE IF NOT EXISTS user_progress_backup AS SELECT * FROM user_progress;
CREATE TABLE IF NOT EXISTS quiz_attempts_backup AS SELECT * FROM quiz_attempts;
CREATE TABLE IF NOT EXISTS certificates_backup AS SELECT * FROM certificates;

-- 2. Drop the original tables
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS certificates;

-- 3. Recreate user_progress with integer user_id
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  module_id INTEGER REFERENCES modules(id),
  lesson_id INTEGER REFERENCES lessons(id),
  completed BOOLEAN DEFAULT FALSE,
  percentage_complete REAL DEFAULT 0,
  last_accessed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Recreate quiz_attempts with integer user_id
CREATE TABLE quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id),
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  time_spent INTEGER,
  completed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Recreate certificates with integer user_id
CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  certificate_id TEXT NOT NULL,
  issue_date TIMESTAMP NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Update the schema.ts file to match these changes (this will be done in the code)
-- Table schemas should be updated to use integer for user_id fields