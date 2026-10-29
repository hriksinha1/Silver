// Read-only health/security audit:  npm run db:check
// Exits non-zero if something must be fixed before taking real orders.
import { MongoClient } from 'mongodb';
import { SCHEMA } from '../database/schema.js';

const problems = [];
const warnings = [];
const ok = (message) => console.log(`  ok   ${message}`);
const fail = (message) => { problems.push(message); console.log(`  FAIL ${message}`); };
const warn = (message) => { warnings.push(message); console.log(`  warn ${message}`); };

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Set MONGODB_URI in server/.env first.');
const isProduction = process.env.NODE_ENV === 'production';

console.log('Connection & configuration');
if (uri.startsWith('mongodb+srv://') || /tls=true|ssl=true/.test(uri)) ok('TLS-encrypted connection string');
else if (isProduction) fail('MONGODB_URI is not TLS-encrypted');
else warn('MONGODB_URI is not TLS-encrypted (acceptable for local development only)');
if (/mongodb(\+srv)?:\/\/[^:@/]+:[^@]*@/.test(uri)) ok('connects as a named database user');
else fail('MONGODB_URI has no username/password');
if (isProduction && !process.env.ADMIN_EMAILS?.trim()) fail('ADMIN_EMAILS is empty in production');
if (!process.env.CLOUDINARY_CLOUD_NAME) warn('Cloudinary is not configured (product images)');

const client = new MongoClient(uri, { appName: 'silveram-db-check', serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || 'silveram');
  await db.command({ ping: 1 });
  ok('database reachable');

  console.log('Structure');
  const infos = new Map((await db.listCollections().toArray()).map((c) => [c.name, c]));
  for (const [name, def] of Object.entries(SCHEMA)) {
    const info = infos.get(name);
    if (!info) { fail(`${name}: collection missing (run npm run db:setup)`); continue; }
    if (!info.options?.validator) fail(`${name}: no validator (run npm run db:setup)`);
    const present = new Set((await db.collection(name).indexes()).map((index) => JSON.stringify(index.key)));
    const missing = def.indexes.filter(({ key }) => !present.has(JSON.stringify(key)));
    if (missing.length) fail(`${name}: missing indexes ${missing.map(({ key }) => JSON.stringify(key)).join(', ')}`);
    else if (info.options?.validator) ok(`${name}: validator + ${def.indexes.length} indexes`);
  }

  console.log('Data integrity');
  const products = db.collection('products');
  const negative = await products.countDocuments({ stockQuantity: { $lt: 0 } });
  negative ? fail(`${negative} product(s) have negative stock`) : ok('no negative stock');
  const staleReservations = await db.collection('orders').countDocuments({
    status: 'pending_payment', reservationExpiresAt: { $lt: new Date(Date.now() - 24 * 3600 * 1000) },
  });
  staleReservations ? warn(`${staleReservations} unpaid order(s) hold stock past expiry >24h`) : ok('no stale stock reservations');
  const sellable = await products.countDocuments({ active: true });
  const badSellable = await products.countDocuments({
    active: true, $or: [{ images: { $exists: false } }, { images: { $size: 0 } }, { description: /^Replace with/ }],
  });
  badSellable ? warn(`${badSellable} of ${sellable} active product(s) have placeholder text or no Cloudinary images`) : ok('active products complete');
  const placeholders = await products.countDocuments({ description: /^Replace with/ });
  if (placeholders) warn(`${placeholders} sample product(s) still have placeholder descriptions`);
} finally {
  await client.close();
}

console.log(`\n${problems.length} problem(s), ${warnings.length} warning(s).`);
process.exitCode = problems.length ? 1 : 0;
