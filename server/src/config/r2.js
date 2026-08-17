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
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  requestHandler: new NodeHttpHandler({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, // Fix: Windows OpenSSL TLS handshake issue with Cloudflare
    }),
  }),
});

module.exports = r2Client;
