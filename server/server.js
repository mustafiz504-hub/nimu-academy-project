require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Swagger Setup ────────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nimu Academy API',
      version: '1.0.0',
      description: 'Nimu Cooking Academy Backend APIs',
    },
    servers: [{ url: 'http://localhost:8000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/user',        require('./routes/user.routes'));
app.use('/api/orders',      require('./routes/order.routes'));
app.use('/api/enrollments', require('./routes/enrollment.routes'));
app.use('/api/courses',     require('./routes/course.routes'));
app.use('/api/products',    require('./routes/product.routes'));
app.use('/api/admin',       require('./routes/admin.routes'));
app.use('/api/superadmin',  require('./routes/superadmin.routes'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nimu Academy API is running.', 
    version: '1.0.0',
    endpoints: ['/api/auth', '/api/user', '/api/orders', '/api/enrollments', '/api/courses', '/api/products', '/api/admin', '/api/superadmin']
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

// ─── DB Setup: Create Tables ──────────────────────────────────────────────────
const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(15),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        duration VARCHAR(50),
        timing VARCHAR(100),
        mode VARCHAR(20),
        price DECIMAL(10,2),
        topics TEXT[],
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        category VARCHAR(50),
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        customer_name VARCHAR(100),
        phone VARCHAR(15),
        address TEXT,
        flavor VARCHAR(50),
        size VARCHAR(20),
        custom_message TEXT,
        delivery_date DATE,
        special_instructions TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        total_price DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
        student_name VARCHAR(100),
        phone VARCHAR(15),
        email VARCHAR(100),
        city VARCHAR(50),
        batch_timing VARCHAR(50),
        mode VARCHAR(20),
        how_heard VARCHAR(50),
        message TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Tables Created Successfully');
  } catch (error) {
    console.error('Error creating tables:', error.message);
    throw error;
  }
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const seedData = async () => {
  try {
    // ── Seed Superadmin ──
    const superadminEmail = process.env.SUPERADMIN_EMAIL || 'muskan@nimu.com';
    const superadminCheck = await pool.query('SELECT id FROM users WHERE email = $1', [superadminEmail]);
    if (superadminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Nimu@2026', 12);
      await pool.query(
        "INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, 'superadmin')",
        ['Muskan Naz', superadminEmail, hashedPassword, '9777240070']
      );
      console.log(`Superadmin created: ${superadminEmail}`);
    }

    // ── Seed Courses ──
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
      console.log('Courses seeded successfully');
    }

    // ── Seed Products ──
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
      console.log('Products seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
};

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await createTables();
    await seedData();

    app.listen(PORT, () => {
      console.log(`\n🚀 Nimu Academy Server Running on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`\nAvailable endpoints:`);
      console.log(`  POST   http://localhost:${PORT}/api/auth/register`);
      console.log(`  POST   http://localhost:${PORT}/api/auth/login`);
      console.log(`  GET    http://localhost:${PORT}/api/courses`);
      console.log(`  GET    http://localhost:${PORT}/api/products`);
      console.log(`  POST   http://localhost:${PORT}/api/enrollments`);
      console.log(`  POST   http://localhost:${PORT}/api/orders`);
      console.log(`  GET    http://localhost:${PORT}/api/admin/dashboard`);
      console.log(`  GET    http://localhost:${PORT}/api/superadmin/dashboard`);
      console.log(`\nSuperadmin: muskan@nimu.com / Nimu@2026\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
