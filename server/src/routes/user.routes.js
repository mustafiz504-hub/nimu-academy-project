const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  getUserOrders, 
  getUserEnrollments, 
  savePushToken, 
  deleteAccount,
  submitDeletionRequest 
} = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

/**
 * @swagger
 * /api/user/deletion-request:
 *   post:
 *     summary: Submit an offline account and data deletion request (public)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Request received
 */
router.post('/deletion-request', submitDeletionRequest);

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile and personal data management
 */

// Authenticated user routes
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

/**
 * @swagger
 * /api/user/push-token:
 *   post:
 *     summary: Save Expo push token for user
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
 *               pushToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Push token saved successfully
 *       400:
 *         description: Bad request
 */
router.post('/push-token', savePushToken);

/**
 * @swagger
 * /api/user/account:
 *   delete:
 *     summary: Delete user account and associated personal data
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       400:
 *         description: Cannot delete superadmin account
 */
router.delete('/account', deleteAccount);

module.exports = router;
