import { createTransport } from 'nodemailer';

let cached;

export function mailConfigured(config) {
  return Boolean(config.smtpHost && config.smtpUser && config.smtpPassword && config.smtpFrom);
}

// One pooled SMTP connection set shared by sign-in codes and order emails.
export function getMailer(config) {
  if (!mailConfigured(config)) return null;
  cached ??= createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    requireTLS: !config.smtpSecure,
    auth: { user: config.smtpUser, pass: config.smtpPassword },
    pool: true,
    maxConnections: 3,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return cached;
}
