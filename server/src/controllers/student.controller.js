const pool = require('../config/db');

// ── Helper: generate unique student_id ─────────────────────────────────────
const generateStudentId = () => `STU-${Math.floor(1000 + Math.random() * 9000)}`;
const generateCertificateId = async () => {
  const result = await pool.query(`SELECT COUNT(*) FROM students WHERE completed = true`);
  const count = parseInt(result.rows[0].count || '0') + 1;
  return `NIMU-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
};

// GET /api/students — all students (admin/superadmin only)
const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM students ORDER BY created_at DESC`
    );
    res.status(200).json({ students: result.rows, total: result.rowCount });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/students/search?q=<phone|email|studentId> — public certificate lookup
const searchStudent = async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    if (!q) return res.status(400).json({ message: 'Search query is required.' });

    const result = await pool.query(
      `SELECT * FROM students
       WHERE phone = $1 OR email = $1 OR student_id = $1
       LIMIT 1`,
      [q]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    res.status(200).json({ student: result.rows[0] });
  } catch (error) {
    console.error('Search student error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/students — add new student (admin only)
const createStudent = async (req, res) => {
  try {
    const { student_name, phone, email, course_name, completion_date } = req.body;

    if (!student_name || !phone) {
      return res.status(400).json({ message: 'student_name and phone are required.' });
    }

    // Duplicate phone check
    const existing = await pool.query('SELECT id FROM students WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'A student with this phone number already exists.' });
    }

    const student_id = generateStudentId();
    const result = await pool.query(
      `INSERT INTO students (student_id, student_name, phone, email, course_name, completion_date, approved, completed, certificate_id)
       VALUES ($1, $2, $3, $4, $5, $6, true, true, $7)
       RETURNING *`,
      [
        student_id,
        student_name,
        phone,
        email || '',
        course_name || '',
        completion_date || '',
        `NIMU-${Math.floor(Math.random() * 90000 + 10000)}`
      ]
    );

    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `Added student: ${student_name}`]
    );

    res.status(201).json({ message: 'Student added successfully.', student: result.rows[0] });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/students/:id — update student (approve, complete, etc.)
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, completed, completion_date, course_name, student_name, phone, email } = req.body;

    // Fetch current record
    const current = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    const existing = current.rows[0];

    // Auto-generate certificate_id when marking completed for first time
    let certificate_id = existing.certificate_id;
    const isNowCompleting = completed === true && !existing.completed;
    if (isNowCompleting && !certificate_id) {
      certificate_id = await generateCertificateId();
    }

    const result = await pool.query(
      `UPDATE students SET
        student_name    = COALESCE($1, student_name),
        phone           = COALESCE($2, phone),
        email           = COALESCE($3, email),
        course_name     = COALESCE($4, course_name),
        approved        = COALESCE($5, approved),
        completed       = COALESCE($6, completed),
        completion_date = COALESCE($7, completion_date),
        certificate_id  = $8
       WHERE id = $9
       RETURNING *`,
      [
        student_name  ?? null,
        phone         ?? null,
        email         ?? null,
        course_name   ?? null,
        approved      ?? null,
        completed     ?? null,
        completion_date ?? null,
        certificate_id,
        id
      ]
    );

    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `Updated student #${id}`]
    );

    res.status(200).json({ message: 'Student updated.', student: result.rows[0] });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/students/:id — remove student record
const deleteStudent = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING id, student_name', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    await pool.query(
      'INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `Deleted student #${req.params.id}: ${result.rows[0].student_name}`]
    );
    res.status(200).json({ message: 'Student deleted successfully.' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllStudents, searchStudent, createStudent, updateStudent, deleteStudent };
