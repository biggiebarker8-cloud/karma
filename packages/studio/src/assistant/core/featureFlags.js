const DEFAULT_FLAGS = {
  pluginsEnabled: true,
  jsonModeEnabled: true,
  voiceInputEnabled: true,
  voiceOutputEnabled: true,
  memoryEnabled: true,
  continuousLearningEnabled: true,
  internetReferencesEnabled: true,
  accessibilityModeEnabled: true,
};

export function createFeatureFlags(overrides = {}) {
  return {
    ...DEFAULT_FLAGS,
    ...overrides,
  };
}

export function isFlagEnabled(flags, flagName) {
  return Boolean(flags?.[flagName]);
}

