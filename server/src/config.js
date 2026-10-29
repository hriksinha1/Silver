function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required server configuration: ${name}`);
  return value;
}

function positiveInteger(name, fallback) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

function secret(name) {
  const value = required(name);
  if (Buffer.byteLength(value, 'utf8') < 32) {
    throw new Error(`${name} must contain at least 32 bytes.`);
  }
  return value;
}

export function loadConfig() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const origins = (process.env.FRONTEND_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0 || origins.includes('*')) {
    throw new Error('FRONTEND_ORIGINS must contain explicit web origins and may not use "*".');
  }

  return {
    nodeEnv,
    isProduction: nodeEnv === 'production',
    port: positiveInteger('PORT', 4000),
    mongoUri: required('MONGODB_URI'),
    mongoDbName: process.env.MONGODB_DB_NAME?.trim() || 'silveram',
    sessionSecret: secret('SESSION_SECRET'),
    otpPepper: secret('OTP_PEPPER'),
    origins,
    adminEmails: new Set(
      (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
    liveCheckout: process.env.STORE_LIVE_CHECKOUT === 'true',
    otpTtlMinutes: positiveInteger('OTP_TTL_MINUTES', 10),
    otpMaxAttempts: positiveInteger('OTP_MAX_ATTEMPTS', 5),
    otpResendSeconds: positiveInteger('OTP_RESEND_SECONDS', 60),
    smtpHost: process.env.SMTP_HOST?.trim() || '',
    smtpPort: positiveInteger('SMTP_PORT', 587),
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    smtpFrom: process.env.SMTP_FROM?.trim() || '',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID?.trim() || '',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  };
}
