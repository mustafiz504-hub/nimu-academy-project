require('dotenv').config();
const pool = require('./src/config/db');

async function addFree() {
  try {
    const res = await pool.query(
      'INSERT INTO courses (name, description, duration, timing, mode, price, topics, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', 
      ['Free Baking Masterclass', 'A completely free starter course for everyone to learn the absolute basics of baking.', '1 Week', 'Flexible', 'Online', 0, ['Kitchen Safety', 'Measuring Ingredients', 'First Loaf'], true]
    );
    console.log("Added free course:", res.rows[0]);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
addFree();
