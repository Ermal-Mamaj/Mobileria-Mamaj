import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Resend } from 'resend';

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

router.post('/', contactLimiter, async (req, res) => {
  const { name, phone, message } = req.body || {};
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone, and message are required' });
  }
  if (String(name).length > 200 || String(phone).length > 50 || String(message).length > 5000) {
    return res.status(400).json({ error: 'One or more fields are too long' });
  }

  if (!resend || !process.env.CONTACT_TO_EMAIL || !process.env.CONTACT_FROM_EMAIL) {
    console.error('Contact route hit but RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL not configured');
    return res.status(503).json({ error: 'Contact form is not configured yet' });
  }

  try {
    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: undefined, // the visitor only gave a phone number, not an email
      subject: `New MAMAJ website inquiry from ${name}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to send contact email:', err);
    res.status(502).json({ error: 'Could not send message right now. Please try again later.' });
  }
});

export default router;
