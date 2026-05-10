const pool = require('../config/db');

// GET /api/enrollments - Get all (admin/superadmin)
const getAllEnrollments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, c.name AS course_name, c.price AS course_price, u.email AS user_email
       FROM enrollments e
       LEFT JOIN courses c ON e.course_id = c.id
       LEFT JOIN users u ON e.user_id = u.id
       ORDER BY e.created_at DESC`
    );
    res.status(200).json({ enrollments: result.rows, total: result.rowCount });
  } catch (error) {
    console.error('Get all enrollments error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/enrollments/:id
const getEnrollmentById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, c.name AS course_name FROM enrollments e
       LEFT JOIN courses c ON e.course_id = c.id
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found.' });
    }
    res.status(200).json({ enrollment: result.rows[0] });
  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/enrollments - Enroll in course (user / guest)
const createEnrollment = async (req, res) => {
  try {
    const { course_id, student_name, phone, email, city, batch_timing, mode, how_heard, message } = req.body;

    if (!student_name || !phone) {
      return res.status(400).json({ message: 'Student name and phone are required.' });
    }

    const result = await pool.query(
      `INSERT INTO enrollments 
        (user_id, course_id, student_name, phone, email, city, batch_timing, mode, how_heard, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        req.user?.id || null, course_id || null, student_name, phone,
        email || null, city || null, batch_timing || null,
        mode || null, how_heard || null, message || null
      ]
    );

    if (req.user?.id) {
      await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Enrolled in course #${course_id}`]);
    }

    res.status(201).json({ message: 'Enrollment submitted successfully. We will contact you soon.', enrollment: result.rows[0] });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/enrollments/:id/status (admin/superadmin)
const updateEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const result = await pool.query(
      'UPDATE enrollments SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found.' });
    }

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Updated enrollment #${req.params.id} to ${status}`]);

    res.status(200).json({ message: 'Enrollment status updated.', enrollment: result.rows[0] });
  } catch (error) {
    console.error('Update enrollment status error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/enrollments/:id (admin/superadmin)
const deleteEnrollment = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM enrollments WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found.' });
    }
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Deleted enrollment #${req.params.id}`]);
    res.status(200).json({ message: 'Enrollment deleted successfully.' });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllEnrollments, getEnrollmentById, createEnrollment, updateEnrollmentStatus, deleteEnrollment };
