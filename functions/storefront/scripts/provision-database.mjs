import { Client, Permission, Role, Storage, TablesDB } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import { fileURLToPath } from 'node:url';

const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = 'silveram-store';
const ordersTableId = 'orders';
const productsTableId = 'products';
const productImagesBucketId = 'product-images';

const orderColumns = [
  { key: 'userId', type: 'varchar', size: 36 },
  { key: 'email', type: 'varchar', size: 254 },
  { key: 'status', type: 'varchar', size: 32 },
  { key: 'paymentMethod', type: 'varchar', size: 20 },
  { key: 'amountInPaise', type: 'integer' },
  { key: 'currency', type: 'varchar', size: 3 },
  { key: 'itemsJson', type: 'text' },
  { key: 'shippingAddressJson', type: 'text' },
  { key: 'razorpayOrderId', type: 'varchar', size: 100 },
  { key: 'razorpayPaymentId', type: 'varchar', size: 100 },
  { key: 'createdAt', type: 'datetime' },
];

const productColumns = [
  { key: 'sku', type: 'varchar', size: 64 },
  { key: 'name', type: 'varchar', size: 160 },
  { key: 'description', type: 'text' },
  { key: 'category', type: 'varchar', size: 32 },
  { key: 'priceInPaise', type: 'integer' },
  { key: 'currency', type: 'varchar', size: 3 },
  { key: 'stockQuantity', type: 'integer' },
  { key: 'active', type: 'boolean' },
  { key: 'imageFileId', type: 'varchar', size: 36 },
];

const tableIndexes = [
  {
    tableId: productsTableId,
    key: 'sku_unique',
    type: 'unique',
    columns: ['sku'],
  },
  {
    tableId: productsTableId,
    key: 'active_category',
    type: 'key',
    columns: ['active', 'category'],
  },
  {
    tableId: ordersTableId,
    key: 'user_created',
    type: 'key',
    columns: ['userId', 'createdAt'],
    orders: ['ASC', 'DESC'],
  },
];

const starterProducts = [
  {
    id: 'product-celeste-diamond-ring',
    sku: 'SR-001',
    name: 'Celeste Diamond Ring',
    category: 'ring',
    priceInPaise: 2490000,
    imageFileId: 'product-ring',
    imageName: 'product-ring.webp',
  },
  {
    id: 'product-minimal-diamond-necklace',
    sku: 'SN-001',
    name: 'Minimal Diamond Necklace',
    category: 'necklace',
    priceInPaise: 1990000,
    imageFileId: 'product-necklace',
    imageName: 'product-necklace.webp',
  },
  {
    id: 'product-floral-pattern-earring',
    sku: 'SE-001',
    name: 'Floral Pattern Earring',
    category: 'earring',
    priceInPaise: 1490000,
    imageFileId: 'product-earring',
    imageName: 'product-earring.webp',
  },
  {
    id: 'product-solis-charm-bracelet',
    sku: 'SB-001',
    name: 'Solis Charm Bracelet',
    category: 'bracelet',
    priceInPaise: 1890000,
    imageFileId: 'product-bracelet',
    imageName: 'product-bracelet.webp',
  },
  {
    id: 'gold-statement-ring',
    sku: 'SR-002',
    name: 'Gold Statement Ring',
    category: 'ring',
    priceInPaise: 2990000,
    imageFileId: 'product-gold-statement-ring',
    imageName: 'hero-ring-box.webp',
  },
];

function assertEnvironment() {
  const missing = [
    !endpoint && 'APPWRITE_ENDPOINT',
    !projectId && 'APPWRITE_PROJECT_ID',
    !apiKey && 'APPWRITE_API_KEY',
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(`Set these local environment variables first: ${missing.join(', ')}`);
  }
}

async function ensureDatabase(tablesDB) {
  try {
    await tablesDB.get(databaseId);
  } catch (error) {
    if (error.code !== 404) throw error;
    await tablesDB.create(databaseId, 'Silveram Store', true, 'Silveram ecommerce data');
    console.log(`Created database: ${databaseId}`);
  }
}

