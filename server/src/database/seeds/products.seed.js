/**
 * Seed initial products
 * @param {any} pool - Database connection pool
 */
const seedProducts = async (pool) => {
  const productCheck = await pool.query('SELECT COUNT(*) FROM products');
  if (parseInt(productCheck.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO products (name, description, price, category) VALUES
      ('Birthday Cake', 'Custom birthday cakes made with love. Available in various flavors and sizes.', 599.00, 'Cake'),
      ('Wedding Cake', 'Elegant multi-tier wedding cakes designed to make your special day memorable.', 2999.00, 'Cake'),
      ('Cupcakes Box of 6', 'Assorted flavored cupcakes with creamy frosting. Perfect for celebrations.', 349.00, 'Cupcakes'),
      ('Pastries Box of 4', 'Fresh baked pastries including croissants, danishes, and more.', 299.00, 'Pastries'),
      ('Black Forest Cake', 'Classic black forest cake with chocolate layers, whipped cream, and cherries.', 699.00, 'Cake'),
      ('Custom Cake', 'Fully customized cakes designed according to your requirements and theme.', 999.00, 'Cake')
    `);
    console.log('✅ Products seeded successfully');
  }
};

module.exports = seedProducts;
