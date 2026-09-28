const SKILL_DEFINITIONS = Object.freeze([
  {
    id: 'code',
    title: 'Code Writing',
    description: 'Generates or improves code and engineering solutions.',
    keywords: ['code', 'function', 'bug', 'api', 'debug', 'refactor', 'script', 'test'],
  },
  {
    id: 'comic',
    title: 'Comic Creation',
    description: 'Builds comic concepts, scenes, and panel plans.',
    keywords: ['comic', 'panel', 'storyboard', 'manga', 'character arc', 'speech bubble'],
  },
  {
    id: 'image',
    title: 'Detailed Image',
    description: 'Creates detailed image concepts and visual directions.',
    keywords: ['image', 'picture', 'illustration', 'render', 'poster', 'detailed art'],
  },
  {
    id: 'writing',
    title: 'Artistic Writing',
    description: 'Produces artistic and expressive writing outputs.',
    keywords: ['poem', 'story', 'artistic', 'creative writing', 'lyrics', 'narrative'],
  },
  {
    id: 'project',
    title: 'Project Help',
    description: 'Provides multi-step planning and implementation guidance.',
    keywords: ['plan', 'roadmap', 'multi-step', 'project', 'strategy', 'milestone'],
  },
]);

export const SKILL_MODES = Object.freeze({
  AUTO: 'auto',
  MANUAL: 'manual',
  MULTI: 'multi',
});

export function listSkillDefinitions() {
  return SKILL_DEFINITIONS.map((skill) => ({ ...skill }));
}

function scoreSkill(prompt, skill) {
  const normalizedPrompt = String(prompt || '').toLowerCase();
  return skill.keywords.reduce((count, keyword) => {
    if (normalizedPrompt.includes(keyword.toLowerCase())) {
      return count + 1;
    }
    return count;
  }, 0);
}

function detectBestSkill(prompt) {
  const scored = SKILL_DEFINITIONS.map((skill) => ({
    skillId: skill.id,
    score: scoreSkill(prompt, skill),
  })).sort((left, right) => right.score - left.score);

  if (!scored.length || scored[0].score === 0) {
    return 'project';
  }

  return scored[0].skillId;
}

function sanitizeSkillSelection(skillIds) {
  const validSkillIds = new Set(SKILL_DEFINITIONS.map((skill) => skill.id));
  return Array.from(new Set(skillIds.filter((skillId) => validSkillIds.has(skillId))));
}

export function resolveSkillExecutionPlan({
  prompt,
  mode = SKILL_MODES.AUTO,
  manualSkill,
  multiSkills = [],
} = {}) {
  switch (mode) {
    case SKILL_MODES.MANUAL: {
      const skillId = sanitizeSkillSelection([manualSkill])[0] || detectBestSkill(prompt);
      return {
        mode,
        primarySkill: skillId,
        skillIds: [skillId],
      };
    }
    case SKILL_MODES.MULTI: {
      const selectedSkills = sanitizeSkillSelection(multiSkills);
      const skillIds = selectedSkills.length ? selectedSkills : [detectBestSkill(prompt)];
      return {
        mode,
        primarySkill: skillIds[0],
        skillIds,
      };
    }
    case SKILL_MODES.AUTO:
    default: {
      const primarySkill = detectBestSkill(prompt);
      return {
        mode: SKILL_MODES.AUTO,
        primarySkill,
        skillIds: [primarySkill],
      };
    }
  }
}
