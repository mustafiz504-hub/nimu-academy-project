const usersTable = require('./tables/users.table');
const coursesTable = require('./tables/courses.table');
const productsTable = require('./tables/products.table');
const ordersTable = require('./tables/orders.table');
const enrollmentsTable = require('./tables/enrollments.table');
const activityLogsTable = require('./tables/activityLogs.table');
const galleryTable = require('./tables/gallery.table');

/**
 * Creates database tables if they do not exist.
 * @param {any} pool - Database connection pool
 * @returns {Promise<void>}
 */
const createTables = async (pool) => {
  try {
    // ── Order is important for foreign keys ──
    await pool.query(usersTable);
    await pool.query(coursesTable);
    await pool.query(productsTable);
    await pool.query(ordersTable);
    await pool.query(enrollmentsTable);
    await pool.query(activityLogsTable);
    await pool.query(galleryTable);

    console.log('🚀 Database Tables Synced Successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error instanceof Error ? error.message : error);
    throw error;
  }
};

module.exports = createTables;
