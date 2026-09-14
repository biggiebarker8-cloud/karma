import { parseAndValidateJson } from './jsonMode';
import { resolveClaudeModel } from './claudeModels';

export function createModelGateway({ transport, auditLogger }) {
  if (typeof transport !== 'function') {
    throw new Error('Model gateway requires a transport function');
  }

  return {
    async complete({
      prompt,
      model,
      fallbackModel,
      jsonMode = false,
      schema,
      metadata = {},
    }) {
      const selectedModel = resolveClaudeModel(model, fallbackModel);
      auditLogger?.log?.({ type: 'model.request', model: selectedModel });

      const response = await transport({
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

        const fallbackResponse = await transport({
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

