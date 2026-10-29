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
  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || (nodeEnv === 'production' ? 1 : 0));
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
    throw new Error('TRUST_PROXY_HOPS must be a non-negative integer.');
  }
  const origins = (process.env.FRONTEND_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0 || origins.includes('*')) {
    throw new Error('FRONTEND_ORIGINS must contain explicit web origins and may not use "*".');
  }
  if (nodeEnv === 'production' && origins.some((origin) => {
    try {
      return new URL(origin).protocol !== 'https:' || /localhost|127\.0\.0\.1/.test(new URL(origin).hostname);
    } catch {
      return true;
    }
  })) {
    throw new Error('Production FRONTEND_ORIGINS must contain only valid HTTPS website origins.');
  }

  const razorpayEnabled = process.env.RAZORPAY_ENABLED === 'true';
  const liveCheckout = process.env.STORE_LIVE_CHECKOUT === 'true';
  if (razorpayEnabled && (!liveCheckout || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !process.env.RAZORPAY_WEBHOOK_SECRET)) {
    throw new Error('Enable Razorpay only after checkout is enabled and all Razorpay keys are configured.');
  }

  const cloudinaryVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const cloudinarySet = cloudinaryVars.filter((name) => process.env[name]?.trim());
  if (cloudinarySet.length > 0 && cloudinarySet.length < cloudinaryVars.length) {
    throw new Error('Set all of CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, or none.');
  }
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(process.env.CLOUDINARY_ROOT_FOLDER?.trim() || 'silveram')) {
    throw new Error('CLOUDINARY_ROOT_FOLDER may only contain lowercase letters, numbers, "-" and "_".');
  }

  return {
    nodeEnv,
    isProduction: nodeEnv === 'production',
    trustProxyHops: trustProxyHops === 0 ? false : trustProxyHops,
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
    productImageHosts: new Set(
      (process.env.PRODUCT_IMAGE_HOSTS || '')
        .split(',')
        .map((host) => host.trim().toLowerCase())
        .filter(Boolean),
    ),
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() || '',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY?.trim() || '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
    cloudinaryRootFolder: process.env.CLOUDINARY_ROOT_FOLDER?.trim() || 'silveram',
    liveCheckout,
    razorpayEnabled,
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
