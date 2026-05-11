/**
 * Seed initial courses
 * @param {any} pool - Database connection pool
 */
const seedCourses = async (pool) => {
  const courseCheck = await pool.query('SELECT COUNT(*) FROM courses');
  if (parseInt(courseCheck.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO courses (name, description, duration, timing, mode, price, topics) VALUES
      (
        'Basic Baking Course',
        'Learn the fundamentals of baking from scratch. Perfect for beginners who want to start their baking journey.',
        '4 Weeks',
        '10 AM - 12 PM / 5 PM - 7 PM',
        'Online & Offline',
        4999.00,
        ARRAY['Cake Basics', 'Frosting Techniques', 'Cupcakes', 'Cookies', 'Bread Baking']
      ),
      (
        'Advanced Cake Decorating',
        'Master the art of professional cake decoration with fondant, sugar art, and wedding cake design.',
        '6 Weeks',
        'Sat & Sun 11 AM - 3 PM',
        'Offline',
        9999.00,
        ARRAY['Fondant Art', 'Wedding Cake Design', 'Tier Cakes', 'Chocolate Garnishing', 'Sugar Flowers']
      ),
      (
        'Eggless Baking Program',
        'Specialize in eggless baking techniques. Learn to create delicious cakes, cookies, and pastries without eggs.',
        '3 Weeks',
        'Daily 6 PM - 9:30 PM',
        'Online',
        2999.00,
        ARRAY['Eggless Sponges', 'Healthy Alternatives', 'Vegan Baking Basics', 'Eggless Pastries']
      )
    `);
    console.log('✅ Courses seeded successfully');
  }
};

module.exports = seedCourses;
