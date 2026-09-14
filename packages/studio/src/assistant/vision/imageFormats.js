const SUPPORTED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  'image/heic',
  'image/heif',
  'image/avif',
]);

const EXTENSION_TO_MIME = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  svg: 'image/svg+xml',
  heic: 'image/heic',
  heif: 'image/heif',
  avif: 'image/avif',
};

function normalizeMimeType(mimeType) {
  return (mimeType || '').toLowerCase();
}

function getExtension(filename = '') {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

export function inferMimeType({ mimeType, fileName }) {
  const normalized = normalizeMimeType(mimeType);
  if (normalized) {
    return normalized === 'image/jpg' ? 'image/jpeg' : normalized;
  }

  const extension = getExtension(fileName);
  return EXTENSION_TO_MIME[extension] || '';
}

export function isSupportedImageFormat(input = {}) {
  const inferredMimeType = inferMimeType(input);
  return SUPPORTED_MIME_TYPES.has(inferredMimeType);
}

export function normalizeImageInput(input = {}) {
  const mimeType = inferMimeType(input);
  if (!mimeType) {
    throw new Error('Unable to determine image format');
  }
  if (!isSupportedImageFormat({ mimeType })) {
    throw new Error(`Unsupported image format: ${mimeType}`);
  }
  if (!input.data && !input.url) {
    throw new Error('Image input requires binary data or URL');
  }

  return {
    ...input,
    mimeType,
  };
}

export function listSupportedImageFormats() {
  return Array.from(SUPPORTED_MIME_TYPES);
}

