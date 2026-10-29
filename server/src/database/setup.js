// Creates/updates every collection, validator and index from ./schema.js.
// Safe to re-run any time:  npm run db:setup
import { MongoClient } from 'mongodb';
import { SCHEMA } from './schema.js';

export async function applySchema(db, log = () => {}) {
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));
  for (const [name, def] of Object.entries(SCHEMA)) {
    const validation = {
      validator: { $jsonSchema: def.validator },
      validationLevel: 'moderate',
      validationAction: 'error',
    };
    let validated = true;
    try {
      if (existing.has(name)) await db.command({ collMod: name, ...validation });
      else await db.createCollection(name, validation);
    } catch (error) {
      // The app's runtime user is readWrite-only on purpose (least privilege).
      // Validators need dbAdmin: run this once with MONGODB_SETUP_URI set.
      if (error?.code !== 8000 && error?.code !== 13) throw error;
      validated = false;
      log(`${name}: SKIPPED validator (user lacks dbAdmin; set MONGODB_SETUP_URI)`);
      if (!existing.has(name)) await db.createCollection(name).catch(() => {});
    }
    const collection = db.collection(name);
    for (const { key, options } of def.indexes) await collection.createIndex(key, options);
    log(`${name}: ${validated ? 'validator + ' : ''}${def.indexes.length} indexes ok`);
  }
}

export async function runSetup() {
  const uri = process.env.MONGODB_SETUP_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGODB_URI in server/.env first.');
  const client = new MongoClient(uri, { appName: 'silveram-db-setup' });
  try {
    await client.connect();
    await applySchema(client.db(process.env.MONGODB_DB_NAME || 'silveram'), console.log);
    console.log('Database is ready.');
  } finally {
    await client.close();
  }
}
