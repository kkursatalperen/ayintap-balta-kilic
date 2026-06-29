import { v2 as cloudinary } from 'cloudinary';

let configured = false;
function ensureConfig() {
  if (configured) return !!process.env.CLOUDINARY_CLOUD_NAME;
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
    return true;
  }
  return false;
}

export async function uploadImage(dataUrl, folder = 'ayintap') {
  const ok = ensureConfig();
  if (!ok) {
    // Fallback: return the dataURL as-is so UI still works without keys
    return { url: dataUrl, public_id: null, fallback: true };
  }
  const res = await cloudinary.uploader.upload(dataUrl, {
    folder,
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  return { url: res.secure_url, public_id: res.public_id, fallback: false };
}

export async function deleteImage(public_id) {
  if (!ensureConfig() || !public_id) return { ok: false };
  await cloudinary.uploader.destroy(public_id);
  return { ok: true };
}
