const bcrypt = require('bcryptjs');

/**
 * Seed the superadmin user
 * @param {any} pool - Database connection pool
 */
const seedSuperadmin = async (pool) => {
  const superadminEmailsRaw = process.env.SUPERADMIN_EMAIL;
  if (!superadminEmailsRaw) {
    throw new Error('SUPERADMIN_EMAIL environment variable is missing in .env');
  }
  const superadminEmails = superadminEmailsRaw.split(',').map(e => e.trim()).filter(Boolean);
  
  const defaultPassword = process.env.SUPERADMIN_PASSWORD;
  if (!defaultPassword) {
    throw new Error('SUPERADMIN_PASSWORD environment variable is missing in .env');
  }
  
  for (const email of superadminEmails) {
    const superadminCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    
    // Generate a user-friendly default name from the email address
    const defaultName = email.split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    if (superadminCheck.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, 'superadmin')",
        [defaultName, email, hashedPassword, '0000000000']
      );
      console.log(`✅ Superadmin created dynamically: ${email}`);
    } else {
      await pool.query(
        "UPDATE users SET role = 'superadmin', password = $1 WHERE email = $2",
        [hashedPassword, email]
      );
      console.log(`✅ Superadmin password and role updated dynamically: ${email}`);
    }
  }
};

module.exports = seedSuperadmin;
