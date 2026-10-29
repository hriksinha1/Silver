import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { collections } from './db.js';

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function otpDigest(email, code, pepper) {
  return createHmac('sha256', pepper).update(`${email}:${code}`).digest('hex');
}

export function safeEqualHex(left, right) {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createOpaqueToken() {
  return randomBytes(32).toString('base64url');
}

export function createOtp() {
  return randomInt(0, 1000000).toString().padStart(6, '0');
}

export async function consumeRateLimit(identity, action, limit, windowMs) {
  const now = new Date();
  const id = createHash('sha256').update(`${action}:${identity}`).digest('hex');
  const collection = collections().rateLimits;
  const update = [
    {
      $set: {
        windowStart: {
          $cond: [
            { $lte: [{ $ifNull: ['$windowStart', new Date(0)] }, new Date(now.getTime() - windowMs)] },
            now,
            '$windowStart',
          ],
        },
        count: {
          $cond: [
            { $lte: [{ $ifNull: ['$windowStart', new Date(0)] }, new Date(now.getTime() - windowMs)] },
            1,
            { $add: [{ $ifNull: ['$count', 0] }, 1] },
          ],
        },
        expiresAt: new Date(now.getTime() + windowMs + 60000),
      },
    },
  ];

  try {
    await collection.updateOne({ _id: id }, update, { upsert: true });
  } catch (error) {
    if (error?.code !== 11000) throw error;
    await collection.updateOne({ _id: id }, update);
  }
  const current = await collection.findOne({ _id: id }, { projection: { count: 1 } });
  return (current?.count ?? 0) <= limit;
}
