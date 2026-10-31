// The whole MongoDB structure in one readable file: one entry per collection
// with what it stores, its validation rules and its indexes.
//
// To add a field:      edit that collection's `validator`, then run `npm run db:setup`.
// To add an index:     add it to that collection's `indexes`, then run `npm run db:setup`.
// To add a collection: add a new entry here and to `collections()` in ../db.js.
//
// `db:setup` is idempotent and safe to re-run. Validation level is "moderate":
// new/updated documents must match, older documents are left alone.

export const PRODUCT_CATEGORIES = ['ring', 'necklace', 'earring', 'bracelet', 'bangle', 'frame', 'uncategorised'];
export const ORDER_STATUSES = [
  'placed_cod', 'pending_payment', 'paid', 'fulfilled',
  'cancelled', 'expired', 'refunded', 'payment_review',
];

const str = (extra = {}) => ({ bsonType: 'string', ...extra });
const date = { bsonType: 'date' };
const int = (extra = {}) => ({ bsonType: ['int', 'long'], ...extra });
const idOf = { bsonType: ['string', 'objectId'] };

export const SCHEMA = {
  // ── Customers & staff ───────────────────────────────────────────────────
  users: {
    description: 'One document per verified email. Staff are listed in ADMIN_EMAILS, not here.',
    validator: {
      bsonType: 'object',
      required: ['email', 'createdAt'],
      properties: {
        email: str({ pattern: '^[^@\\s]+@[^@\\s]+$', maxLength: 254, description: 'lower-case, unique' }),
        name: str({ maxLength: 100 }),
        phone: str({ pattern: '^\\d{10}$' }),
        emailVerifiedAt: date,
        lastLoginAt: date,
        createdAt: date,
      },
    },
    indexes: [{ key: { email: 1 }, options: { unique: true } }],
  },

  // ── Authentication ──────────────────────────────────────────────────────
  authChallenges: {
    description: 'Pending email one-time codes. _id = email. Only a peppered hash of the code is stored. Auto-deleted at expiresAt.',
    validator: {
      bsonType: 'object',
      required: ['codeDigest', 'attempts', 'expiresAt'],
      properties: {
        codeDigest: str({ minLength: 64, maxLength: 64 }),
        attempts: int({ minimum: 0 }),
        createdAt: date,
        lastSentAt: date,
        expiresAt: date,
      },
    },
    indexes: [{ key: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } }],
  },
  sessions: {
    description: 'Login sessions. Only the SHA-256 hash of the cookie token is stored. Auto-deleted at expiresAt.',
    validator: {
      bsonType: 'object',
      required: ['tokenHash', 'userId', 'email', 'expiresAt'],
      properties: {
        tokenHash: str({ minLength: 64, maxLength: 64 }),
        userId: { bsonType: 'objectId' },
        email: str(),
        createdAt: date,
        expiresAt: date,
      },
    },
    indexes: [
      { key: { tokenHash: 1 }, options: { unique: true } },
      { key: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } },
      { key: { userId: 1 } },
    ],
  },
  rateLimits: {
    description: 'Counters that throttle OTP requests. Auto-deleted at expiresAt.',
    validator: {
      bsonType: 'object',
      required: ['count', 'expiresAt'],
      properties: { count: int({ minimum: 0 }), windowStart: date, expiresAt: date },
    },
    indexes: [{ key: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } }],
  },

  // ── Catalog (image FILES live in Cloudinary; only references are stored) ─
  products: {
    description: 'Sellable items. Prices are integers in paise. Soft-deleted via active=false.',
    validator: {
      bsonType: 'object',
      required: ['sku', 'name', 'category', 'priceInPaise', 'currency', 'stockQuantity', 'active'],
      properties: {
        sku: str({ minLength: 1, maxLength: 64 }),
        name: str({ minLength: 1, maxLength: 160 }),
        description: str({ maxLength: 4000 }),
        category: { enum: PRODUCT_CATEGORIES },
        priceInPaise: int({ minimum: 1, maximum: 2147483647 }),
        currency: { enum: ['INR'] },
        stockQuantity: int({ minimum: 0 }),
        active: { bsonType: 'bool' },
        imageUrl: str({ maxLength: 500, description: 'legacy/fallback; prefer images[]' }),
        images: {
          bsonType: 'array',
          maxItems: 10,
          items: {
            bsonType: 'object',
            required: ['publicId', 'width', 'height'],
            properties: {
              publicId: str({ maxLength: 255, description: 'Cloudinary public ID' }),
              width: int({ minimum: 1 }),
              height: int({ minimum: 1 }),
              alt: str({ maxLength: 200 }),
            },
          },
        },
        createdAt: date,
        updatedAt: date,
        deletedAt: date,
      },
    },
    indexes: [
      { key: { sku: 1 }, options: { unique: true } },
      { key: { active: 1, category: 1, _id: 1 } },
    ],
  },

  // ── Orders & payments ───────────────────────────────────────────────────
  orders: {
    description: 'One per checkout. _id is the client request ID (makes checkout idempotent). Holds shipping phone/address and Razorpay transaction IDs.',
    validator: {
      bsonType: 'object',
      required: ['userId', 'email', 'status', 'paymentMethod', 'amountInPaise', 'currency', 'items', 'shipping', 'createdAt'],
      properties: {
        userId: { bsonType: 'objectId' },
        email: str(),
        status: { enum: ORDER_STATUSES },
        paymentMethod: { enum: ['razorpay', 'cod'] },
        amountInPaise: int({ minimum: 1 }),
        currency: { enum: ['INR'] },
        items: {
          bsonType: 'array',
          minItems: 1,
          maxItems: 20,
          items: {
            bsonType: 'object',
            required: ['productId', 'sku', 'name', 'quantity', 'unitPriceInPaise', 'lineTotalInPaise'],
            properties: {
              productId: idOf,
              sku: str(),
              name: str(),
              quantity: int({ minimum: 1, maximum: 10 }),
              unitPriceInPaise: int({ minimum: 1 }),
              lineTotalInPaise: int({ minimum: 1 }),
            },
          },
        },
        shipping: {
          bsonType: 'object',
          required: ['name', 'phone', 'address', 'city', 'state', 'postalCode', 'country'],
          properties: {
            name: str(),
            phone: str({ pattern: '^\\d{10}$' }),
            address: str(),
            city: str(),
            state: str(),
            postalCode: str({ pattern: '^\\d{6}$' }),
            country: { enum: ['IN'] },
          },
        },
        razorpayOrderId: str(),
        razorpayPaymentId: str({ description: 'the transaction ID' }),
        reservationExpiresAt: date,
        createdAt: date,
        updatedAt: date,
      },
    },
    indexes: [
      { key: { userId: 1, createdAt: -1 } },
      { key: { status: 1, createdAt: -1 } },
      { key: { razorpayOrderId: 1 }, options: { unique: true, sparse: true } },
      { key: { razorpayPaymentId: 1 }, options: { unique: true, sparse: true } },
      { key: { reservationExpiresAt: 1 }, options: { partialFilterExpression: { status: 'pending_payment' } } },
    ],
  },
  webhookEvents: {
    description: 'Processed Razorpay event IDs (_id) so retries are ignored. Auto-deleted after 180 days.',
    validator: {
      bsonType: 'object',
      required: ['eventType', 'receivedAt'],
      properties: { eventType: str(), receivedAt: date },
    },
    indexes: [{ key: { receivedAt: 1 }, options: { expireAfterSeconds: 60 * 60 * 24 * 180 } }],
  },
};
