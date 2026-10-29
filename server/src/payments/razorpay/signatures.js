import { createHmac, timingSafeEqual } from 'node:crypto';

function isValidHexDigest(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
}

function safeCompareHex(expected, actual) {
  if (!isValidHexDigest(actual)) return false;
  const received = Buffer.from(actual, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function verifyRazorpayCheckoutSignature(orderId, paymentId, signature, secret) {
  if (!secret || !isValidHexDigest(signature)) return false;
  const expected = createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest();
  return safeCompareHex(expected, signature);
}

export function verifyRazorpayWebhookSignature(body, signature, secret) {
  if (!Buffer.isBuffer(body) || !secret || !isValidHexDigest(signature)) return false;
  const expected = createHmac('sha256', secret).update(body).digest();
  return safeCompareHex(expected, signature);
}
