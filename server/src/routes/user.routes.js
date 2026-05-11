const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUserOrders, getUserEnrollments } = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile and personal data management
 */

// All user routes require authentication
router.use(verifyToken);

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Muskan Naz
 *               phone:
 *                 type: string
 *                 example: 9777240070
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', updateProfile);

/**
 * @swagger
 * /api/user/orders:
 *   get:
 *     summary: Get user orders
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get('/orders', getUserOrders);

/**
 * @swagger
 * /api/user/enrollments:
 *   get:
 *     summary: Get user enrollments
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user course enrollments
 */
router.get('/enrollments', getUserEnrollments);

module.exports = router;
