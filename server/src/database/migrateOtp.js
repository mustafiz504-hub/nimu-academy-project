const pool = require('../config/db');

async function migrate() {
  try {
    console.log('🔄 Running database migration for OTP columns...');
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6),
      ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS otp_attempts INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_otp_sent_at TIMESTAMP;
    `);
    console.log('✅ Migration successful! User OTP columns added.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
