const TONE_PROFILES = {
  supportive: {
    prefix: 'Supportive tone: ',
  },
  direct: {
    prefix: 'Direct tone: ',
  },
  concise: {
    prefix: 'Concise tone: ',
  },
  grounding_clarity: {
    prefix: 'Grounded and clear tone: ',
  },
};

export function getToneProfiles() {
  return Object.keys(TONE_PROFILES);
}

export function applyToneProfile(text, profile = 'supportive') {
  const config = TONE_PROFILES[profile] || TONE_PROFILES.supportive;
  return `${config.prefix}${text}`;
}

