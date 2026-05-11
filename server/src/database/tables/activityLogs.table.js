const activityLogsTable = `
  CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

module.exports = activityLogsTable;
