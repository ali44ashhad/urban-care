/**
 * Cloudinary upload utility
 * Upload images (avatars, etc.) to Cloudinary and return public URL.
 * Requires .env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}

/**
 * Upload a buffer (from multer memory storage) to Cloudinary
 * @param {Buffer} buffer - file buffer
 * @param {string} folder - Cloudinary folder (e.g. 'urban-care/avatars')
 * @param {string} [resourceType] - 'image' | 'raw' (use 'raw' for PDF)
 * @returns {Promise<{ url: string, secure_url: string, public_id: string }>}
 */
async function uploadFromBuffer(buffer, folder = 'urban-care/avatars', resourceType = 'image') {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
  }
  if (resourceType === 'raw') {
    const dataUri = `data:application/octet-stream;base64,${buffer.toString('base64')}`;
    return cloudinary.uploader.upload(dataUri, { folder, resource_type: 'raw' });
  }
  const { Readable } = require('stream');
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

function isConfigured() {
  return !!(cloudName && apiKey && apiSecret);
}

module.exports = { cloudinary, uploadFromBuffer, isConfigured };
