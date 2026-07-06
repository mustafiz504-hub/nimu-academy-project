const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const fs = require('fs');

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

    const subFolder = req.query.folder || 'general';
    const folderPath = `nimu-academy/${subFolder}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folderPath, resource_type: 'auto' },
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

const getSignature = (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const subFolder = req.query.folder || 'general';
  const folderPath = `nimu-academy/${subFolder}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: folderPath },
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: folderPath,
  });
};

const uploadVideoChunked = async (req, res) => {
  const filePath = req.file?.path;
  try {
    // ── Step 1: Check file received ──────────────────────────────────────────
    if (!req.file || !filePath) {
      console.error('❌ [Upload] No file received by multer. req.file:', req.file);
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const fileSizeMB = (req.file.size / 1024 / 1024).toFixed(1);
    console.log(`\n📥 [Upload] File received: ${req.file.originalname}`);
    console.log(`   Size: ${fileSizeMB} MB | Temp path: ${filePath}`);
    console.log(`   MIME: ${req.file.mimetype}`);

    const subFolder = req.query.folder || 'general';
    const folderPath = `nimu-academy/${subFolder}`;

    // ── Step 2: Cloudinary upload ────────────────────────────────────────────
    // NOTE: In Cloudinary SDK v2, upload() with chunk_size handles large files
    // correctly. upload_large() returns undefined fields in SDK v2.
    console.log(`\n☁️  [Cloudinary] Starting upload → folder: ${folderPath}`);

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: folderPath,
      chunk_size: 6 * 1024 * 1024, // 6MB chunks
      timeout: 300000,
    });

    // ── Step 3: Success ──────────────────────────────────────────────────────
    console.log(`\n✅ [Cloudinary] Upload SUCCESS!`);
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   Duration: ${result.duration}s | Format: ${result.format}`);

    res.status(200).json({
      message: 'Video uploaded successfully to Cloudinary',
      videoUrl: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    // ── Step 4: Error details ────────────────────────────────────────────────
    console.error(`\n❌ [Upload] FAILED at Cloudinary step`);
    console.error(`   Error: ${error.message}`);
    console.error(`   HTTP: ${error.http_code} | Code: ${error.error?.code}`);
    res.status(500).json({ message: 'Server error during video upload', error: error.message });
  } finally {
    // ── Step 5: Cleanup temp file ────────────────────────────────────────────
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️  [Cleanup] Temp file deleted: ${filePath}`);
      } catch (e) {
        console.warn(`⚠️  [Cleanup] Could not delete temp file: ${e.message}`);
      }
    }
  }
};

module.exports = {
  uploadImage,
  getSignature,
  uploadVideoChunked,
};
