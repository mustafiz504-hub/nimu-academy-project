const express = require('express');
const router = express.Router();
const { getGalleryImages, addGalleryImage, deleteGalleryImage } = require('../controllers/gallery.controller');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

router.get('/', getGalleryImages);
router.post('/', verifyToken, checkRole('admin', 'superadmin'), addGalleryImage);
router.delete('/:id', verifyToken, checkRole('admin', 'superadmin'), deleteGalleryImage);

module.exports = router;
