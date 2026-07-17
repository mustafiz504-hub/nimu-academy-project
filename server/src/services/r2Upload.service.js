const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = require('../config/r2');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Video file ko R2 pe upload karo (disk se stream karke)
 *
 * @param {string} filePath   - Local temp file path (multer diskStorage se)
 * @param {string} originalName - Original filename
 * @param {string} mimeType   - e.g. 'video/mp4'
 * @param {string} folder     - R2 folder prefix e.g. 'courses'
 * @returns {Promise<{videoUrl: string, key: string}>}
 */
const uploadVideoToR2 = async (filePath, originalName, mimeType, folder = 'general') => {
  const ext = path.extname(originalName) || '.mp4';
  const key = `nimu-academy/${folder}/${uuidv4()}${ext}`;

  const fileStream = fs.createReadStream(filePath);
  const fileSize = fs.statSync(filePath).size;

  console.log(`\n☁️  [R2] Starting upload → key: ${key}`);
  console.log(`   Size: ${(fileSize / 1024 / 1024).toFixed(1)} MB`);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: mimeType,
      ContentLength: fileSize,
    })
  );

  const videoUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  console.log(`\n✅ [R2] Upload SUCCESS!`);
  console.log(`   URL: ${videoUrl}`);

  return { videoUrl, key };
};

/**
 * R2 se video delete karo (URL se key nikalke)
 *
 * @param {string} videoUrl - Full public R2 URL
 * @returns {Promise<void>}
 */
const deleteVideoFromR2 = async (videoUrl) => {
  const key = videoUrl.replace(`${process.env.R2_PUBLIC_URL}/`, '');

  console.log(`\n🗑️  [R2] Deleting key: ${key}`);

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })
  );

  console.log(`✅ [R2] Delete SUCCESS`);
};

module.exports = { uploadVideoToR2, deleteVideoFromR2 };
