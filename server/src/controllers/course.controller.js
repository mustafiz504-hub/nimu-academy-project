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

// GET /api/courses/:id/videos - Access controlled
const getCourseVideos = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user?.id;

    // 1. Fetch course to check price
    const courseResult = await pool.query('SELECT price, active FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    const course = courseResult.rows[0];
    const isPaidCourse = parseFloat(course.price) > 0;

    // 2. Check if admin/superadmin (bypass all checks)
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';

    // 3. Check enrollment if course is paid
    let isEnrolled = false;
    if (isPaidCourse && userId && !isAdmin) {
      const enrollResult = await pool.query(
        "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status IN ('confirmed', 'completed')",
        [userId, courseId]
      );
      isEnrolled = enrollResult.rows.length > 0;
    }

    // 4. Build query — admins and enrolled users get all videos; others only free ones
    const canAccessAll = isAdmin || !isPaidCourse || isEnrolled;
    const query = canAccessAll
      ? 'SELECT * FROM course_videos WHERE course_id = $1 ORDER BY order_index ASC'
      : 'SELECT id, course_id, title, description, duration_minutes, order_index, is_free, thumbnail_url, created_at FROM course_videos WHERE course_id = $1 AND is_free = true ORDER BY order_index ASC';

    const result = await pool.query(query, [courseId]);

    // For locked videos, we return them in the list but WITHOUT the video_url
    let videos = result.rows;
    if (!canAccessAll) {
      // Also include locked videos in list (without URL) so UI can show the lock icon
      const allVideosResult = await pool.query(
        'SELECT id, course_id, title, description, duration_minutes, order_index, is_free, thumbnail_url, created_at FROM course_videos WHERE course_id = $1 ORDER BY order_index ASC',
        [courseId]
      );
      videos = allVideosResult.rows.map(v => ({
        ...v,
        video_url: v.is_free ? v.video_url : null, // Hide URL for locked videos
      }));
      // Re-fetch with video_url for free ones
      const freeWithUrl = await pool.query(
        'SELECT * FROM course_videos WHERE course_id = $1 AND is_free = true ORDER BY order_index ASC',
        [courseId]
      );
      const freeMap = new Map(freeWithUrl.rows.map(v => [v.id, v]));
      videos = allVideosResult.rows.map(v => freeMap.get(v.id) || { ...v, video_url: null });
    }

    res.status(200).json({ videos, isEnrolled, canAccessAll });
  } catch (error) {
    console.error('Get course videos error:', error);
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

// POST /api/courses/:id/videos (admin/superadmin) — add a video to a course
const addVideoToCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, video_url, thumbnail_url, duration_minutes, order_index, is_free } = req.body;

    if (!title || !video_url) {
      return res.status(400).json({ message: 'Title and video_url are required.' });
    }

    // Get next order index if not provided
    let idx = order_index;
    if (idx === undefined || idx === null) {
      const countResult = await pool.query('SELECT COUNT(*) FROM course_videos WHERE course_id = $1', [courseId]);
      idx = parseInt(countResult.rows[0].count, 10) + 1;
    }

    const result = await pool.query(
      `INSERT INTO course_videos (course_id, title, description, video_url, thumbnail_url, duration_minutes, order_index, is_free)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [courseId, title, description || null, video_url, thumbnail_url || null, duration_minutes || 0, idx, is_free ?? false]
    );

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Added video "${title}" to course #${courseId}`]);

    res.status(201).json({ message: 'Video added successfully.', video: result.rows[0] });
  } catch (error) {
    console.error('Add video error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/courses/:id/videos/:videoId (admin/superadmin)
const deleteVideo = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM course_videos WHERE id = $1 AND course_id = $2 RETURNING id',
      [req.params.videoId, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Video not found.' });
    }
    res.status(200).json({ message: 'Video deleted successfully.' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/courses/:id/videos/:videoId (admin/superadmin)
const updateVideo = async (req, res) => {
  try {
    const { title, description, is_free } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const result = await pool.query(
      `UPDATE course_videos SET 
        title = COALESCE($1, title),
        description = $2,
        is_free = COALESCE($3, is_free)
       WHERE id = $4 AND course_id = $5 RETURNING *`,
      [title, description, is_free, req.params.videoId, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Updated video "${title}" in course #${req.params.id}`]);

    res.status(200).json({ message: 'Video updated successfully.', video: result.rows[0] });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllCourses, getCourseById, getCourseVideos, createCourse, updateCourse, deleteCourse, addVideoToCourse, deleteVideo, updateVideo };
