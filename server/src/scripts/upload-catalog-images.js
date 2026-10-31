// Usage: node --env-file=.env src/scripts/upload-catalog-images.js <imagesDir> [--no-db]
// Uploads the launch catalogue photographs (silver-frame-01.webp, silver-kada-01.webp,
// peacock-ring-01.webp, ...) to this environment's Cloudinary product folders, using
// the fixed public id <root>/<env>/products/<sku>/<file name without extension>.
// Re-running overwrites the same ids, so it is idempotent. Unless --no-db is passed it
// then stores the Cloudinary REFERENCES (never image data) on the three product records.
// It does not touch price, stock or the active flag.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { MongoClient } from 'mongodb';
import { loadConfig } from '../config.js';
import { assertCloudinary, signParams } from '../storage/cloudinary/client.js';
import { productFolder } from '../storage/cloudinary/folders.js';

const CATALOG = [
  { id: 'product-1', sku: 'SV-001', prefix: 'silver-frame', count: 6 },
  { id: 'product-2', sku: 'SV-002', prefix: 'silver-kada', count: 1 },
  { id: 'product-3', sku: 'SV-003', prefix: 'peacock-ring', count: 2 },
];
const ALT = {
  'silver-frame': 'Silver Frame – devotional Lakshmi and Ganesha frame',
  'silver-kada': 'Silver Kada – patterned silver bangles',
  'peacock-ring': 'Peacock Ring – gold-toned peacock statement ring',
};

const [dir, ...flags] = process.argv.slice(2);
if (!dir) throw new Error('Usage: upload-catalog-images.js <imagesDir> [--no-db]');
const writeDb = !flags.includes('--no-db');

const config = loadConfig();
assertCloudinary(config);

async function upload(file, publicId) {
  const params = { public_id: publicId, overwrite: 'true', timestamp: Math.floor(Date.now() / 1000) };
  const form = new FormData();
  form.set('file', new Blob([await readFile(file)], { type: 'image/webp' }), path.basename(file));
  form.set('api_key', config.cloudinaryApiKey);
  form.set('signature', signParams(params, config.cloudinaryApiSecret));
  for (const [key, value] of Object.entries(params)) form.set(key, String(value));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`, { method: 'POST', body: form });
  const result = await response.json();
  if (!response.ok) throw new Error(`Upload failed for ${file}: ${result?.error?.message}`);
  return result;
}

const byProduct = new Map();
for (const product of CATALOG) {
  const images = [];
  for (let n = 1; n <= product.count; n += 1) {
    const name = `${product.prefix}-${String(n).padStart(2, '0')}`;
    const result = await upload(path.join(dir, `${name}.webp`), `${productFolder(config, product.sku)}/${name}`);
    images.push({ publicId: result.public_id, width: result.width, height: result.height, alt: ALT[product.prefix] });
    console.error(`uploaded ${name} -> ${result.public_id}`);
  }
  byProduct.set(product.id, images);
}
console.error(`Cloudinary cloud name (public, for VITE_CLOUDINARY_CLOUD_NAME): ${config.cloudinaryCloudName}`);

if (writeDb) {
  const client = new MongoClient(config.mongoUri, { appName: 'silveram-catalog-images' });
  try {
    await client.connect();
    const products = client.db(config.mongoDbName).collection('products');
    for (const [id, images] of byProduct) {
      const result = await products.updateOne({ _id: id }, { $set: { images, updatedAt: new Date() } });
      console.error(`${id}: ${result.matchedCount ? 'image references saved' : 'NOT FOUND (run seed:catalog first)'}`);
    }
  } finally {
    await client.close();
  }
}
