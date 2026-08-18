// @ts-check
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');
const setupSwagger = require('./swagger/config');

// Database Orchestrators
const createTables = require('./database/createTables');
const runMigrations = require('./database/runMigrations');
const seedData = require('./database/seedData');

/** @type {import('express').Express} */
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads - adjusted path for src/ structure
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Serve Public assets (certificate templates, etc.)
app.use('/public', express.static(path.join(__dirname, '../public')));

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
app.use('/api/gallery',     require('./routes/gallery.routes'));
app.use('/api/students',    require('./routes/student.routes'));
app.use('/api/admin',       require('./routes/admin.routes'));
app.use('/api/superadmin',  require('./routes/superadmin.routes'));
app.use('/api/progress',    require('./routes/progress.routes'));
app.use('/api/payments',    require('./routes/payment.routes'));


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

const os = require('os');

const getNetworkIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Database Initialization
    await createTables(pool);
    await runMigrations(pool);
    await seedData(pool);

    app.listen(PORT, '0.0.0.0', () => {
      const netIp = getNetworkIp();
      console.log(`\n🚀 Nimu Academy Server Running on port ${PORT} (0.0.0.0)`);
      console.log(`📡 Local API URL: http://localhost:${PORT}/api`);
      console.log(`📡 Network API URL: http://${netIp}:${PORT}/api`);
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
