// Usage: node --env-file=.env src/scripts/upload-product-images.js <sku> <dir> [alt text]
// Uploads every image in <dir> to this environment's Cloudinary folder for <sku>
// and prints the `images` array to save on the product.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadConfig } from '../config.js';
import { createUploadSignature } from '../storage/cloudinary/client.js';
import { productFolder } from '../storage/cloudinary/folders.js';

const [sku, dir, alt = ''] = process.argv.slice(2);
if (!sku || !dir) throw new Error('Usage: upload-product-images.js <sku> <dir> [alt text]');

const config = loadConfig();
const folder = productFolder(config, sku);
const files = (await readdir(dir)).filter((name) => /\.(jpe?g|png|webp|avif)$/i.test(name)).sort();
const images = [];

for (const name of files) {
  const upload = createUploadSignature(config, folder);
  const form = new FormData();
  form.set('file', new Blob([await readFile(path.join(dir, name))]), name);
  form.set('api_key', upload.apiKey);
  form.set('timestamp', String(upload.timestamp));
  form.set('signature', upload.signature);
  form.set('folder', upload.folder);
  form.set('allowed_formats', upload.allowed_formats);
  const response = await fetch(upload.uploadUrl, { method: 'POST', body: form });
  const result = await response.json();
  if (!response.ok) throw new Error(`Upload failed for ${name}: ${result?.error?.message}`);
  images.push({ publicId: result.public_id, width: result.width, height: result.height, alt });
  console.error(`uploaded ${name} -> ${result.public_id}`);
}
console.log(JSON.stringify(images, null, 2));
