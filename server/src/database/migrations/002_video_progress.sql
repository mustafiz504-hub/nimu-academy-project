-- ── Video Progress Tracking ──────────────────────────────────────────────────
-- Tracks which videos a user has watched (marked as completed).
-- One row per user+video. Upsert-safe via UNIQUE constraint.

CREATE TABLE IF NOT EXISTS video_progress (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id  INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  video_id   INTEGER NOT NULL REFERENCES course_videos(id) ON DELETE CASCADE,
  watched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_video_progress_user ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_course ON video_progress(user_id, course_id);
