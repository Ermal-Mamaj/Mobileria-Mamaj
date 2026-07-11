import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
export const COOKIE_NAME = 'mamaj_admin';
export const CSRF_COOKIE_NAME = 'mamaj_csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Double-submit cookie pattern: the CSRF cookie is readable by JS (not
// httpOnly) so the client can echo it back as a header. A cross-site form
// post can send the cookie automatically but has no way to read it and
// therefore can't set the matching header, which is what actually blocks
// the forgery. The JWT cookie itself stays httpOnly throughout.
export function requireAdmin(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const cookieToken = req.cookies[CSRF_COOKIE_NAME];
    const headerToken = req.get(CSRF_HEADER_NAME);
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({ error: 'Invalid or missing CSRF token' });
    }
  }

  next();
}

export function checkAdmin(req) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
