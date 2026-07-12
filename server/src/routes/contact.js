import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Resend } from 'resend';
import { sql } from '../db/index.js';
import { requireAdmin } from '../auth.js';

const router = Router();

// Resend is a plain HTTPS API call under the hood — no persistent SMTP
// connection to manage, which makes it a good fit for serverless platforms
// like Vercel where each request may hit a fresh, short-lived function
// instance.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Contact form abuse is a real risk once this is public — 5 submissions
// per 15 minutes per IP is generous for a real visitor, painful for a bot.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages sent. Please try again later.' },
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendEmail({ name, phone, message }) {
  if (!resend || !process.env.CONTACT_TO_EMAIL || !process.env.CONTACT_FROM_EMAIL) return false;
  await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL,
    to: process.env.CONTACT_TO_EMAIL,
    subject: `New MAMAJ website inquiry from ${name}`,
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `,
  });
  return true;
}

router.post('/', contactLimiter, async (req, res) => {
  const { name, phone, message } = req.body || {};
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone, and message are required' });
  }
  if (String(name).length > 200 || String(phone).length > 50 || String(message).length > 5000) {
    return res.status(400).json({ error: 'One or more fields are too long' });
  }

  // Persist first. An enquiry is a sales lead — losing one because an email
  // provider isn't set up yet (or is briefly down) is the worst outcome here,
  // so the database is the source of truth and email is only a notification.
  let saved;
  try {
    [saved] = await sql`
      INSERT INTO contact_messages (name, phone, message)
      VALUES (${name}, ${phone}, ${message})
      RETURNING id
    `;
  } catch (err) {
    console.error('Failed to store contact message:', err);
    return res.status(500).json({ error: 'Could not send message right now. Please try again later.' });
  }

  try {
    if (await sendEmail({ name, phone, message })) {
      await sql`UPDATE contact_messages SET emailed = TRUE WHERE id = ${saved.id}`;
    }
  } catch (err) {
    // The lead is already safe in the CMS, so this must not fail the request.
    console.error('Contact message stored but email notification failed:', err);
  }

  res.json({ ok: true });
});

// --- Admin inbox ---

router.get('/', requireAdmin, async (req, res) => {
  const rows = await sql`SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC`;
  res.json(rows);
});

router.put('/:id/read', requireAdmin, async (req, res) => {
  const [row] = await sql`
    UPDATE contact_messages SET is_read = ${req.body?.is_read !== false} WHERE id = ${req.params.id} RETURNING *
  `;
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  await sql`DELETE FROM contact_messages WHERE id = ${req.params.id}`;
  res.json({ ok: true });
});

export default router;
