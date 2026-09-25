import { PERMISSIONS } from '../core/permissions.js';
import { normalizeImageInput, listSupportedImageFormats } from './imageFormats.js';

export function createVisionAdapter({ imageAnalyzer, permissionChecker, auditLogger }) {
  return {
    requiredPermission: PERMISSIONS.IMAGE_READ,
    supportedFormats: listSupportedImageFormats(),
    async analyze(imageInput, options = {}) {
      if (!permissionChecker(PERMISSIONS.IMAGE_READ)) {
        throw new Error('Image read permission denied');
      }

      if (typeof imageAnalyzer !== 'function') {
        throw new Error('Image analyzer is not configured');
      }

      const normalizedInput = normalizeImageInput(imageInput);
      auditLogger?.log?.({
        type: 'vision.analyze.start',
        mimeType: normalizedInput.mimeType,
      });

      const result = await imageAnalyzer(normalizedInput, options);

      auditLogger?.log?.({
        type: 'vision.analyze.complete',
        mimeType: normalizedInput.mimeType,
      });

      return result;
    },
  };
}

