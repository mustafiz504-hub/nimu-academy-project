const express = require('express');
const router = express.Router();
const { getAllStudents, searchStudent, createStudent, updateStudent, deleteStudent } = require('../controllers/student.controller');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Certificate student management
 */

/**
 * @swagger
 * /api/students/search:
 *   get:
 *     summary: Search for a student by phone, email, or student ID (public)
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number, email or student ID to search
 *     responses:
 *       200:
 *         description: Student found
 *       404:
 *         description: Student not found
 */
router.get('/search', searchStudent);

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students (admin/superadmin only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all students
 */
router.get('/', verifyToken, checkRole('admin', 'superadmin'), getAllStudents);

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Add a new student (admin/superadmin only)
 *     tags: [Students]
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
 *               student_name:
 *                 type: string
 *                 example: Amrit Kaur
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               email:
 *                 type: string
 *                 example: amrit@gmail.com
 *               course_name:
 *                 type: string
 *                 example: Advanced Cake Decorating
 *               completion_date:
 *                 type: string
 *                 example: 20 May 2026
 *     responses:
 *       201:
 *         description: Student added successfully
 *       409:
 *         description: Phone number already exists
 */
router.post('/', verifyToken, checkRole('admin', 'superadmin'), createStudent);

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update a student record (admin/superadmin only)
 *     tags: [Students]
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
 *               approved:
 *                 type: boolean
 *               completed:
 *                 type: boolean
 *               completion_date:
 *                 type: string
 *               course_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student updated
 *       404:
 *         description: Student not found
 */
router.put('/:id', verifyToken, checkRole('admin', 'superadmin'), updateStudent);

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete a student (admin/superadmin only)
 *     tags: [Students]
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
 *         description: Student deleted
 *       404:
 *         description: Student not found
 */
router.delete('/:id', verifyToken, checkRole('admin', 'superadmin'), deleteStudent);

module.exports = router;
