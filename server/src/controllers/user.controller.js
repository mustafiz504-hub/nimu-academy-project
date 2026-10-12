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
      'SELECT id, name, email, phone, role, avatar, created_at FROM users WHERE id = $1',
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
    const { name, phone, avatar } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2, avatar = $3 WHERE id = $4 RETURNING id, name, email, phone, role, avatar',
      [name, phone || null, avatar || null, req.user.id]
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

// POST /api/user/push-token
/**
 * @param {Request} req
 * @param {Response} res
 */
const savePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken) {
      return res.status(400).json({ message: 'Push token is required.' });
    }

    await pool.query(
      'UPDATE users SET expo_push_token = $1 WHERE id = $2',
      [pushToken, req.user.id]
    );

    res.status(200).json({ message: 'Push token saved successfully.' });
  } catch (error) {
    console.error('Save push token error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/user/account
/**
 * @param {Request} req
 * @param {Response} res
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const check = await pool.query('SELECT id, role FROM users WHERE id = $1', [userId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (check.rows[0].role === 'superadmin') {
      return res.status(400).json({ message: 'Superadmin account cannot be self-deleted.' });
    }

    // Clean up user data
    await pool.query('DELETE FROM activity_logs WHERE user_id = $1', [userId]);
    try {
      await pool.query('DELETE FROM video_progress WHERE user_id = $1', [userId]);
    } catch (_) {}
    await pool.query('DELETE FROM enrollments WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM orders WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.status(200).json({ message: 'Your account and all associated data have been permanently deleted.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error while deleting account.' });
  }
};

// POST /api/user/deletion-request (Public offline form)
/**
 * @param {Request} req
 * @param {Response} res
 */
const submitDeletionRequest = async (req, res) => {
  try {
    const { name, email, phone, reason } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      `INSERT INTO deletion_requests (name, email, phone, reason) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name?.trim() || null, normalizedEmail, phone?.trim() || null, reason?.trim() || null]
    );

    // Send notification email to admin
    try {
      const { sendMail } = require('../utils/mailer');
      const adminEmail = process.env.ADMIN_EMAIL || 'mustafiz504@gmail.com';
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #FFD5D5; border-radius: 12px; background-color: #FFF5F5;">
          <h2 style="color: #DC2626; margin-top: 0;">⚠️ New Account Deletion Request</h2>
          <p style="color: #333; font-size: 14px;">A user has submitted an account and data deletion request for Nimu Cooking:</p>
          <div style="background-color: #FFFFFF; padding: 16px; border-radius: 8px; border: 1px solid #FCA5A5; font-size: 14px; line-height: 1.6;">
            <p><strong>Name:</strong> ${name || 'Not provided'}</p>
            <p><strong>Registered Email:</strong> ${normalizedEmail}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
            <p><strong>Submitted At:</strong> ${new Date().toLocaleString('en-IN')}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 16px;">
            Google Play requires processing this request within 30 days. You can review this request in your <strong>Admin Panel &gt; Users &gt; Deletion Requests</strong> tab.
          </p>
        </div>
      `;
      await sendMail(adminEmail, `🚨 Account Deletion Request: ${normalizedEmail}`, emailHtml, 'Deletion Request Alert');
    } catch (mailErr) {
      console.warn('Could not send deletion alert email:', mailErr?.message);
    }

    res.status(201).json({
      message: 'Account deletion request received successfully. It will be verified and processed within 30 days.',
      request: result.rows[0],
    });
  } catch (error) {
    console.error('Submit deletion request error:', error);
    res.status(500).json({ message: 'Server error while submitting request.' });
  }
};

module.exports = { getProfile, updateProfile, getUserOrders, getUserEnrollments, savePushToken, deleteAccount, submitDeletionRequest };
