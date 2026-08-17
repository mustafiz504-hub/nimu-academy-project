const fs = require('fs');
const path = require('path');

/**
 * Runs all SQL migration files in /migrations directory.
 * Uses a migrations_log table to track which have already run (idempotent).
 * @param {any} pool - Database connection pool
 */
const runMigrations = async (pool) => {
  try {
    // Ensure migration tracking table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Run in alphabetical (numeric) order

    for (const file of files) {
      // Check if already applied
      const existing = await pool.query(
        'SELECT id FROM migrations_log WHERE filename = $1',
        [file]
      );

      if (existing.rows.length > 0) {
        console.log(`⏭️  Migration already applied: ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      await pool.query(sql);
      await pool.query('INSERT INTO migrations_log (filename) VALUES ($1)', [file]);
      
      console.log(`✅ Migration applied: ${file}`);
    }

    console.log('🗄️  Database migrations complete');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    // Don't throw — let server still start (non-critical for dev)
    // In production you may want to throw here
  }
};

module.exports = runMigrations;
