import { PERMISSIONS } from '../core/permissions.js';

export function createHearingAdapter({ speechToText, permissionChecker, auditLogger }) {
  return {
    requiredPermission: PERMISSIONS.VOICE_INPUT,
    async transcribe(audioChunk) {
      if (!permissionChecker(PERMISSIONS.VOICE_INPUT)) {
        throw new Error('Voice input permission denied');
      }
      if (typeof speechToText !== 'function') {
        throw new Error('Speech-to-text is not configured');
      }
      auditLogger?.log?.({ type: 'voice.transcribe.start' });
      const text = await speechToText(audioChunk);
      auditLogger?.log?.({ type: 'voice.transcribe.complete' });
      return text;
    },
  };
}
