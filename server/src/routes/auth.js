import { Router } from 'express';
import { createTransport } from 'nodemailer';
import { z } from 'zod';
import { collections } from '../db.js';
import { consumeRateLimit, createOpaqueToken, createOtp, hashToken, otpDigest, safeEqualHex } from '../security.js';

const emailSchema = z.string().trim().email().max(254).transform((email) => email.toLowerCase());
const requestSchema = z.object({ email: emailSchema }).strict();
const verifySchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/),
  name: z.string().trim().min(1).max(100).optional(),
}).strict();
const sessionDurationMs = 14 * 24 * 60 * 60 * 1000;

function setSessionCookie(res, token, config) {
  res.cookie('silveram_session', token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/api',
    maxAge: sessionDurationMs,
  });
}

export function createAuthRouter(config) {
  const router = Router();
  const mailer =
    config.smtpHost && config.smtpUser && config.smtpPassword && config.smtpFrom
      ? createTransport({
          host: config.smtpHost,
          port: config.smtpPort,
          secure: config.smtpSecure,
          auth: { user: config.smtpUser, pass: config.smtpPassword },
        })
      : null;

  router.post('/otp', async (req, res, next) => {
    try {
      const parsed = requestSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Enter a valid email address.' });
      if (!mailer) {
        return res.status(503).json({ error: 'Email verification is not configured yet.' });
      }

      const email = parsed.data.email;
      const ipAllowed = await consumeRateLimit(req.ip, 'otp-ip', 10, 60 * 60 * 1000);
      const emailAllowed = await consumeRateLimit(email, 'otp-email', 5, 60 * 60 * 1000);
      if (!ipAllowed || !emailAllowed) {
        return res.status(429).json({ error: 'Too many verification requests. Please try again later.' });
      }

      const { authChallenges } = collections();
      const existing = await authChallenges.findOne({ _id: email }, { projection: { lastSentAt: 1 } });
      if (
        existing?.lastSentAt &&
        Date.now() - existing.lastSentAt.getTime() < config.otpResendSeconds * 1000
      ) {
        return res.status(429).json({ error: 'Please wait before requesting another verification code.' });
      }

      const code = createOtp();
      const now = new Date();
      await authChallenges.replaceOne(
        { _id: email },
        {
          _id: email,
          codeDigest: otpDigest(email, code, config.otpPepper),
          attempts: 0,
          createdAt: now,
          lastSentAt: now,
          expiresAt: new Date(now.getTime() + config.otpTtlMinutes * 60 * 1000),
        },
        { upsert: true },
      );

      try {
        await mailer.sendMail({
          from: config.smtpFrom,
          to: email,
          subject: 'Your Silveram verification code',
          text: `Your Silveram verification code is ${code}. It expires in ${config.otpTtlMinutes} minutes. If you did not request this, you can ignore this email.`,
          html: `<p>Your Silveram verification code is <strong>${code}</strong>.</p><p>It expires in ${config.otpTtlMinutes} minutes. If you did not request this, you can ignore this email.</p>`,
        });
      } catch (error) {
        await authChallenges.deleteOne({ _id: email, codeDigest: otpDigest(email, code, config.otpPepper) });
        throw error;
      }

      return res.status(202).json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  router.post('/verify', async (req, res, next) => {
    try {
      if (!(await consumeRateLimit(req.ip, 'otp-verify-ip', 30, 60 * 60 * 1000))) {
        return res.status(429).json({ error: 'Too many verification attempts. Please try again later.' });
      }
      const parsed = verifySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Enter your email and the six-digit code.' });
      const { email, code, name } = parsed.data;
      const { authChallenges, users, sessions } = collections();
      const challenge = await authChallenges.findOne({ _id: email });
      if (!challenge || challenge.expiresAt <= new Date()) {
        await authChallenges.deleteOne({ _id: email });
        return res.status(400).json({ error: 'That code has expired. Request a new code.' });
      }

      const submittedDigest = otpDigest(email, code, config.otpPepper);
      if (!safeEqualHex(submittedDigest, challenge.codeDigest)) {
        await authChallenges.updateOne(
          { _id: email, attempts: { $lt: config.otpMaxAttempts } },
          { $inc: { attempts: 1 } },
        );
        return res.status(400).json({ error: 'That verification code is incorrect.' });
      }

      const consumed = await authChallenges.findOneAndDelete({
        _id: email,
        codeDigest: challenge.codeDigest,
        attempts: { $lt: config.otpMaxAttempts },
        expiresAt: { $gt: new Date() },
      });
      if (!consumed) return res.status(400).json({ error: 'That code is no longer valid. Request a new code.' });

      const now = new Date();
      const user = await users.findOneAndUpdate(
        { email },
        {
          $set: { emailVerifiedAt: now, lastLoginAt: now, ...(name ? { name } : {}) },
          $setOnInsert: { email, createdAt: now },
        },
        { upsert: true, returnDocument: 'after' },
      );

      const sessionToken = createOpaqueToken();
      await sessions.insertOne({
        tokenHash: hashToken(sessionToken),
        userId: user._id,
        email,
        createdAt: now,
        expiresAt: new Date(now.getTime() + sessionDurationMs),
      });
      setSessionCookie(res, sessionToken, config);
      return res.json({ user: { id: user._id.toString(), email: user.email, name: user.name || '' } });
    } catch (error) {
      next(error);
    }
  });

  router.get('/me', async (req, res, next) => {
    try {
      const token = req.cookies?.silveram_session;
      if (!token) return res.status(401).json({ error: 'Sign in to continue.' });
      const session = await collections().sessions.findOne({
        tokenHash: hashToken(token),
        expiresAt: { $gt: new Date() },
      });
      if (!session) return res.status(401).json({ error: 'Your session expired. Verify your email again.' });
      const user = await collections().users.findOne(
        { _id: session.userId },
        { projection: { email: 1, name: 1 } },
      );
      if (!user) return res.status(401).json({ error: 'Your account could not be found.' });
      return res.json({ user: { id: user._id.toString(), email: user.email, name: user.name || '' } });
    } catch (error) {
      next(error);
    }
  });

  router.post('/logout', async (req, res, next) => {
    try {
      const token = req.cookies?.silveram_session;
      if (token) await collections().sessions.deleteOne({ tokenHash: hashToken(token) });
      res.clearCookie('silveram_session', {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'lax',
        path: '/api',
      });
      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
