import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Set MONGODB_URI in server/.env before seeding.');

const products = [
  {
    _id: 'product-celeste-diamond-ring',
    sku: 'SR-001',
    name: 'Celeste Diamond Ring',
    description: 'Replace with verified materials, dimensions, and care details.',
    category: 'ring',
    priceInPaise: 2490000,
    currency: 'INR',
    stockQuantity: 0,
    active: false,
    imageUrl: '/images/product-ring.webp',
  },
  {
    _id: 'product-minimal-diamond-necklace',
    sku: 'SN-001',
    name: 'Minimal Diamond Necklace',
    description: 'Replace with verified materials, dimensions, and care details.',
    category: 'necklace',
    priceInPaise: 1990000,
    currency: 'INR',
    stockQuantity: 0,
    active: false,
    imageUrl: '/images/product-necklace.webp',
  },
  {
    _id: 'product-floral-pattern-earring',
    sku: 'SE-001',
    name: 'Floral Pattern Earring',
    description: 'Replace with verified materials, dimensions, and care details.',
    category: 'earring',
    priceInPaise: 1490000,
    currency: 'INR',
    stockQuantity: 0,
    active: false,
    imageUrl: '/images/product-earring.webp',
  },
  {
    _id: 'product-solis-charm-bracelet',
    sku: 'SB-001',
    name: 'Solis Charm Bracelet',
    description: 'Replace with verified materials, dimensions, and care details.',
    category: 'bracelet',
    priceInPaise: 1890000,
    currency: 'INR',
    stockQuantity: 0,
    active: false,
    imageUrl: '/images/product-bracelet.webp',
  },
  {
    _id: 'gold-statement-ring',
    sku: 'SR-002',
    name: 'Gold Statement Ring',
    description: 'Replace with verified materials, dimensions, and care details.',
    category: 'ring',
    priceInPaise: 2990000,
    currency: 'INR',
    stockQuantity: 0,
    active: false,
    imageUrl: '/images/hero-ring-box.webp',
  },
];

const client = new MongoClient(uri, { appName: 'silveram-catalog-seed' });
try {
  await client.connect();
  const database = client.db(process.env.MONGODB_DB_NAME || 'silveram');
  const catalog = database.collection('products');
  const now = new Date();
  for (const product of products) {
    await catalog.updateOne(
      { _id: product._id },
      { $setOnInsert: { ...product, createdAt: now, updatedAt: now } },
      { upsert: true },
    );
  }
  console.log('Created missing inactive sample products. Existing catalog entries were not changed.');
} finally {
  await client.close();
}
