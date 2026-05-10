const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/superadmin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [
      ordersRes, enrollmentsRes, usersRes, adminsRes,
      revenueRes, pendingOrdersRes, pendingEnrollmentsRes,
      coursesRes, productsRes
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM orders'),
      pool.query('SELECT COUNT(*) FROM enrollments'),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'"),
      pool.query("SELECT COALESCE(SUM(total_price), 0) AS total FROM orders WHERE status = 'delivered'"),
      pool.query("SELECT COUNT(*) FROM orders WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM enrollments WHERE status = 'pending'"),
      pool.query('SELECT COUNT(*) FROM courses WHERE active = true'),
      pool.query('SELECT COUNT(*) FROM products WHERE available = true'),
    ]);

    res.status(200).json({
      stats: {
        totalOrders: parseInt(ordersRes.rows[0].count),
        totalEnrollments: parseInt(enrollmentsRes.rows[0].count),
        totalUsers: parseInt(usersRes.rows[0].count),
        totalAdmins: parseInt(adminsRes.rows[0].count),
        totalRevenue: parseFloat(revenueRes.rows[0].total),
        pendingOrders: parseInt(pendingOrdersRes.rows[0].count),
        pendingEnrollments: parseInt(pendingEnrollmentsRes.rows[0].count),
        activeCourses: parseInt(coursesRes.rows[0].count),
        availableProducts: parseInt(productsRes.rows[0].count),
      }
    });
  } catch (error) {
    console.error('Superadmin dashboard error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/superadmin/admins
const getAdmins = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, role, created_at FROM users WHERE role = 'admin' ORDER BY created_at DESC"
    );
    res.status(200).json({ admins: result.rows, total: result.rowCount });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/superadmin/make-admin
const makeAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required.' });

    const check = await pool.query('SELECT id, role, email FROM users WHERE id = $1', [userId]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    if (check.rows[0].role === 'superadmin') return res.status(400).json({ message: 'Cannot change superadmin role.' });

    const result = await pool.query(
      "UPDATE users SET role = 'admin' WHERE id = $1 RETURNING id, name, email, role",
      [userId]
    );

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Promoted user #${userId} to admin`]);

    res.status(200).json({ message: 'User promoted to admin successfully.', user: result.rows[0] });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/superadmin/remove-admin
const removeAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required.' });

    const check = await pool.query('SELECT id, role FROM users WHERE id = $1', [userId]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    if (check.rows[0].role === 'superadmin') return res.status(400).json({ message: 'Cannot demote superadmin.' });

    const result = await pool.query(
      "UPDATE users SET role = 'user' WHERE id = $1 RETURNING id, name, email, role",
      [userId]
    );

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Demoted admin #${userId} to user`]);

    res.status(200).json({ message: 'Admin demoted to user successfully.', user: result.rows[0] });
  } catch (error) {
    console.error('Remove admin error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/superadmin/users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.status(200).json({ users: result.rows, total: result.rowCount });
  } catch (error) {
    console.error('Superadmin get users error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/superadmin/activity-logs
const getActivityLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS user_name, u.email AS user_email, u.role AS user_role
       FROM activity_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC
       LIMIT 200`
    );
    res.status(200).json({ logs: result.rows, total: result.rowCount });
  } catch (error) {
    console.error('Activity logs error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/superadmin/users/:id
const deleteUser = async (req, res) => {
  try {
    const check = await pool.query('SELECT id, role FROM users WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    if (check.rows[0].role === 'superadmin') return res.status(400).json({ message: 'Cannot delete superadmin.' });

    await pool.query('DELETE FROM activity_logs WHERE user_id = $1', [req.params.id]);
    await pool.query('DELETE FROM enrollments WHERE user_id = $1', [req.params.id]);
    await pool.query('DELETE FROM orders WHERE user_id = $1', [req.params.id]);
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Deleted user #${req.params.id}`]);

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getDashboard, getAdmins, makeAdmin, removeAdmin, getAllUsers, getActivityLogs, deleteUser };
