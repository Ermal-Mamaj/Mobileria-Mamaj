import { Router } from 'express';
import { handleUpload } from '@vercel/blob/client';
import { verifyAdminRequest } from '../auth.js';

const router = Router();

// This route no longer receives the file itself. The browser uploads
// directly to Vercel Blob (see client/src/lib/blobUpload.js) and only asks
// this endpoint for a short-lived, scoped upload token first. That sidesteps
// two problems with the old server-relay approach: Vercel Functions cap
// request bodies at 4.5MB, and every upload was paying for two network hops
// (browser -> our function -> Blob) instead of one.
//
// Vercel Blob also calls this same URL itself once the client's direct
// upload finishes (the onUploadCompleted step below), so we can't gate the
// whole route with the requireAdmin *middleware* — that call won't carry our
// admin cookies. Auth is instead checked inside onBeforeGenerateToken, which
// only runs for the token-issuing step.
router.post('/', async (req, res) => {
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => {
        const admin = verifyAdminRequest(req);
        if (!admin) throw new Error('Not authenticated');
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          addRandomSuffix: true,
          maximumSizeInBytes: 8 * 1024 * 1024, // generous headroom above what compressed uploads should ever produce
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Blob upload completed:', blob.url);
      },
    });
    res.json(jsonResponse);
  } catch (err) {
    console.error('Upload token error:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
