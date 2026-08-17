const express = require('express');
const router  = express.Router();
const { markVideoWatched, getMyProgress, getCourseProgress } = require('../controllers/progress.controller');
const { verifyToken } = require('../middleware/auth');

// All progress routes require a logged-in user
router.use(verifyToken);

// GET /api/progress/my  — overall progress across all enrolled courses
router.get('/my', getMyProgress);

// GET /api/progress/course/:courseId  — per-course watched video IDs
router.get('/course/:courseId', getCourseProgress);

// POST /api/progress/video/:videoId  — mark a video as watched
router.post('/video/:videoId', markVideoWatched);

module.exports = router;
