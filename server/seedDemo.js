require('dotenv').config();
const pool = require('./src/config/db');

async function seedDemo() {
  try {
    console.log('Seeding demo enrollments and videos...');

    // 1. Get all users
    const usersRes = await pool.query('SELECT id, name, phone, email FROM users');
    const users = usersRes.rows;

    if (users.length === 0) {
      console.log('No users found to enroll.');
      process.exit(0);
    }

    // 2. Get first course
    const coursesRes = await pool.query('SELECT id, name FROM courses LIMIT 1');
    if (coursesRes.rows.length === 0) {
      console.log('No courses found. Please ensure courses are seeded.');
      process.exit(0);
    }
    const course = coursesRes.rows[0];

    // 3. Enroll all users into the first course
    for (const user of users) {
      // Check if already enrolled
      const existing = await pool.query(
        'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [user.id, course.id]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO enrollments 
           (user_id, course_id, customer_name, phone, status) 
           VALUES ($1, $2, $3, $4, 'confirmed')`,
          [user.id, course.id, user.name || 'Demo User', user.phone || '9999999999']
        );
        console.log(`Enrolled user ${user.email} in course ${course.name}`);
      }
    }

    // 4. Add some demo videos to the course if none exist
    const videosRes = await pool.query('SELECT id FROM course_videos WHERE course_id = $1', [course.id]);
    if (videosRes.rows.length === 0) {
      const demoVideos = [
        { title: 'Introduction to Baking', duration: 15, url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { title: 'Essential Equipment', duration: 22, url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { title: 'Mixing Techniques', duration: 35, url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { title: 'Oven Calibration', duration: 10, url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      ];

      for (let i = 0; i < demoVideos.length; i++) {
        await pool.query(
          `INSERT INTO course_videos 
           (course_id, title, video_url, duration_minutes, order_index, is_free)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [course.id, demoVideos[i].title, demoVideos[i].url, demoVideos[i].duration, i + 1, i === 0]
        );
      }
      console.log(`Added ${demoVideos.length} demo videos to ${course.name}`);
    } else {
      console.log(`Course ${course.name} already has videos.`);
    }

    console.log('✅ Demo data seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

seedDemo();
