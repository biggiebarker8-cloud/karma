const ACCESSIBILITY_PROFILES = {
  standard: {
    responseLength: 'normal',
    pacing: 'normal',
    reminderCadence: 'normal',
    lowStimulationMode: false,
  },
  low_stimulation: {
    responseLength: 'short',
    pacing: 'slow',
    reminderCadence: 'minimal',
    lowStimulationMode: true,
  },
  focus_support: {
    responseLength: 'short',
    pacing: 'stepwise',
    reminderCadence: 'high',
    lowStimulationMode: true,
  },
  grounding_clarity: {
    responseLength: 'short',
    pacing: 'calm',
    reminderCadence: 'gentle',
    lowStimulationMode: true,
  },
};

export function getAccessibilityProfile(name = 'standard') {
  return ACCESSIBILITY_PROFILES[name] || ACCESSIBILITY_PROFILES.standard;
}

export function listAccessibilityProfiles() {
  return Object.keys(ACCESSIBILITY_PROFILES);
}

