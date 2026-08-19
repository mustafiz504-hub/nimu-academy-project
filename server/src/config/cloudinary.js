const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ds3oirjrk',
  api_key: process.env.CLOUDINARY_API_KEY || '272361327377243',
  api_secret: process.env.CLOUDINARY_API_SECRET || '3F9c2NyK0mP2RDP9Lz37sfQLbYA',
  timeout: 300000, // 5 minutes — needed for large video uploads via upload_large
});

module.exports = cloudinary;
