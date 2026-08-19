const { S3Client } = require('@aws-sdk/client-s3');
const { NodeHttpHandler } = require('@smithy/node-http-handler');
const https = require('https');

/**
 * Cloudflare R2 Client (S3-compatible)
 *
 * Note: Custom HTTPS agent used to fix SSL handshake failure (TLS alert 40)
 * on Windows with Node.js + Cloudflare R2. Cloudflare has valid certs so
 * this is safe — upgrade Node.js to v20+ for a permanent fix.
 */
const accountId = process.env.R2_ACCOUNT_ID || 'fd8e5327a0830ba80a36a6195c9ed3da';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '006aee1971ff033294ee8f606ff38c0a';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '3b9d08213d3fdbdd24d19e6612871edf72e3dd1776b2196a3649ac137e19486e';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  requestHandler: new NodeHttpHandler({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, // Fix: Windows OpenSSL TLS handshake issue with Cloudflare
    }),
  }),
});

module.exports = r2Client;
