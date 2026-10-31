import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Set MONGODB_URI in server/.env before seeding.');

// The launch catalogue is exactly THREE records. Their `_id`s, names, prices and
// categories match src/features/products/data/products.ts; keep both in sync.
//
// Safety rules, deliberately unchanged:
//  - Records are created INACTIVE with ZERO stock. This script never activates a
//    product and never sets stock. Do both yourself, after verifying real stock.
//  - If a record already exists it is only refreshed while it is still inactive,
//    and only its catalogue copy (name, description, category, price) is touched.
//    Active records, stock and images are never modified by this script.
//  - Prices are in paise (₹999 = 99900).
const products = [
  {
    _id: 'product-1',
    sku: 'SV-001',
    name: 'Silver Frame',
    description:
      'A timeless expression of devotion, beautifully crafted with intricate representations of Goddess Lakshmi and Lord Ganesha. Its detailed silver-finish artwork and elegant transparent stand make it a thoughtful addition to your home temple. A meaningful gift for festivals, celebrations and auspicious occasions.',
    category: 'frame',
    priceInPaise: 99900,
  },
  {
    _id: 'product-2',
    sku: 'SV-002',
    name: 'Silver Kada',
    description:
      'Celebrate traditional artistry with an elegant collection of intricately patterned silver bangles. Beautifully detailed surfaces create a distinctive play of light and texture, making them suitable for festive occasions and everyday ethnic styling. A graceful addition to your jewellery collection.',
    category: 'bangle',
    priceInPaise: 99900,
  },
  {
    _id: 'product-3',
    sku: 'SV-003',
    name: 'Peacock Ring',
    description:
      'Inspired by the timeless beauty of the Indian peacock, this statement ring showcases vibrant enamel-like detailing and colourful gemstone accents. Its intricate craftsmanship and striking silhouette create an elegant centrepiece for special occasions. A distinctive jewellery piece for those who appreciate artistic design.',
    category: 'ring',
    priceInPaise: 1299900,
  },
];

const client = new MongoClient(uri, { appName: 'silveram-catalog-seed' });
try {
  await client.connect();
  const database = client.db(process.env.MONGODB_DB_NAME || 'silveram');
  const catalog = database.collection('products');
  const now = new Date();
  for (const { _id, ...copy } of products) {
    const exists = await catalog.findOne({ _id }, { projection: { active: 1 } });
    if (!exists) {
      await catalog.insertOne({ _id, ...copy, currency: 'INR', stockQuantity: 0, active: false, createdAt: now, updatedAt: now });
      console.log(`${_id}: created (inactive, stock 0).`);
    } else if (exists.active !== true) {
      await catalog.updateOne({ _id, active: { $ne: true } }, { $set: { ...copy, updatedAt: now } });
      console.log(`${_id}: catalogue copy refreshed (still inactive).`);
    } else {
      console.log(`${_id}: already active, left unchanged.`);
    }
  }
} finally {
  await client.close();
}
