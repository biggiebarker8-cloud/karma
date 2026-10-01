const DEFAULT_FLAGS = {
  pluginsEnabled: true,
  openclawEnabled: true,
  creativePluginsEnabled: true,
  installExperienceEnabled: true,
  jsonModeEnabled: true,
  visionEnabled: true,
  voiceInputEnabled: true,
  voiceOutputEnabled: true,
  memoryEnabled: true,
  continuousLearningEnabled: true,
  internetReferencesEnabled: true,
  accessibilityModeEnabled: true,
  githubEnabled: true,
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
