import { parseAndValidateJson } from './jsonMode.js';
import { isClaudeModel, resolveModel } from './claudeModels.js';

export function createModelGateway({ transport, claudeTransport, auditLogger }) {
  if (typeof transport !== 'function') {
    throw new Error('Model gateway requires a transport function');
  }

  const getTransport = (model) => {
    if (isClaudeModel(model)) {
      if (typeof claudeTransport !== 'function') {
        throw new Error('Claude model requests require a Claude transport');
      }
      return claudeTransport;
    }
    return transport;
  };

  return {
    async complete({
      prompt,
      model,
      fallbackModel,
      jsonMode = false,
      schema,
      metadata = {},
    }) {
      const selectedModel = resolveModel(model, fallbackModel);
      auditLogger?.log?.({ type: 'model.request', model: selectedModel });

      const response = await getTransport(selectedModel)({
        model: selectedModel,
        prompt,
        jsonMode,
        metadata,
      });

      if (!jsonMode) {
        return response;
      }

      try {
        return parseAndValidateJson(response, schema);
      } catch (error) {
        if (!fallbackModel || selectedModel === fallbackModel) {
          throw error;
        }

        auditLogger?.log?.({
          type: 'model.fallback',
          from: selectedModel,
          to: fallbackModel,
          reason: error.message,
        });

        const fallbackResponse = await getTransport(fallbackModel)({
          model: fallbackModel,
          prompt,
          jsonMode: true,
          metadata: { ...metadata, fallback: true },
        });
        return parseAndValidateJson(fallbackResponse, schema);
      }
    },
  };
}
