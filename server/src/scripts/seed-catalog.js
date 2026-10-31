import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Set MONGODB_URI in server/.env before seeding.');

// The launch catalogue is exactly THREE placeholder records. Their `_id`s match
// the storefront catalogue in src/features/products/data/products.ts; keep both in sync.
// Records are created INACTIVE with zero stock. Before activating one, replace the
// placeholder name, category, price and description, upload images, and set stock.
// priceInPaise is a 1-rupee technical placeholder (the schema requires a positive
// value); it is NOT a real price and inactive products can never be ordered.
const placeholder = (n, name) => ({
  _id: `product-${n}`,
  sku: `SV-00${n}`,
  name,
  description: '',
  category: 'uncategorised',
  priceInPaise: 100,
  currency: 'INR',
  stockQuantity: 0,
  active: false,
});

const products = [
  placeholder(1, 'Piece One'),
  placeholder(2, 'Piece Two'),
  placeholder(3, 'Piece Three'),
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
  console.log('Created missing inactive placeholder products. Existing catalog entries were not changed.');
} finally {
  await client.close();
}
