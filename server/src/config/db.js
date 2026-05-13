// @ts-check
const { Pool } = require('pg');
require('dotenv').config();

/** @type {import('pg').Pool} */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database Connection Error:', err.message);
    return;
  }
  release();
  console.log('Database Connected Successfully');
});

module.exports = pool;
