const express = require('express');
const router = express.Router();
const { getAllEnrollments, getEnrollmentById, createEnrollment, updateEnrollmentStatus, deleteEnrollment } = require('../controllers/enrollment.controller');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// POST /api/enrollments - Guest or logged-in user can enroll (optional auth)
// Using optional token verification - if token present use it, else allow guest
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      // Invalid token - treat as guest
    }
  }
  next();
};

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Course enrollment management
 */

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [student_name, phone]
 *             properties:
 *               course_id:
 *                 type: integer
 *               student_name:
 *                 type: string
 *                 example: Muskan Naz
 *               phone:
 *                 type: string
 *                 example: 9777240070
 *               email:
 *                 type: string
 *                 example: muskan@nimu.com
 *               city:
 *                 type: string
 *                 example: City Name
 *               batch_timing:
 *                 type: string
 *                 example: 10 AM - 12 PM
 *               mode:
 *                 type: string
 *                 example: Offline
 *               how_heard:
 *                 type: string
 *                 example: Instagram
 *               message:
 *                 type: string
 *                 example: Interested in basic baking
 *     responses:
 *       201:
 *         description: Enrollment submitted successfully
 */
router.post('/', optionalAuth, createEnrollment);

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Get all enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all enrollments (Admin/Superadmin only)
 */
router.get('/', verifyToken, checkRole('admin', 'superadmin'), getAllEnrollments);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   get:
 *     summary: Get enrollment by ID
 *     tags: [Enrollments]
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
 *         description: Enrollment details
 */
router.get('/:id', verifyToken, checkRole('admin', 'superadmin'), getEnrollmentById);

/**
 * @swagger
 * /api/enrollments/{id}/status:
 *   put:
 *     summary: Update enrollment status
 *     tags: [Enrollments]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Enrollment status updated
 */
router.put('/:id/status', verifyToken, checkRole('admin', 'superadmin'), updateEnrollmentStatus);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   delete:
 *     summary: Delete an enrollment
 *     tags: [Enrollments]
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
 *         description: Enrollment deleted
 */
router.delete('/:id', verifyToken, checkRole('admin', 'superadmin'), deleteEnrollment);

module.exports = router;
