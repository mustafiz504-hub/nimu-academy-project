const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const fs = require('fs');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const r2Client = require('../config/r2');
const { v4: uuidv4 } = require('uuid');

const { uploadVideoToR2 } = require('../services/r2Upload.service');
// ─────────────────────────────────────────────────────────────────────────────

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
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '3F9c2NyK0mP2RDP9Lz37sfQLbYA';
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'ds3oirjrk';
  const apiKey = process.env.CLOUDINARY_API_KEY || '272361327377243';

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: folderPath },
    apiSecret
  );

  res.json({
    signature,
    timestamp,
    cloudName,
    apiKey,
    folder: folderPath,
  });
};

const getUploadProgress = (req, res) => {
  const { trackingId } = req.query;
  if (!trackingId || !global.uploadProgressTracker || !global.uploadProgressTracker.has(trackingId)) {
    return res.json({ progress: 0, status: 'idle', message: '' });
  }
  const data = global.uploadProgressTracker.get(trackingId);
  res.json(data);
};

const uploadVideoChunked = async (req, res) => {
  const filePath = req.file?.path;
  const trackingId = req.query.trackingId;

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

    if (trackingId) {
      if (!global.uploadProgressTracker) global.uploadProgressTracker = new Map();
      global.uploadProgressTracker.set(trackingId, {
        progress: 18,
        status: 'uploading_to_cloud',
        message: `Processing on server (${fileSizeMB} MB)...`
      });
    }

    const subFolder = req.query.folder || 'general';
    const folderPath = `nimu-academy/${subFolder}`;

    // ══════════════════════════════════════════════════════════════════════════
    // ✅ R2 BLOCK (Currently Active)
    // ══════════════════════════════════════════════════════════════════════════
    const { videoUrl, key } = await uploadVideoToR2(
      filePath,
      req.file.originalname,
      req.file.mimetype,
      subFolder,
      trackingId
    );

    if (trackingId && global.uploadProgressTracker) {
      global.uploadProgressTracker.set(trackingId, {
        progress: 100,
        status: 'done',
        message: 'Cloud upload complete!'
      });
      setTimeout(() => global.uploadProgressTracker?.delete(trackingId), 300000);
    }

    res.status(200).json({
      message: 'Video uploaded successfully',
      videoUrl,
      public_id: key,
    });
    // ══════════════════════════════════════════════════════════════════════════
    // 🔵 CLOUDINARY BLOCK (Inactive - backup)
    // ══════════════════════════════════════════════════════════════════════════
    // const result = await cloudinary.uploader.upload(filePath, {
    //   resource_type: 'video',
    //   folder: folderPath,
    //   chunk_size: 6 * 1024 * 1024,
    //   timeout: 300000,
    // });
    // res.status(200).json({
    //   message: 'Video uploaded successfully',
    //   videoUrl: result.secure_url,
    //   public_id: result.public_id,
    // });
    // ══════════════════════════════════════════════════════════════════════════

  } catch (error) {
    // ── Error details ────────────────────────────────────────────────────────
    console.error(`\n❌ [Upload] FAILED`);
    console.error(`   Error: ${error.message}`);
    if (trackingId && global.uploadProgressTracker) {
      global.uploadProgressTracker.set(trackingId, {
        progress: 0,
        status: 'error',
        message: error.message || 'Server error during upload'
      });
    }
    res.status(500).json({ message: 'Server error during video upload', error: error.message });
  } finally {
    // ── Cleanup temp file ────────────────────────────────────────────────────
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

/**
 * Generate a presigned PUT URL for direct mobile → R2 upload
 * Mobile uses this URL to upload video directly without touching server disk
 */
const getR2PresignedUrl = async (req, res) => {
  try {
    const folder = req.query.folder || 'courses';
    const filename = req.query.filename || 'video.mp4';
    const mimeType = req.query.mimeType || 'video/mp4';

    const ext = path.extname(filename) || '.mp4';
    const key = `nimu-academy/${folder}/${uuidv4()}${ext}`;

    const bucketName = process.env.R2_BUCKET_NAME || 'nimu-academy-videos';
    const publicUrl = (process.env.R2_PUBLIC_URL || 'https://pub-8d569d923b41447ba0ac57f09f8b39ba.r2.dev').replace(/\/$/, '');

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: mimeType,
    });

    // Presigned URL valid for 1 hour
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    const videoUrl = `${publicUrl}/${key}`;

    console.log(`\n🔑 [R2 Presigned] Generated URL for key: ${key}`);

    res.json({ uploadUrl, videoUrl, key });
  } catch (error) {
    console.error(`\n❌ [R2 Presigned] Failed: ${error.message}`);
    res.status(500).json({ message: 'Failed to generate upload URL', error: error.message });
  }
};

module.exports = {
  uploadImage,
  getSignature,
  uploadVideoChunked,
  getR2PresignedUrl,
  getUploadProgress,
};
