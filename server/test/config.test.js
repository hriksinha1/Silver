import assert from 'node:assert/strict';
import test from 'node:test';
import { loadConfig } from '../src/config.js';

const configNames = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'MONGODB_DB_NAME',
  'SESSION_SECRET',
  'OTP_PEPPER',
  'FRONTEND_ORIGINS',
  'TRUST_PROXY_HOPS',
  'STORE_LIVE_CHECKOUT',
  'RAZORPAY_ENABLED',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
];

function configure(t, values) {
  const previous = new Map(configNames.map((name) => [name, process.env[name]]));
  for (const name of configNames) delete process.env[name];
  Object.assign(process.env, {
    MONGODB_URI: 'mongodb://localhost:27017',
    SESSION_SECRET: 's'.repeat(32),
    OTP_PEPPER: 'p'.repeat(32),
    ...values,
  });
  t.after(() => {
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });
}

test('production config requires HTTPS website origins', (t) => {
  configure(t, { NODE_ENV: 'production' });
  assert.throws(() => loadConfig(), /valid HTTPS website origins/);
});

test('production config keeps COD checkout gated and Razorpay disabled by default', (t) => {
  configure(t, {
    NODE_ENV: 'production',
    FRONTEND_ORIGINS: 'https://silveram.example',
    TRUST_PROXY_HOPS: '1',
  });
  const config = loadConfig();
  assert.equal(config.liveCheckout, false);
  assert.equal(config.razorpayEnabled, false);
  assert.equal(config.trustProxyHops, 1);
});

test('Razorpay cannot be enabled before checkout and provider credentials are configured', (t) => {
  configure(t, {
    NODE_ENV: 'production',
    FRONTEND_ORIGINS: 'https://silveram.example',
    RAZORPAY_ENABLED: 'true',
  });
  assert.throws(() => loadConfig(), /Enable Razorpay only after checkout is enabled/);
});
