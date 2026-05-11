const bcrypt = require('bcryptjs');

/**
 * Seed the superadmin user
 * @param {any} pool - Database connection pool
 */
const seedSuperadmin = async (pool) => {
  const superadminEmail = process.env.SUPERADMIN_EMAIL || 'muskan@nimu.com';
  const superadminCheck = await pool.query('SELECT id FROM users WHERE email = $1', [superadminEmail]);
  
  if (superadminCheck.rows.length === 0) {
    const hashedPassword = await bcrypt.hash('Nimu@2026', 12);
    await pool.query(
      "INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, 'superadmin')",
      ['Muskan Naz', superadminEmail, hashedPassword, '9777240070']
    );
    console.log(`✅ Superadmin created: ${superadminEmail}`);
  }
};

module.exports = seedSuperadmin;
