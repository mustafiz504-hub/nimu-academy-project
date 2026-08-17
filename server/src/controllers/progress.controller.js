const pool = require('../config/db');

/**
 * POST /api/progress/video/:videoId
 * Mark a video as watched by the logged-in user.
 * Body: { course_id }
 */
const markVideoWatched = async (req, res) => {
  try {
    const userId   = req.user.id;
    const videoId  = req.params.videoId;
    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ message: 'course_id is required.' });
    }

    // Upsert — safe to call multiple times
    await pool.query(
      `INSERT INTO video_progress (user_id, course_id, video_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, video_id) DO UPDATE SET watched_at = NOW()`,
      [userId, course_id, videoId]
    );

    res.status(200).json({ message: 'Progress saved.' });
  } catch (error) {
    console.error('Mark video watched error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /api/progress/my
 * Returns overall study progress for the logged-in user:
 * - Per-course: watched_count, total_videos, percent
 * - Overall: total watched across all enrolled courses
 */
const getMyProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get enrolled courses for this user
    const enrollResult = await pool.query(
      `SELECT e.course_id, c.name AS course_name
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1 AND e.status IN ('confirmed', 'completed')`,
      [userId]
    );

    if (enrollResult.rows.length === 0) {
      return res.status(200).json({
        overall_percent: 0,
        total_watched: 0,
        total_videos: 0,
        courses: [],
      });
    }

    const courseIds = enrollResult.rows.map(r => r.course_id);

    // Total videos per enrolled course
    const totalResult = await pool.query(
      `SELECT course_id, COUNT(*) AS total
       FROM course_videos
       WHERE course_id = ANY($1::int[])
       GROUP BY course_id`,
      [courseIds]
    );

    // Watched videos per enrolled course
    const watchedResult = await pool.query(
      `SELECT course_id, COUNT(*) AS watched
       FROM video_progress
       WHERE user_id = $1 AND course_id = ANY($2::int[])
       GROUP BY course_id`,
      [userId, courseIds]
    );

    const totalMap   = Object.fromEntries(totalResult.rows.map(r => [r.course_id, parseInt(r.total)]));
    const watchedMap = Object.fromEntries(watchedResult.rows.map(r => [r.course_id, parseInt(r.watched)]));

    let grandTotal   = 0;
    let grandWatched = 0;

    const courses = enrollResult.rows.map(r => {
      const total   = totalMap[r.course_id]   || 0;
      const watched = watchedMap[r.course_id] || 0;
      const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

      grandTotal   += total;
      grandWatched += watched;

      return {
        course_id:   r.course_id,
        course_name: r.course_name,
        total_videos: total,
        watched_count: watched,
        percent,
      };
    });

    const overall_percent = grandTotal > 0
      ? Math.round((grandWatched / grandTotal) * 100)
      : 0;

    res.status(200).json({
      overall_percent,
      total_watched: grandWatched,
      total_videos:  grandTotal,
      courses,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /api/progress/course/:courseId
 * Returns watched video IDs for the logged-in user in one course.
 */
const getCourseProgress = async (req, res) => {
  try {
    const userId   = req.user.id;
    const courseId = req.params.courseId;

    const result = await pool.query(
      `SELECT video_id FROM video_progress WHERE user_id = $1 AND course_id = $2`,
      [userId, courseId]
    );

    const watchedVideoIds = result.rows.map(r => r.video_id);

    // Get total video count for percent
    const totalResult = await pool.query(
      `SELECT COUNT(*) AS total FROM course_videos WHERE course_id = $1`,
      [courseId]
    );
    const total   = parseInt(totalResult.rows[0].total) || 0;
    const watched = watchedVideoIds.length;
    const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

    res.status(200).json({ watched_video_ids: watchedVideoIds, watched, total, percent });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { markVideoWatched, getMyProgress, getCourseProgress };
