const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Temp directory for video uploads before Cloudinary transfer
const uploadDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// diskStorage — needed for upload_large (true chunked upload to Cloudinary)
// memoryStorage causes "Request Timeout" on large files because upload_stream
// sends the entire buffer in one shot; upload_large reads from disk in true chunks.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadVideo = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only videos are allowed!'), false);
    }
  },
});

module.exports = uploadVideo;
