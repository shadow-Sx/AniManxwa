const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads a buffer directly (no temp file on disk — important since Render's
// filesystem is ephemeral and would lose files on every redeploy/restart).
function uploadBuffer(buffer, folder, resourceType = 'image') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

async function deleteByPublicId(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    /* ignore — not fatal if cleanup fails */
  }
}

// Splits one tall manhwa strip into ~`count` short horizontal slices, purely
// as URL strings — Cloudinary crops each on first request and caches it on
// its CDN, so this never touches our own server or storage. The last slice
// absorbs whatever height doesn't divide evenly.
function buildSliceUrls(publicId, width, height, count = 100) {
  if (!width || !height) return [];
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const sliceHeight = Math.max(1, Math.floor(height / count));
  const urls = [];
  for (let i = 0; i < count; i++) {
    const y = i * sliceHeight;
    if (y >= height) break;
    const h = i === count - 1 ? height - y : Math.min(sliceHeight, height - y);
    urls.push(`https://res.cloudinary.com/${cloudName}/image/upload/c_crop,w_${width},h_${h},x_0,y_${y}/f_auto,q_auto/${publicId}`);
  }
  return urls;
}

module.exports = { cloudinary, uploadBuffer, deleteByPublicId, buildSliceUrls };
