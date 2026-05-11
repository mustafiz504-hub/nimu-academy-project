const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload an image to Cloudinary
 * @param {import('express').Request & { file?: any }} req
 * @param {import('express').Response} res
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Determine folder from query param (e.g. ?folder=products) or default to general
    const subFolder = req.query.folder || 'general';
    const folderPath = `nimu-academy/${subFolder}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
        }
        res.status(200).json({
          message: 'Image uploaded successfully',
          imageUrl: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error('Upload Controller Error:', error);
    res.status(500).json({ message: 'Server error during upload', error: error.message });
  }
};

module.exports = {
  uploadImage,
};
