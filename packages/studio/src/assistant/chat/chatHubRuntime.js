import { PERMISSIONS } from '../core/permissions.js';
import { SKILL_MODES, listSkillDefinitions, resolveSkillExecutionPlan } from './skillRouter.js';

const DEFAULT_OPENAPI_SETTINGS = Object.freeze({
  apiKey: '',
  provider: 'openapi',
  model: 'claude-sonnet-5',
  fallbackModel: 'claude-haiku-4.5',
  retries: 1,
  showUsage: true,
});

const DEFAULT_PRESETS = Object.freeze([
  {
    id: 'creative-sprint',
    label: 'Creative Sprint',
    promptPrefix:
      'Think boldly and produce a high-impact creative result with polished structure and actionable output.',
  },
  {
    id: 'engineering-focus',
    label: 'Engineering Focus',
    promptPrefix:
      'Provide an implementation-focused response with practical tradeoffs, clear assumptions, and deliverable steps.',
  },
  {
    id: 'brand-story',
    label: 'Brand Story',
    promptPrefix:
      'Write in a distinct artistic voice while keeping messaging clear, memorable, and audience-ready.',
  },
]);

const BLOCKED_PATTERNS = [
  /\bcredit card\b/i,
  /\bssn\b/i,
  /\bpassword dump\b/i,
  /\bmalware\b/i,
  /\bexploit\b/i,
];

function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text || '').length / 4));
}

function createSessionState({ longContext = false } = {}) {
  return {
    longContext,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

function buildImagePreviewUri(title, description) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111827" offset="0"/><stop stop-color="#4f46e5" offset="1"/></linearGradient></defs><rect fill="url(#bg)" width="960" height="540" rx="24"/><text x="48" y="104" fill="#e0e7ff" font-size="36" font-family="Arial, sans-serif">${title}</text><text x="48" y="168" fill="#f9fafb" font-size="24" font-family="Arial, sans-serif">${description}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function withPromptPreset(prompt, preset) {
  if (!preset?.promptPrefix) {
    return prompt;
  }

  return `${preset.promptPrefix}\n\nUser request:\n${prompt}`;
}

function buildHistoryContext(session, maxTurns) {
  const messages = asArray(session?.messages);
  if (!messages.length) {
    return '';
  }

  const recent = messages.slice(-maxTurns).map((message) => {
    const speaker = message.role === 'assistant' ? 'Assistant' : 'User';
    return `${speaker}: ${message.content}`;
  });

  return recent.join('\n');
}

function hasBlockedPrompt(prompt) {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(prompt));
}

function safeErrorBlock(error) {
  return {
    type: 'error',
    title: 'Request failed',
    message: error?.message || 'Unknown runtime failure',
  };
}

function normalizeOpenApiPatch(current, patch = {}) {
  const next = {
    ...current,
    ...patch,
  };

  const retries = Number(next.retries);
  next.retries = Number.isFinite(retries) && retries >= 0 ? Math.min(retries, 5) : 1;
  next.showUsage = Boolean(next.showUsage);
  next.model = String(next.model || current.model || DEFAULT_OPENAPI_SETTINGS.model);
  next.fallbackModel = String(
    next.fallbackModel || current.fallbackModel || DEFAULT_OPENAPI_SETTINGS.fallbackModel,
  );
  next.provider = String(next.provider || current.provider || DEFAULT_OPENAPI_SETTINGS.provider);
  next.apiKey = String(next.apiKey || '');

  return next;
}

