const pool = require('../config/db');

// GET /api/courses - Public
const getAllCourses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses WHERE active = true ORDER BY created_at ASC');
    res.status(200).json({ courses: result.rows });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/courses/:id - Public
const getCourseById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    res.status(200).json({ course: result.rows[0] });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/courses (admin/superadmin)
const createCourse = async (req, res) => {
  try {
    const { name, description, duration, timing, mode, price, topics } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Course name and price are required.' });
    }

    const result = await pool.query(
      `INSERT INTO courses (name, description, duration, timing, mode, price, topics)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description || null, duration || null, timing || null, mode || null, price, topics || []]
    );

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Created course: ${name}`]);

    res.status(201).json({ message: 'Course created successfully.', course: result.rows[0] });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/courses/:id (admin/superadmin)
const updateCourse = async (req, res) => {
  try {
    const { name, description, duration, timing, mode, price, topics, active } = req.body;

    const result = await pool.query(
      `UPDATE courses SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        duration = COALESCE($3, duration),
        timing = COALESCE($4, timing),
        mode = COALESCE($5, mode),
        price = COALESCE($6, price),
        topics = COALESCE($7, topics),
        active = COALESCE($8, active)
       WHERE id = $9 RETURNING *`,
      [name, description, duration, timing, mode, price, topics, active, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Updated course #${req.params.id}`]);

    res.status(200).json({ message: 'Course updated successfully.', course: result.rows[0] });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/courses/:id (superadmin only)
const deleteCourse = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Deleted course #${req.params.id}`]);
    res.status(200).json({ message: 'Course deleted successfully.' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
