const seedSuperadmin = require('./seeds/superadmin.seed');
const seedCourses = require('./seeds/courses.seed');
const seedProducts = require('./seeds/products.seed');

/**
 * Seeds the database with initial data.
 * @param {any} pool - Database connection pool
 * @returns {Promise<void>}
 */
const seedData = async (pool) => {
  try {
    await seedSuperadmin(pool);
    await seedCourses(pool);
    await seedProducts(pool);
    console.log('✨ Data Seeding Completed');
  } catch (error) {
    console.error('❌ Error seeding data:', error instanceof Error ? error.message : error);
  }
};

module.exports = seedData;
