import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { sql } from '../db/index.js';
import { signToken, checkAdmin, generateCsrfToken, COOKIE_NAME, CSRF_COOKIE_NAME } from '../auth.js';

const router = Router();

// Throttle login attempts: 5 tries per 15 minutes per IP, regardless of outcome.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Same lifetime/scope as the session cookie, but NOT httpOnly — the client
// needs to read this one to echo it back as a header.
const CSRF_COOKIE_OPTS = { ...COOKIE_OPTS, httpOnly: false };

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const [user] = await sql`SELECT * FROM admin_users WHERE username = ${username}`;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
  res.cookie(CSRF_COOKIE_NAME, generateCsrfToken(), CSRF_COOKIE_OPTS);
  res.json({ username: user.username });
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTS, maxAge: undefined });
  res.clearCookie(CSRF_COOKIE_NAME, { ...CSRF_COOKIE_OPTS, maxAge: undefined });
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const admin = checkAdmin(req);
  if (!admin) return res.status(401).json({ loggedIn: false });
  res.json({ loggedIn: true, username: admin.username });
});

export default router;
