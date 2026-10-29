import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import {
  verifyRazorpayCheckoutSignature,
  verifyRazorpayWebhookSignature,
} from '../src/payments/razorpay/signatures.js';

const secret = 'razorpay-test-secret';

test('checkout signatures are verified against the order and payment IDs', () => {
  const signature = createHmac('sha256', secret)
    .update('order-123|payment-456')
    .digest('hex');
  assert.equal(verifyRazorpayCheckoutSignature('order-123', 'payment-456', signature, secret), true);
  assert.equal(verifyRazorpayCheckoutSignature('order-123', 'payment-other', signature, secret), false);
  assert.equal(verifyRazorpayCheckoutSignature('order-123', 'payment-456', 'not-a-signature', secret), false);
});

test('webhook signatures reject invalid, malformed, and unconfigured values', () => {
  const body = Buffer.from('{"event":"payment.captured"}');
  const signature = createHmac('sha256', secret).update(body).digest('hex');
  assert.equal(verifyRazorpayWebhookSignature(body, signature, secret), true);
  assert.equal(verifyRazorpayWebhookSignature(Buffer.from('different body'), signature, secret), false);
  assert.equal(verifyRazorpayWebhookSignature(body, 'z'.repeat(64), secret), false);
  assert.equal(verifyRazorpayWebhookSignature(body, signature, ''), false);
});
