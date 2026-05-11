const express = require('express');
const router = express.Router();
const { getDashboard, getAdmins, makeAdmin, removeAdmin, getAllUsers, getActivityLogs, deleteUser } = require('../controllers/superadmin.controller');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

/**
 * @swagger
 * tags:
 *   name: Superadmin
 *   description: Platform-wide management and logs (Superadmin only)
 */

// All superadmin routes require superadmin role only
router.use(verifyToken, checkRole('superadmin'));

/**
 * @swagger
 * /api/superadmin/dashboard:
 *   get:
 *     summary: Get superadmin dashboard statistics
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform-wide statistics
 */
router.get('/dashboard', getDashboard);

/**
 * @swagger
 * /api/superadmin/admins:
 *   get:
 *     summary: Get list of all admins
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admins
 */
router.get('/admins', getAdmins);

/**
 * @swagger
 * /api/superadmin/make-admin:
 *   post:
 *     summary: Promote a user to admin
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User promoted
 */
router.post('/make-admin', makeAdmin);

/**
 * @swagger
 * /api/superadmin/remove-admin:
 *   post:
 *     summary: Demote an admin to user
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Admin demoted
 */
router.post('/remove-admin', removeAdmin);

/**
 * @swagger
 * /api/superadmin/users:
 *   get:
 *     summary: Get all users with roles
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/superadmin/activity-logs:
 *   get:
 *     summary: Get platform activity logs
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity logs
 */
router.get('/activity-logs', getActivityLogs);

/**
 * @swagger
 * /api/superadmin/users/{id}:
 *   delete:
 *     summary: Delete any user
 *     tags: [Superadmin]
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
 *         description: User deleted
 */
router.delete('/users/:id', deleteUser);

module.exports = router;
