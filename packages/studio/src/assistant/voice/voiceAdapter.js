import { PERMISSIONS } from '../core/permissions.js';

export function createVoiceAdapter({ textToSpeech, permissionChecker, auditLogger }) {
  return {
    requiredPermission: PERMISSIONS.VOICE_OUTPUT,
    async synthesize(text, options = {}) {
      if (!permissionChecker(PERMISSIONS.VOICE_OUTPUT)) {
        throw new Error('Voice output permission denied');
      }
      auditLogger?.log?.({ type: 'voice.synthesize.start' });
      const audio = await textToSpeech(text, options);
      auditLogger?.log?.({ type: 'voice.synthesize.complete' });
      return audio;
    },
  };
}

