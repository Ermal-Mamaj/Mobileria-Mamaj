import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import './db/index.js';

import adminRoutes from './routes/admin.js';
import settingsRoutes from './routes/settings.js';
import categoriesRoutes from './routes/categories.js';
import productsRoutes from './routes/products.js';
import galleryRoutes from './routes/gallery.js';
import contentRoutes from './routes/content.js';
import uploadsRoutes from './routes/uploads.js';
import contactRoutes from './routes/contact.js';

const PORT = process.env.PORT || 3001;

export const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/admin', adminRoutes);
app.use('/api/site-settings', settingsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/contact', contactRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Only bind a listening port when run directly (local dev / a traditional
// host). On Vercel this file is imported by api/index.js instead, and the
// platform's own runtime handles the request/response cycle.
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`MAMAJ server listening on http://localhost:${PORT}`);
  });
}