async function completeWithRetry({ modelGateway, prompt, openApiSettings, metadata }) {
  let lastError;

  for (let attempt = 0; attempt <= openApiSettings.retries; attempt += 1) {
    try {
      const output = await modelGateway.complete({
        prompt,
        model: openApiSettings.model,
        fallbackModel: openApiSettings.fallbackModel,
        metadata: {
          ...metadata,
          provider: openApiSettings.provider,
          attempt,
        },
      });
      return { output, attempt };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function runSkill({
  skillId,
  prompt,
  openApiSettings,
  runtime,
  session,
  webReferences,
  imageInput,
}) {
  const blocks = [];

  switch (skillId) {
    case 'code': {
      const codePrompt = `${prompt}\n\nReturn concise code with a short explanation.`;
      const modelResult = await completeWithRetry({
        modelGateway: runtime.modelGateway,
        prompt: codePrompt,
        openApiSettings,
        metadata: { skill: 'code' },
      });

      blocks.push({
        type: 'code',
        language: 'javascript',
        title: 'Generated solution',
        code: String(modelResult.output || ''),
        exportFileName: `karma-code-${Date.now()}.txt`,
      });
      break;
    }

    case 'comic': {
      const comicPlan = await runtime.pluginRegistry.execute('comics', 'create-storyboard', {
        prompt,
        sessionId: session.id,
      });
      const modelResult = await completeWithRetry({
        modelGateway: runtime.modelGateway,
        prompt: `${prompt}\n\nProvide a comic panel storyboard with dialogue and scene detail.`,
        openApiSettings,
        metadata: { skill: 'comic' },
      });

      blocks.push({
        type: 'comic',
        title: 'Comic storyboard',
        status: comicPlan.status,
        content: String(modelResult.output || ''),
        previewUrl: buildImagePreviewUri('Comic Preview', 'Storyboard visualization ready'),
      });
      blocks.push({
        type: 'asset',
        title: 'Storyboard package',
        label: 'Download storyboard notes',
        downloadName: `karma-comic-${Date.now()}.txt`,
        content: String(modelResult.output || ''),
      });
      break;
    }

    case 'image': {
      let analysis = null;
      if (imageInput) {
        try {
          analysis = await runtime.visionAdapter.analyze(imageInput);
        } catch (error) {
          analysis = { error: error.message };
        }
      }

      const designPlan = await runtime.pluginRegistry.execute('hoodie-design', 'generate-concept', {
        prompt,
        analysis,
      });
      const modelResult = await completeWithRetry({
        modelGateway: runtime.modelGateway,
        prompt: `${prompt}\n\nProduce a highly detailed visual composition brief.`,
        openApiSettings,
        metadata: { skill: 'image' },
      });

      blocks.push({
        type: 'image',
        title: 'Detailed image concept',
        description: String(modelResult.output || ''),
        status: designPlan.status,
        previewUrl: buildImagePreviewUri('Detailed Image Concept', 'Prompt-ready concept board'),
      });
      blocks.push({
        type: 'asset',
        title: 'Prompt package',
        label: 'Download image prompt package',
        downloadName: `karma-image-${Date.now()}.txt`,
        content: String(modelResult.output || ''),
      });
      break;
    }

    case 'writing': {
      const modelResult = await completeWithRetry({
        modelGateway: runtime.modelGateway,
        prompt: `${prompt}\n\nRespond as high-quality artistic writing with style and emotional depth.`,
        openApiSettings,
        metadata: { skill: 'writing' },
      });
      blocks.push({
        type: 'text',
        title: 'Artistic writing',
        content: String(modelResult.output || ''),
      });
      break;
    }

    case 'project':
    default: {
      const capability = await runtime.pluginRegistry.execute('openclaw', 'describe-capabilities', {
        requestedBy: 'chat-hub',
      });

      const modelResult = await completeWithRetry({
        modelGateway: runtime.modelGateway,
        prompt: `${prompt}\n\nReturn a multi-step plan with execution priorities and concrete next moves.`,
        openApiSettings,
        metadata: { skill: 'project' },
      });

      blocks.push({
        type: 'text',
        title: 'Project strategy',
        content: String(modelResult.output || ''),
      });
      blocks.push({
        type: 'tool',
        title: 'Runtime capabilities',
        content: capability,
      });
      break;
    }
  }

  if (webReferences.length) {
    blocks.push({
      type: 'reference',
      title: 'Web research references',
      items: webReferences,
    });
  }

  return blocks;
}

async function executeRequestedTools({ tools, runtime, prompt }) {
  const blocks = [];

  for (const toolName of asArray(tools)) {
    if (toolName === 'plugins.list') {
      blocks.push({
        type: 'tool',
        title: 'Plugin list',
        content: runtime.pluginRegistry.list().map((plugin) => plugin.id),
      });
      continue;
    }

    if (toolName === 'memory.read') {
      blocks.push({
        type: 'tool',
        title: 'Memory snapshot',
        content: {
          session: runtime.memoryStore.read('session'),
          user: runtime.memoryStore.read('user'),
          task: runtime.memoryStore.read('task'),
        },
      });
      continue;
    }

    if (toolName === 'references.search') {
      try {
        const references = await runtime.references.retrieve(prompt);
        blocks.push({
          type: 'tool',
          title: 'Tool reference search',
          content: references,
        });
      } catch (error) {
        blocks.push({
          type: 'tool',
          title: 'Tool reference search',
          content: { error: error.message },
        });
      }
      continue;
    }

    blocks.push({
      type: 'tool',
      title: `Unknown tool: ${toolName}`,
      content: { error: 'Unsupported tool request' },
    });
  }

  return blocks;
}

function createMessageId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createChatHubRuntime({
  pluginRegistry,
  modelGateway,
  memoryStore,
  learningStore,
  references,
  visionAdapter,
  auditLogger,
}) {
  const sessions = new Map();
  let openApiSettings = { ...DEFAULT_OPENAPI_SETTINGS };

  function getOrCreateSession(sessionId = 'default', options = {}) {
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, createSessionState(options));
    }

    const session = sessions.get(sessionId);
    if (typeof options.longContext === 'boolean') {
      session.longContext = options.longContext;
    }

    return session;
  }

  async function sendMessage({
    sessionId = 'default',
    prompt,
    skillMode = SKILL_MODES.AUTO,
    manualSkill,
    multiSkills = [],
    webResearch = false,
    tools = [],
    imageInput,
    presetId,
    longContext,
  } = {}) {
    const trimmedPrompt = String(prompt || '').trim();
    if (!trimmedPrompt) {
      throw new Error('Prompt is required');
    }

    if (hasBlockedPrompt(trimmedPrompt)) {
      return {
        status: 'blocked',
        reason: 'guardrail.content_filter',
        blocks: [
          {
            type: 'error',
            title: 'Blocked by safety filter',
            message: 'Please remove sensitive or unsafe instructions and try again.',
          },
        ],
      };
    }

    const session = getOrCreateSession(sessionId, { longContext });
    session.id = sessionId;

    const preset = DEFAULT_PRESETS.find((entry) => entry.id === presetId) || null;
    const personalizedPrompt = withPromptPreset(trimmedPrompt, preset);
    const historyContext = buildHistoryContext(session, session.longContext ? 20 : 6);
    const fullPrompt = historyContext
      ? `${historyContext}\n\nCurrent request:\n${personalizedPrompt}`
      : personalizedPrompt;

    const skillPlan = resolveSkillExecutionPlan({
      prompt: trimmedPrompt,
      mode: skillMode,
      manualSkill,
      multiSkills,
    });

    const webReferences = [];
    if (webResearch) {
      try {
        const referenceResults = await references.retrieve(trimmedPrompt);
        webReferences.push(...referenceResults);
      } catch (error) {
        webReferences.push({
          title: 'Research retrieval failed',
          summary: error.message,
          url: 'about:blank',
        });
      }
    }

    const runtimeDeps = {
      pluginRegistry,
      modelGateway,
      memoryStore,
      learningStore,
      references,
      visionAdapter,
      auditLogger,
    };

    const blocks = [];

    const toolBlocks = await executeRequestedTools({
      tools,
      runtime: runtimeDeps,
      prompt: trimmedPrompt,
    });
    blocks.push(...toolBlocks);

    for (const skillId of skillPlan.skillIds) {
      try {
        const skillBlocks = await runSkill({
          skillId,
          prompt: fullPrompt,
          openApiSettings,
          runtime: runtimeDeps,
          session,
          webReferences,
          imageInput,
        });
        blocks.push(...skillBlocks);
      } catch (error) {
        blocks.push(safeErrorBlock(error));
      }
    }

    const assistantSummary = blocks
      .filter((block) => block.type === 'text' || block.type === 'code' || block.type === 'comic')
      .map((block) => block.content || block.code || block.description || block.title)
      .join('\n\n');

    const usage = {
      promptTokens: estimateTokens(fullPrompt),
      completionTokens: estimateTokens(assistantSummary),
      totalTokens: estimateTokens(fullPrompt) + estimateTokens(assistantSummary),
      provider: openApiSettings.provider,
      model: openApiSettings.model,
      fallbackModel: openApiSettings.fallbackModel,
    };

    const userMessage = {
      id: createMessageId('user'),
      role: 'user',
      content: trimmedPrompt,
      createdAt: new Date().toISOString(),
    };

    const assistantMessage = {
      id: createMessageId('assistant'),
      role: 'assistant',
      content: assistantSummary || 'Generated a multimodal response.',
      createdAt: new Date().toISOString(),
      blocks,
      usage,
      plan: skillPlan,
      versions: [
        {
          id: createMessageId('version'),
          createdAt: new Date().toISOString(),
          blocks,
          usage,
        },
      ],
    };

    session.messages.push(userMessage, assistantMessage);
    session.updatedAt = new Date().toISOString();

    memoryStore.write('session', {
      sessionId,
      prompt: trimmedPrompt,
      skillPlan,
      timestamp: session.updatedAt,
    });

    auditLogger?.log?.({
      type: 'chat.request.completed',
      sessionId,
      skillMode: skillPlan.mode,
      skills: skillPlan.skillIds,
    });

    return {
      status: 'ok',
      sessionId,
      userMessage,
      assistantMessage,
      usage: openApiSettings.showUsage ? usage : null,
      openApi: {
        provider: openApiSettings.provider,
        model: openApiSettings.model,
        fallbackModel: openApiSettings.fallbackModel,
        retries: openApiSettings.retries,
      },
    };
  }

  return {
    getOpenApiSettings() {
      return {
        ...openApiSettings,
        apiKey: openApiSettings.apiKey ? '••••••••' : '',
      };
    },

    updateOpenApiSettings(patch = {}) {
      openApiSettings = normalizeOpenApiPatch(openApiSettings, patch);
      auditLogger?.log?.({
        type: 'chat.openapi.updated',
        provider: openApiSettings.provider,
        model: openApiSettings.model,
      });
      return this.getOpenApiSettings();
    },

    listSkillModes() {
      return { ...SKILL_MODES };
    },

    listSkills() {
      return listSkillDefinitions();
    },

    listPresets() {
      return DEFAULT_PRESETS.map((preset) => ({ ...preset }));
    },

    startSession({ sessionId = 'default', longContext = false } = {}) {
      const session = getOrCreateSession(sessionId, { longContext });
      return {
        sessionId,
        longContext: session.longContext,
        messageCount: session.messages.length,
      };
    },

    getSessionHistory(sessionId = 'default') {
      const session = sessions.get(sessionId);
      if (!session) {
        return [];
      }
      return session.messages.map((message) => ({ ...message }));
    },

    async sendMessage(input = {}) {
      return sendMessage(input);
    },

    async regenerateLast({ sessionId = 'default', overridePrompt, ...options } = {}) {
      const session = sessions.get(sessionId);
      if (!session) {
        throw new Error('No active session for regeneration');
      }

      const userMessages = session.messages.filter((message) => message.role === 'user');
      const lastUser = userMessages[userMessages.length - 1];
      if (!lastUser) {
        throw new Error('No user message available for regeneration');
      }

      return sendMessage({
        sessionId,
        prompt: overridePrompt || lastUser.content,
        ...options,
      });
    },

    compareVersions({ sessionId = 'default', assistantMessageId } = {}) {
      const session = sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const assistantMessage = session.messages.find(
        (message) =>
          message.role === 'assistant' &&
          (assistantMessageId ? message.id === assistantMessageId : true),
      );

      if (!assistantMessage) {
        throw new Error('Assistant message not found for comparison');
      }

      return {
        sessionId,
        assistantMessageId: assistantMessage.id,
        versions: asArray(assistantMessage.versions).map((version) => ({ ...version })),
      };
    },

    captureFeedback(entry = {}) {
      return learningStore.capture(entry);
    },

    listFeedbackSummary() {
      return learningStore.summarize();
    },

    canUseTool(toolName) {
      if (toolName === 'references.search') {
        return pluginRegistry.isAvailable('openclaw') || Boolean(PERMISSIONS.INTERNET_READ);
      }
      return true;
    },
  };
}