async function ensureTable(tablesDB, tableId, name) {
  try {
    const table = await tablesDB.getTable(databaseId, tableId);
    if (!table.rowSecurity || table.permissions.length > 0) {
      throw new Error(
        `The existing ${tableId} table must have row security enabled and no table-level permissions.`
      );
    }
  } catch (error) {
    if (error.code !== 404) throw error;
    await tablesDB.createTable(
      databaseId,
      tableId,
      name,
      [],
      true,
      true
    );
    console.log(`Created private table: ${tableId}`);
  }
}

async function ensureColumns(tablesDB, tableId, columns) {
  const existing = await tablesDB.listColumns(databaseId, tableId);
  const existingByKey = new Map(existing.columns.map((column) => [column.key, column]));
  const expectedKeys = new Set(columns.map(({ key }) => key));
  const unexpectedRequired = existing.columns.find(
    (column) => column.required && !expectedKeys.has(column.key)
  );
  if (unexpectedRequired) {
    throw new Error(
      `Unexpected required column "${unexpectedRequired.key}" in ${tableId}; the Function does not provide it.`
    );
  }

  for (const definition of columns) {
    const current = existingByKey.get(definition.key);
    if (current) {
      const mismatch =
        current.type !== definition.type ||
        current.required !== true ||
        (definition.size && current.size < definition.size);
      if (mismatch) {
        throw new Error(`Existing attribute "${definition.key}" does not match the required schema.`);
      }
      continue;
    }

    if (definition.type === 'varchar') {
      await tablesDB.createVarcharColumn(
        databaseId,
        tableId,
        definition.key,
        definition.size,
        true
      );
    } else if (definition.type === 'text') {
      await tablesDB.createTextColumn(databaseId, tableId, definition.key, true);
    } else if (definition.type === 'integer') {
      await tablesDB.createIntegerColumn(
        databaseId,
        tableId,
        definition.key,
        true,
        0,
        2147483647
      );
    } else if (definition.type === 'boolean') {
      await tablesDB.createBooleanColumn(
        databaseId,
        tableId,
        definition.key,
        true
      );
    } else {
      await tablesDB.createDatetimeColumn(databaseId, tableId, definition.key, true);
    }
    console.log(`Created column: ${tableId}.${definition.key}`);
  }

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const result = await tablesDB.listColumns(databaseId, tableId);
    const current = new Map(result.columns.map((column) => [column.key, column]));
    const failed = columns.find((definition) => current.get(definition.key)?.status === 'failed');
    if (failed) throw new Error(`Appwrite could not create column "${tableId}.${failed.key}".`);
    if (columns.every((definition) => current.get(definition.key)?.status === 'available')) {
      console.log(`All columns in ${tableId} are available.`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for Appwrite to finish creating columns in ${tableId}.`);
}

async function ensureIndexes(tablesDB) {
  for (const definition of tableIndexes) {
    const result = await tablesDB.listIndexes(databaseId, definition.tableId);
    const existing = result.indexes.find((index) => index.key === definition.key);
    if (existing) {
      const matches =
        existing.type === definition.type &&
        JSON.stringify(existing.columns) === JSON.stringify(definition.columns) &&
        (!definition.orders ||
          JSON.stringify(existing.orders) === JSON.stringify(definition.orders));
      if (!matches) {
        throw new Error(
          `Existing index "${definition.tableId}.${definition.key}" does not match the required schema.`
        );
      }
      continue;
    }

    await tablesDB.createIndex(
      databaseId,
      definition.tableId,
      definition.key,
      definition.type,
      definition.columns,
      definition.orders
    );
    console.log(`Created index: ${definition.tableId}.${definition.key}`);
  }

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const results = await Promise.all(
      tableIndexes.map(async (definition) => {
        const result = await tablesDB.listIndexes(databaseId, definition.tableId);
        return { definition, index: result.indexes.find((item) => item.key === definition.key) };
      })
    );
    const failed = results.find(({ index }) => index?.status === 'failed' || index?.status === 'stuck');
    if (failed) {
      throw new Error(
        `Appwrite could not create index "${failed.definition.tableId}.${failed.definition.key}": ${failed.index.error || failed.index.status}`
      );
    }
    if (results.every(({ index }) => index?.status === 'available')) {
      console.log('All database indexes are available.');
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Timed out waiting for Appwrite to finish creating database indexes.');
}

async function ensureProductImagesBucket(storage) {
  try {
    const bucket = await storage.getBucket(productImagesBucketId);
    if (
      !bucket.fileSecurity ||
      bucket.permissions.length > 0 ||
      !bucket.encryption ||
      bucket.maximumFileSize > 5 * 1024 * 1024 ||
      bucket.allowedFileExtensions.length !== 1 ||
      bucket.allowedFileExtensions[0] !== 'webp'
    ) {
      throw new Error(
        'The existing image bucket must be private-by-default, encrypted, limited to WebP files up to 5 MB, and have no bucket-level permissions.'
      );
    }
  } catch (error) {
    if (error.code !== 404) throw error;
    await storage.createBucket(
      productImagesBucketId,
      'Silveram Product Images',
      [],
      true,
      true,
      5 * 1024 * 1024,
      ['webp'],
      undefined,
      true,
      false
    );
    console.log(`Created private product image bucket: ${productImagesBucketId}`);
  }
}

async function uploadProductImage(storage, product) {
  try {
    const file = await storage.getFile(productImagesBucketId, product.imageFileId);
    const expectedReadPermission = Permission.read(Role.any());
    if (
      file.$permissions.length !== 1 ||
      file.$permissions[0] !== expectedReadPermission
    ) {
      throw new Error(
        `Existing product image "${product.imageFileId}" must have public-read-only permissions.`
      );
    }
    return;
  } catch (error) {
    if (error.code !== 404) throw error;
  }

  const imagePath = fileURLToPath(
    new URL(`../../../public/images/${product.imageName}`, import.meta.url)
  );
  await storage.createFile(
    productImagesBucketId,
    product.imageFileId,
    InputFile.fromPath(imagePath, product.imageName),
    [Permission.read(Role.any())]
  );
  console.log(`Uploaded ${product.imageName}`);
}

async function ensureStarterProducts(tablesDB, storage) {
  for (const product of starterProducts) {
    await uploadProductImage(storage, product);
    try {
      const row = await tablesDB.getRow(databaseId, productsTableId, product.id);
      const expectedReadPermission = Permission.read(Role.any());
      if (
        row.$permissions.length !== 1 ||
        row.$permissions[0] !== expectedReadPermission
      ) {
        throw new Error(
          `Existing product "${product.id}" must have public-read-only permissions.`
        );
      }
    } catch (error) {
      if (error.code !== 404) throw error;
      await tablesDB.createRow(
        databaseId,
        productsTableId,
        product.id,
        {
          sku: product.sku,
          name: product.name,
          description: 'Replace with verified materials, dimensions, and care details.',
          category: product.category,
          priceInPaise: product.priceInPaise,
          currency: 'INR',
          stockQuantity: 0,
          active: false,
          imageFileId: product.imageFileId,
        },
        [Permission.read(Role.any())]
      );
      console.log(`Created inactive starter product: ${product.id}`);
    }
  }
}

async function main() {
  assertEnvironment();
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const tablesDB = new TablesDB(client);
  const storage = new Storage(client);

  await ensureDatabase(tablesDB);
  await ensureTable(tablesDB, ordersTableId, 'Orders');
  await ensureTable(tablesDB, productsTableId, 'Products');
  await ensureColumns(tablesDB, ordersTableId, orderColumns);
  await ensureColumns(tablesDB, productsTableId, productColumns);
  await ensureIndexes(tablesDB);
  await ensureProductImagesBucket(storage);
  await ensureStarterProducts(tablesDB, storage);

  console.log(`Database ID: ${databaseId}`);
  console.log(`Orders table ID: ${ordersTableId}`);
  console.log(`Products table ID: ${productsTableId}`);
  console.log(`Product image bucket ID: ${productImagesBucketId}`);
  console.log('Starter products are inactive with zero stock; no live orders can use them.');
  console.log('Tables and bucket have no broad permissions; product rows/images are individually public-read.');
}

main().catch((error) => {
  console.error(`Appwrite provisioning failed: ${error.message}`);
  process.exitCode = 1;
});
