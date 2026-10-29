import { createHash } from 'node:crypto';

export const ALLOWED_FORMATS = 'jpg,jpeg,png,webp,avif';

export function cloudinaryEnabled(config) {
  return Boolean(config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret);
}

export function assertCloudinary(config) {
  if (!cloudinaryEnabled(config)) {
    const error = new Error('Cloudinary is not configured.');
    error.status = 503;
    throw error;
  }
}

// https://cloudinary.com/documentation/authentication_signatures
export function signParams(params, apiSecret) {
  const payload = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(payload + apiSecret).digest('hex');
}

/** Parameters the browser needs to upload straight to Cloudinary into `folder`. */
export function createUploadSignature(config, folder, now = Date.now()) {
  assertCloudinary(config);
  const params = {
    folder,
    allowed_formats: ALLOWED_FORMATS,
    timestamp: Math.floor(now / 1000),
  };
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
    apiKey: config.cloudinaryApiKey,
    signature: signParams(params, config.cloudinaryApiSecret),
    ...params,
  };
}

/** Optimised delivery URL (auto format/quality, width-capped). */
export function imageUrl(config, publicId, { width = 1200 } = {}) {
  return `https://res.cloudinary.com/${config.cloudinaryCloudName}/image/upload/f_auto,q_auto,c_limit,w_${width}/${publicId}`;
}

export async function destroyImage(config, publicId) {
  assertCloudinary(config);
  const params = { public_id: publicId, timestamp: Math.floor(Date.now() / 1000), invalidate: 'true' };
  const body = new URLSearchParams({
    ...params,
    api_key: config.cloudinaryApiKey,
    signature: signParams(params, config.cloudinaryApiSecret),
  });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/destroy`, {
    method: 'POST',
    body,
  });
  if (!response.ok) throw new Error('Cloudinary could not delete the image.');
}
