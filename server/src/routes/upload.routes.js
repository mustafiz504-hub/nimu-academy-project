const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadVideo = require('../middleware/uploadVideo');
const { uploadImage, getSignature, uploadVideoChunked } = require('../controllers/upload.controller');

router.get('/signature', getSignature);
router.post('/video', uploadVideo.single('video'), uploadVideoChunked);

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload an image to Cloudinary
 *     tags: [Utility]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           enum: [products, users, courses, banners]
 *         description: Subfolder in nimu-academy
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.post('/', upload.single('image'), uploadImage);

module.exports = router;
