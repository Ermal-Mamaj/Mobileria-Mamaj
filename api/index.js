import { app } from '../server/src/index.js';

// Vercel treats any file in /api as a serverless function. Since the Express
// app itself implements the (req, res) handler signature, we can hand it
// straight to Vercel's Node runtime without any extra adapter.
export default function handler(req, res) {
  return app(req, res);
}
