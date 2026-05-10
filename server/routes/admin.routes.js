const express = require('express');
const router = express.Router();
const { getDashboard, getOrders, getEnrollments, getUsers, updateOrderStatus, updateEnrollmentStatus } = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative dashboard and management
 */

// All admin routes require admin or superadmin role
router.use(verifyToken, checkRole('admin', 'superadmin'));

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/dashboard', getDashboard);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders for admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get('/orders', getOrders);

/**
 * @swagger
 * /api/admin/enrollments:
 *   get:
 *     summary: Get all enrollments for admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all enrollments
 */
router.get('/enrollments', getEnrollments);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all customers for admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users with 'user' role
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin)
 *     tags: [Admin]
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
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/orders/:id/status', updateOrderStatus);

/**
 * @swagger
 * /api/admin/enrollments/{id}/status:
 *   put:
 *     summary: Update enrollment status (Admin)
 *     tags: [Admin]
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
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/enrollments/:id/status', updateEnrollmentStatus);

module.exports = router;
