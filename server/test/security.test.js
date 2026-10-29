import assert from 'node:assert/strict';
import test from 'node:test';
import { createOtp, createOpaqueToken, hashToken, otpDigest, safeEqualHex } from '../src/security.js';

test('OTP generation returns exactly six digits', () => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    assert.match(createOtp(), /^\d{6}$/);
  }
});

test('OTP digests are scoped to email and secret pepper', () => {
  const digest = otpDigest('customer@example.com', '012345', 'a'.repeat(32));
  assert.equal(safeEqualHex(digest, otpDigest('customer@example.com', '012345', 'a'.repeat(32))), true);
  assert.equal(safeEqualHex(digest, otpDigest('other@example.com', '012345', 'a'.repeat(32))), false);
  assert.equal(safeEqualHex(digest, otpDigest('customer@example.com', '012345', 'b'.repeat(32))), false);
});

test('session tokens are opaque and only their hash is persisted', () => {
  const first = createOpaqueToken();
  const second = createOpaqueToken();
  assert.notEqual(first, second);
  assert.notEqual(first, hashToken(first));
  assert.equal(hashToken(first), hashToken(first));
});
