const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');
const { registerValidationRules, loginValidationRules, validate } = require('../middleware/validators');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Muskan Naz
 *               email:
 *                 type: string
 *                 example: muskan@nimu.com
 *               password:
 *                 type: string
 *                 example: Nimu@2026
 *               phone:
 *                 type: string
 *                 example: 9777240070
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Bad request
 *       409:
 *         description: Email already registered
 */
router.post('/register', registerValidationRules(), validate, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: muskan@nimu.com
 *               password:
 *                 type: string
 *                 example: Nimu@2026
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidationRules(), validate, login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */
router.get('/me', verifyToken, getMe);

module.exports = router;
