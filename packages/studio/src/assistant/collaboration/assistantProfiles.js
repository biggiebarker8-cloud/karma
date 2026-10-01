const PROFILE_DEFAULTS = Object.freeze({
  karma: {
    name: 'Karma',
    model: 'claude-sonnet-5',
    instructions: 'You are Karma, Dan’s direct, practical assistant. Be warm, honest, and organized.',
  },
  collaborator: {
    name: 'Collaborator',
    model: 'gpt-5',
    instructions: 'You are Dan’s OpenAI-powered collaborator. Offer an independent, useful perspective.',
  },
});

const PROFILE_IDS = Object.keys(PROFILE_DEFAULTS);
const REVIEW_LIMIT = 1;

function historyRecords(memoryStore, profile) {
  return memoryStore.read('task').filter((entry) => (
    entry.kind === 'conversation' && entry.profile === profile
  ));
}

export function createAssistantProfiles({
  memoryStore,
  modelGateway,
  pluginRegistry,
  actionApprovals,
  auditLogger,
  businessKnowledge = [],
  authorizeDanAction = () => false,
} = {}) {
  if (!memoryStore || !modelGateway || !pluginRegistry || !actionApprovals) {
    throw new Error('Assistant profiles require memory, model, plugin, and approval services');
  }
  if (!Array.isArray(businessKnowledge)
    || businessKnowledge.some((fact) => typeof fact !== 'string')) {
    throw new Error('Shared business knowledge must be an array of approved fact strings');
  }
  const configuredBusinessKnowledge = Object.freeze([...businessKnowledge]);
  const profiles = Object.fromEntries(
    Object.entries(PROFILE_DEFAULTS).map(([id, definition]) => [id, { ...definition }]),
  );
  const assertProfile = (profile) => {
    if (!profiles[profile]) throw new Error(`Unknown assistant profile: ${profile}`);
  };
  const requireDan = (operation) => {
    if (!authorizeDanAction(operation)) throw new Error('This action requires Dan’s authenticated session');
  };

  function sharedKnowledge() {
    return [
      ...configuredBusinessKnowledge,
      ...memoryStore.read('user')
        .filter((entry) => entry.kind === 'approved-business-fact')
        .map((entry) => entry.fact),
    ];
  }

  async function respond(profile, prompt, { remember = true, requestLabel } = {}) {
    assertProfile(profile);
    const definition = profiles[profile];
    const history = historyRecords(memoryStore, profile);
    const preferences = memoryStore.read('task').filter((entry) => (
      entry.profile === profile
      && (entry.kind === 'profile-feedback' || entry.kind === 'profile-example')
    ));
    const response = await modelGateway.complete({
      model: definition.model,
      prompt: [
        `Assistant profile: ${definition.name}`,
        `Personality instructions: ${definition.instructions}`,
        `Dan's saved feedback and examples for this profile: ${JSON.stringify(preferences)}`,
        `Approved shared business knowledge: ${JSON.stringify(sharedKnowledge())}`,
        `This profile's conversation history: ${JSON.stringify(history)}`,
        `User message: ${prompt}`,
      ].join('\n'),
      metadata: { profile, requestLabel },
    });

    if (remember) {
      memoryStore.write('task', { kind: 'conversation', profile, role: 'user', content: prompt });
      memoryStore.write('task', { kind: 'conversation', profile, role: 'assistant', content: response });
    }
    auditLogger?.log?.({ type: 'assistant.response', profile, requestLabel });
    return { assistant: definition.name, profile, content: response };
  }

  async function review(reviewer, karmaReply, collaboratorReply) {
    const result = await respond(
      reviewer,
      `Review these two responses once. Identify useful agreement and differences; do not call tools or ask another assistant to respond.\nKarma: ${karmaReply.content}\nCollaborator: ${collaboratorReply.content}`,
      { requestLabel: 'together-review' },
    );
    return { ...result, assistant: `${result.assistant} (review)` };
  }

  return {
    list() {
      return PROFILE_IDS.map((id) => ({ id, name: profiles[id].name, model: profiles[id].model }));
    },

    getInstructions(profile) {
      assertProfile(profile);
      return profiles[profile].instructions;
    },

    updateInstructions(profile, instructions) {
      assertProfile(profile);
      requireDan('edit-personality');
      if (typeof instructions !== 'string' || !instructions.trim()) {
        throw new Error('Personality instructions must be a non-empty string');
      }
      profiles[profile].instructions = instructions.trim();
      auditLogger?.log?.({ type: 'assistant.instructions_updated', profile });
      return profiles[profile].instructions;
    },

    history(profile) {
      assertProfile(profile);
      return historyRecords(memoryStore, profile);
    },

    saveFeedback(profile, feedback) {
      assertProfile(profile);
      requireDan('save-profile-feedback');
      const entry = { kind: 'profile-feedback', profile, feedback };
      memoryStore.write('task', entry);
      return entry;
    },

    saveExample(profile, example) {
      assertProfile(profile);
      requireDan('save-profile-example');
      const entry = { kind: 'profile-example', profile, example };
      memoryStore.write('task', entry);
      return entry;
    },

    proposeBusinessFact(fact) {
      requireDan('propose-business-fact');
      if (typeof fact !== 'string' || !fact.trim()) throw new Error('Business fact must be non-empty');
      const entry = memoryStore.write('task', {
        kind: 'proposed-business-fact',
        fact: fact.trim(),
        status: 'pending-review',
      });
      return entry.value;
    },

    reviewBusinessFact(fact, isApproved) {
      requireDan('review-business-fact');
      if (typeof isApproved !== 'boolean') throw new Error('A review decision is required');
      const taskMemory = memoryStore.read('task');
      const pendingFact = taskMemory.find((entry) => (
        entry.kind === 'proposed-business-fact'
        && entry.status === 'pending-review'
        && entry.fact === fact?.fact
      ));
      const alreadyReviewed = taskMemory.some((entry) => (
        entry.kind === 'business-fact-review' && entry.fact === fact?.fact
      ));
      if (!pendingFact || alreadyReviewed) {
        throw new Error('Only an unreviewed business fact can be reviewed');
      }
      const entry = isApproved
        ? memoryStore.write('user', { kind: 'approved-business-fact', fact: fact.fact })
        : { value: fact };
      memoryStore.write('task', {
        kind: 'business-fact-review',
        fact: fact.fact,
        result: isApproved ? 'approved' : 'rejected',
      });
      auditLogger?.log?.({
        type: 'business_fact.reviewed',
        result: isApproved ? 'approved' : 'rejected',
      });
      return entry.value;
    },

    sharedKnowledge,

    async chat(mode, prompt, { includeReview = false, reviewer = 'karma' } = {}) {
      if (mode === 'karma') return [await respond('karma', prompt, { requestLabel: mode })];
      if (mode === 'collaborator') {
        return [await respond('collaborator', prompt, { requestLabel: mode })];
      }
      if (mode !== 'together') throw new Error(`Unknown chat mode: ${mode}`);
      assertProfile(reviewer);
      const replies = await Promise.all([
        respond('karma', prompt, { requestLabel: mode }),
        respond('collaborator', prompt, { requestLabel: mode }),
      ]);
      if (!includeReview) return replies;
      return [...replies, await review(reviewer, replies[0], replies[1])].slice(0, 2 + REVIEW_LIMIT);
    },

    requestActionApproval(profile, pluginId, action, context = {}) {
      assertProfile(profile);
      return actionApprovals.request({ profile, pluginId, action, context });
    },

    approveAction(id) {
      return actionApprovals.approve(id);
    },

    executeTool(profile, pluginId, action, context = {}) {
      assertProfile(profile);
      return pluginRegistry.execute(pluginId, action, {
        ...context,
        assistantProfile: profile,
      });
    },
  };
}
