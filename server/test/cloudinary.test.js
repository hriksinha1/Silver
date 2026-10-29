import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createUploadSignature, signParams } from '../src/storage/cloudinary/client.js';
import { isProductPublicId, productFolder, siteFolder } from '../src/storage/cloudinary/folders.js';

const config = {
  isProduction: false,
  cloudinaryRootFolder: 'silveram',
  cloudinaryCloudName: 'demo',
  cloudinaryApiKey: 'key',
  cloudinaryApiSecret: 'secret',
};

test('folders are namespaced by environment and slugged', () => {
  assert.equal(productFolder(config, 'SR-001'), 'silveram/development/products/sr-001');
  assert.equal(productFolder({ ...config, isProduction: true }, 'SR-001'), 'silveram/production/products/sr-001');
  assert.equal(siteFolder(config, 'hero'), 'silveram/development/site/hero');
  assert.throws(() => productFolder(config, '../..'), /Invalid SKU/);
  assert.throws(() => siteFolder(config, 'x'), /Invalid site/);
});

test('public ids must live directly inside the product folder', () => {
  const ok = 'silveram/development/products/sr-001/abc123';
  assert.ok(isProductPublicId(config, 'SR-001', ok));
  assert.ok(!isProductPublicId(config, 'SR-002', ok));
  assert.ok(!isProductPublicId(config, 'SR-001', `${ok}/../x`));
  assert.ok(!isProductPublicId(config, 'SR-001', 'silveram/production/products/sr-001/abc'));
});

test('upload signature matches the Cloudinary SHA-1 scheme', () => {
  const upload = createUploadSignature(config, 'silveram/development/products/sr-001', 1700000000000);
  const expected = createHash('sha1').update(
    'allowed_formats=jpg,jpeg,png,webp,avif&folder=silveram/development/products/sr-001&timestamp=1700000000secret',
  ).digest('hex');
  assert.equal(upload.signature, expected);
  assert.equal(upload.uploadUrl, 'https://api.cloudinary.com/v1_1/demo/image/upload');
  assert.equal(signParams({ b: 2, a: 1 }, 's'), createHash('sha1').update('a=1&b=2s').digest('hex'));
});
