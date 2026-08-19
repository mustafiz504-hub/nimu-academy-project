const pool = require('../config/db');

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [ordersRes, enrollmentsRes, usersRes, revenueRes, pendingOrdersRes, pendingEnrollmentsRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM orders'),
      pool.query('SELECT COUNT(*) FROM enrollments'),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'"),
      pool.query("SELECT COALESCE(SUM(total_price), 0) AS total FROM orders WHERE status = 'delivered'"),
      pool.query("SELECT COUNT(*) FROM orders WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM enrollments WHERE status = 'pending'"),
    ]);

    res.status(200).json({
      stats: {
        totalOrders: parseInt(ordersRes.rows[0].count),
        totalEnrollments: parseInt(enrollmentsRes.rows[0].count),
        totalUsers: parseInt(usersRes.rows[0].count),
        totalRevenue: parseFloat(revenueRes.rows[0].total),
        pendingOrders: parseInt(pendingOrdersRes.rows[0].count),
        pendingEnrollments: parseInt(pendingEnrollmentsRes.rows[0].count),
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/admin/orders
const getOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, p.name AS product_name, u.name AS user_name, u.email AS user_email
       FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.status(200).json({ orders: result.rows, total: result.rowCount });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/admin/enrollments
const getEnrollments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, c.name AS course_name FROM enrollments e
       LEFT JOIN courses c ON e.course_id = c.id
       ORDER BY e.created_at DESC`
    );
    res.status(200).json({ enrollments: result.rows, total: result.rowCount });
  } catch (error) {
    console.error('Admin get enrollments error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.status(200).json({ users: result.rows, total: result.rowCount });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/admin/make-admin
const makeAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await pool.query(
      "UPDATE users SET role = 'admin' WHERE id = $1 AND role = 'user' RETURNING *",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found or already an admin.' });
    }
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Admin promoted user #${userId} to Admin`]);
    res.status(200).json({ message: 'User promoted to admin successfully.', user: result.rows[0] });
  } catch (error) {
    console.error('Admin make admin error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/admin/remove-admin
const removeAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await pool.query(
      "UPDATE users SET role = 'user' WHERE id = $1 AND role = 'admin' RETURNING *",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found or not an admin.' });
    }
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Admin demoted user #${userId} to User`]);
    res.status(200).json({ message: 'Admin demoted to user successfully.', user: result.rows[0] });
  } catch (error) {
    console.error('Admin remove admin error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Order not found.' });
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Admin updated order #${req.params.id} to ${status}`]);
    res.status(200).json({ message: 'Order status updated.', order: result.rows[0] });
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/admin/enrollments/:id/status
const updateEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    const result = await pool.query('UPDATE enrollments SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Enrollment not found.' });
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Admin updated enrollment #${req.params.id} to ${status}`]);
    res.status(200).json({ message: 'Enrollment status updated.', enrollment: result.rows[0] });
  } catch (error) {
    console.error('Admin update enrollment status error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/admin/course-purchases
const getCoursePurchases = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.name as user_name, u.email as user_email, c.name as course_name 
      FROM enrollments e 
      JOIN users u ON e.user_id = u.id 
      JOIN courses c ON e.course_id = c.id 
      ORDER BY e.created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Admin fetch course purchases error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/admin/course-purchases/grant
const grantCourseAccess = async (req, res) => {
  try {
    const { user_id, course_id } = req.body;
    const exist = await pool.query("SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2", [user_id, course_id]);
    if (exist.rows.length > 0) {
      await pool.query("UPDATE enrollments SET status = 'completed', amount = 0, message = 'Granted by Admin' WHERE user_id = $1 AND course_id = $2", [user_id, course_id]);
    } else {
      await pool.query(
        "INSERT INTO enrollments (user_id, course_id, status, amount, message) VALUES ($1, $2, 'completed', 0, 'Granted by Admin')",
        [user_id, course_id]
      );
    }
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Admin granted course access for user ${user_id} on course ${course_id}`]);
    res.status(200).json({ message: 'Course access granted.' });
  } catch (error) {
    console.error('Admin grant course access error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/admin/course-purchases/revoke
const revokeCourseAccess = async (req, res) => {
  try {
    const { enrollment_id } = req.body;
    await pool.query("UPDATE enrollments SET status = 'cancelled', message = 'Revoked by Admin' WHERE id = $1", [enrollment_id]);
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Admin revoked enrollment #${enrollment_id}`]);
    res.status(200).json({ message: 'Course access revoked.' });
  } catch (error) {
    console.error('Admin revoke course access error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { 
  getDashboard, 
  getOrders, 
  getEnrollments, 
  getUsers, 
  updateOrderStatus, 
  updateEnrollmentStatus,
  makeAdmin,
  removeAdmin,
  getCoursePurchases,
  grantCourseAccess,
  revokeCourseAccess
};
