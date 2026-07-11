import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'node:crypto';
import { put } from '@vercel/blob';
import { requireAdmin } from '../auth.js';

const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp'];

// Resize/compress before storing: WebP at quality 88 is visually
// indistinguishable from the source for product photography, but typically
// runs 30-60% smaller than the original JPEG/PNG. Capping the longest edge
// at 2000px matters more than the format change — nothing on this site is
// ever displayed larger than that, so anything beyond it is wasted storage
// and bandwidth with zero visible benefit.
const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 88;

// multer parses the multipart upload into memory (not disk) — the buffer
// gets processed by sharp and handed straight to Blob storage, nothing ever
// touches the local filesystem, which matters because that filesystem is
// ephemeral on Vercel anyway.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // generous cap pre-compression; phone photos can be large
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) return cb(new Error('Only PNG, JPEG, or WebP images are allowed'));
    cb(null, true);
  },
});

const router = Router();

router.post('/', requireAdmin, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('Upload attempted but BLOB_READ_WRITE_TOKEN is not configured');
      return res.status(503).json({ error: 'Image storage is not configured yet' });
    }

    try {
      const optimized = await sharp(req.file.buffer)
        .rotate() // auto-orient using EXIF before resizing (phone photos otherwise end up sideways)
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      const filename = `${crypto.randomUUID()}.webp`;
      const blob = await put(filename, optimized, {
        access: 'public',
        contentType: 'image/webp',
        addRandomSuffix: false,
      });

      res.status(201).json({ url: blob.url });
    } catch (uploadErr) {
      console.error('Upload failed:', uploadErr);
      res.status(502).json({ error: 'Could not process or store the image right now' });
    }
  });
});

export default router;
