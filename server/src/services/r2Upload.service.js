const {
  PutObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} = require('@aws-sdk/client-s3');
const r2Client = require('../config/r2');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Video file ko R2 pe upload karo (reliable buffer / multipart upload)
 *
 * @param {string} filePath   - Local temp file path (multer diskStorage se)
 * @param {string} originalName - Original filename
 * @param {string} mimeType   - e.g. 'video/mp4'
 * @param {string} folder     - R2 folder prefix e.g. 'courses'
 * @returns {Promise<{videoUrl: string, key: string}>}
 */
const uploadVideoToR2 = async (filePath, originalName, mimeType, folder = 'general', trackingId = null) => {
  const ext = path.extname(originalName) || '.mp4';
  const key = `nimu-academy/${folder}/${uuidv4()}${ext}`;
  const fileSize = fs.statSync(filePath).size;
  const totalMB = (fileSize / 1024 / 1024).toFixed(1);

  console.log(`\n☁️  [R2] Starting upload → key: ${key}`);
  console.log(`   Size: ${totalMB} MB | MIME: ${mimeType}`);

  if (trackingId) {
    if (!global.uploadProgressTracker) global.uploadProgressTracker = new Map();
    global.uploadProgressTracker.set(trackingId, {
      progress: 20,
      status: 'uploading_to_cloud',
      message: `Uploading to Cloudflare R2 (0.0 / ${totalMB} MB)...`
    });
  }

  const PART_SIZE = 5 * 1024 * 1024; // 5 MB chunks for smooth progress steps

  if (fileSize <= PART_SIZE) {
    const buffer = fs.readFileSync(filePath);
    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );
    if (trackingId && global.uploadProgressTracker) {
      global.uploadProgressTracker.set(trackingId, {
        progress: 95,
        status: 'uploading_to_cloud',
        message: `Finalizing on Cloudflare R2 (${totalMB} MB)...`
      });
    }
  } else {
    // Multipart upload for files > 5MB
    const createRes = await r2Client.send(
      new CreateMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: mimeType,
      })
    );
    const uploadId = createRes.UploadId;
    const parts = [];
    let partNumber = 1;
    let offset = 0;

    try {
      while (offset < fileSize) {
        const end = Math.min(offset + PART_SIZE, fileSize);
        const buffer = Buffer.alloc(end - offset);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, buffer.length, offset);
        fs.closeSync(fd);

        const currentMB = (end / 1024 / 1024).toFixed(1);
        console.log(`   [R2 Multipart] Uploading part ${partNumber} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)...`);

        const partRes = await r2Client.send(
          new UploadPartCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            UploadId: uploadId,
            PartNumber: partNumber,
            Body: buffer,
          })
        );

        parts.push({
          PartNumber: partNumber,
          ETag: partRes.ETag,
        });

        offset = end;
        partNumber++;

        if (trackingId && global.uploadProgressTracker) {
          const pct = Math.round(20 + (offset / fileSize) * 74); // scales 20% -> 94%
          global.uploadProgressTracker.set(trackingId, {
            progress: pct,
            status: 'uploading_to_cloud',
            message: `Uploading to Cloudflare R2 (${currentMB} / ${totalMB} MB)...`
          });
        }
      }

      if (trackingId && global.uploadProgressTracker) {
        global.uploadProgressTracker.set(trackingId, {
          progress: 96,
          status: 'uploading_to_cloud',
          message: 'Combining parts on Cloudflare R2...'
        });
      }

      await r2Client.send(
        new CompleteMultipartUploadCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: { Parts: parts },
        })
      );
    } catch (err) {
      console.error(`❌ [R2 Multipart] Error, aborting uploadId ${uploadId}:`, err.message);
      try {
        await r2Client.send(
          new AbortMultipartUploadCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            UploadId: uploadId,
          })
        );
      } catch (abortErr) {}
      if (trackingId && global.uploadProgressTracker) {
        global.uploadProgressTracker.set(trackingId, {
          progress: 0,
          status: 'error',
          message: err.message || 'Cloud upload failed'
        });
      }
      throw err;
    }
  }

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
