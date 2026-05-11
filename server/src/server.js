// @ts-check
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');
const setupSwagger = require('./swagger/config');

// Database Orchestrators
const createTables = require('./database/createTables');
const seedData = require('./database/seedData');

/** @type {import('express').Express} */
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://192.168.1.140:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads - adjusted path for src/ structure
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Swagger Setup ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
setupSwagger(app, PORT);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/upload',      require('./routes/upload.routes'));
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/user',        require('./routes/user.routes'));
app.use('/api/orders',      require('./routes/order.routes'));
app.use('/api/enrollments', require('./routes/enrollment.routes'));
app.use('/api/courses',     require('./routes/course.routes'));
app.use('/api/products',    require('./routes/product.routes'));
app.use('/api/admin',       require('./routes/admin.routes'));
app.use('/api/superadmin',  require('./routes/superadmin.routes'));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
/** @type {import('express').ErrorRequestHandler} */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Database Initialization
    await createTables(pool);
    await seedData(pool);

    app.listen(PORT, () => {
      console.log(`\n🚀 Nimu Academy Server Running on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📑 Swagger Docs: http://localhost:${PORT}/api-docs`);
      console.log('-------------------------------------------');
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
