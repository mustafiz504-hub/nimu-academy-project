// @ts-check
const pool = require('../config/db');

/** @typedef {import('express').Request & { user?: any }} Request */
/** @typedef {import('express').Response} Response */

// GET /api/user/profile
/**
 * @param {Request} req
 * @param {Response} res
 */
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/user/profile
/**
 * @param {Request} req
 * @param {Response} res
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING id, name, email, phone, role',
      [name, phone || null, req.user.id]
    );

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, 'User updated profile']);

    res.status(200).json({ message: 'Profile updated successfully.', user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/user/orders
/**
 * @param {Request} req
 * @param {Response} res
 */
const getUserOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, p.name AS product_name FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json({ orders: result.rows });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/user/enrollments
/**
 * @param {Request} req
 * @param {Response} res
 */
const getUserEnrollments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, c.name AS course_name, c.mode AS course_mode FROM enrollments e
       LEFT JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json({ enrollments: result.rows });
  } catch (error) {
    console.error('Get user enrollments error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getProfile, updateProfile, getUserOrders, getUserEnrollments };
