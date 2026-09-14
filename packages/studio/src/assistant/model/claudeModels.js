export const SUPPORTED_CLAUDE_MODELS = [
  'claude-sonnet-5',
  'claude-haiku-4.5',
];

export function isClaudeModel(model) {
  return typeof model === 'string' && model.startsWith('claude-');
}

export function resolveClaudeModel(requestedModel, fallbackModel = 'claude-sonnet-5') {
  if (SUPPORTED_CLAUDE_MODELS.includes(requestedModel)) {
    return requestedModel;
  }

  if (isClaudeModel(requestedModel)) {
    return requestedModel;
  }

  return fallbackModel;
}

