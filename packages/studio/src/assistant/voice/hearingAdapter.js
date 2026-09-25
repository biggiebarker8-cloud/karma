import { PERMISSIONS } from '../core/permissions.js';

export function createHearingAdapter({ speechToText, permissionChecker, auditLogger }) {
  return {
    requiredPermission: PERMISSIONS.VOICE_INPUT,
    async transcribe(audioChunk) {
      if (!permissionChecker(PERMISSIONS.VOICE_INPUT)) {
        throw new Error('Voice input permission denied');
      }
      auditLogger?.log?.({ type: 'voice.transcribe.start' });
      const text = await speechToText(audioChunk);
      auditLogger?.log?.({ type: 'voice.transcribe.complete' });
      return text;
    },
  };
}

