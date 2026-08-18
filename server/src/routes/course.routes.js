const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseById, getCourseVideos, createCourse, updateCourse, deleteCourse, addVideoToCourse, deleteVideo, updateVideo } = require('../controllers/course.controller');
const { verifyToken, optionalVerifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Academy course management
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of active courses
 */
router.get('/', getAllCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course details
 */
router.get('/:id', getCourseById);

/**
 * @swagger
 * /api/courses/{id}/videos:
 *   get:
 *     summary: Get videos for a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of videos
 */
router.get('/:id/videos', optionalVerifyToken, getCourseVideos);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Basic Baking
 *               description:
 *                 type: string
 *               duration:
 *                 type: string
 *               timing:
 *                 type: string
 *               mode:
 *                 type: string
 *               price:
 *                 type: number
 *               topics:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Course created
 */
router.post('/', verifyToken, checkRole('admin', 'superadmin'), createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Course updated
 */
router.put('/:id', verifyToken, checkRole('admin', 'superadmin'), updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course deleted
 */
router.delete('/:id', verifyToken, checkRole('superadmin'), deleteCourse);

// ── Video Management (admin/superadmin) ──────────────────────────────────────
router.post('/:id/videos', verifyToken, checkRole('admin', 'superadmin'), addVideoToCourse);
router.put('/:id/videos/:videoId', verifyToken, checkRole('admin', 'superadmin'), updateVideo);
router.delete('/:id/videos/:videoId', verifyToken, checkRole('admin', 'superadmin'), deleteVideo);

module.exports = router;
