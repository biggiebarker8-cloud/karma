export const SUPPORTED_CLAUDE_MODELS = [
  'claude-sonnet-5',
  'claude-haiku-4.5',
];

export const SUPPORTED_OPENAI_MODELS = [
  'gpt-5',
  'gpt-5-mini',
];

export function isClaudeModel(model) {
  return typeof model === 'string' && model.startsWith('claude-');
}

export function isOpenAIModel(model) {
  return typeof model === 'string' && model.startsWith('gpt-');
}

export function resolveModel(requestedModel, fallbackModel = 'claude-sonnet-5') {
  if (SUPPORTED_CLAUDE_MODELS.includes(requestedModel) || SUPPORTED_OPENAI_MODELS.includes(requestedModel)) {
    return requestedModel;
  }

  if (isClaudeModel(requestedModel) || isOpenAIModel(requestedModel)) {
    return requestedModel;
  }

  return fallbackModel;
}

export const resolveClaudeModel = resolveModel;
