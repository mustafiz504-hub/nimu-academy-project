const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder } = require('../controllers/order.controller');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Cake order management
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Place a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_name, phone, address, delivery_date]
 *             properties:
 *               product_id:
 *                 type: integer
 *               customer_name:
 *                 type: string
 *                 example: Muskan Naz
 *               phone:
 *                 type: string
 *                 example: 9777240070
 *               address:
 *                 type: string
 *                 example: 123 Main St, City
 *               flavor:
 *                 type: string
 *                 example: Chocolate
 *               size:
 *                 type: string
 *                 example: 1kg
 *               custom_message:
 *                 type: string
 *                 example: Happy Birthday!
 *               delivery_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-15
 *               special_instructions:
 *                 type: string
 *                 example: Less sugar please
 *               total_price:
 *                 type: number
 *                 example: 599.00
 *     responses:
 *       201:
 *         description: Order placed successfully
 */
router.post('/', verifyToken, createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders (Admin/Superadmin only)
 */
router.get('/', verifyToken, checkRole('admin', 'superadmin'), getAllOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
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
 *         description: Order details
 */
router.get('/:id', verifyToken, checkRole('admin', 'superadmin'), getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
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
 *                 enum: [pending, confirmed, delivered, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put('/:id/status', verifyToken, checkRole('admin', 'superadmin'), updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
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
 *         description: Order deleted
 */
router.delete('/:id', verifyToken, checkRole('admin', 'superadmin'), deleteOrder);

module.exports = router;
