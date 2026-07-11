// Resizes and compresses an image entirely in the browser, before it ever
// leaves the device. This used to happen server-side with sharp, but doing
// it here means the upload itself is already small by the time it starts —
// much faster in practice than sending a full-size phone photo to a server
// first and compressing it there.
//
// 2000px cap + WebP quality 0.88 is visually lossless for product photography
// (nothing on the site displays images larger than that), while typically
// cutting a phone photo down by 70-90%.
const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 0.88;

export async function compressImage(file, { maxDimension = MAX_DIMENSION, quality = WEBP_QUALITY } = {}) {
  // createImageBitmap respects embedded EXIF orientation by default, so a
  // sideways phone photo still comes out right-side up after this.
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Image compression failed'))), 'image/webp', quality);
  });

  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
}
