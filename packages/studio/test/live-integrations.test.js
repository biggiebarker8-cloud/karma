import assert from 'node:assert/strict';
import test from 'node:test';

import { createGitHubTransport } from '../src/assistant/github/githubTransport.js';
import { createOpenAITransport } from '../src/assistant/model/openaiTransport.js';
import { createClaudeTransport } from '../src/assistant/model/claudeTransport.js';

const LIVE_TESTS_ENABLED = process.env.RUN_LIVE_INTEGRATION_TESTS === 'true';

test('live OpenAI authenticated request', { skip: !LIVE_TESTS_ENABLED }, async () => {
  assert.ok(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY is required');
  assert.ok(process.env.OPENAI_LIVE_TEST_MODEL, 'OPENAI_LIVE_TEST_MODEL is required');

  const transport = createOpenAITransport();
  const response = await transport({
    model: process.env.OPENAI_LIVE_TEST_MODEL,
    prompt: 'Reply with the single word: ok',
  });

  assert.equal(typeof response, 'string');
  assert.ok(response.trim());
});

test('live Anthropic authenticated request', { skip: !LIVE_TESTS_ENABLED }, async () => {
  assert.ok(process.env.ANTHROPIC_API_KEY, 'ANTHROPIC_API_KEY is required');
  assert.ok(process.env.ANTHROPIC_LIVE_TEST_MODEL, 'ANTHROPIC_LIVE_TEST_MODEL is required');

  const transport = createClaudeTransport();
  const response = await transport({
    model: process.env.ANTHROPIC_LIVE_TEST_MODEL,
    prompt: 'Reply with the single word: ok',
  });

  assert.equal(typeof response, 'string');
  assert.ok(response.trim());
});

test('live GitHub authenticated allowlisted repository read', {
  skip: !LIVE_TESTS_ENABLED,
}, async () => {
  assert.ok(process.env.GITHUB_TOKEN, 'GITHUB_TOKEN is required');
  assert.ok(process.env.GITHUB_ALLOWED_REPOSITORIES, 'GITHUB_ALLOWED_REPOSITORIES is required');
  assert.ok(process.env.GITHUB_LIVE_TEST_REPOSITORY, 'GITHUB_LIVE_TEST_REPOSITORY is required');

  const repositoryParts = process.env.GITHUB_LIVE_TEST_REPOSITORY.split('/');
  assert.equal(repositoryParts.length, 2, 'GITHUB_LIVE_TEST_REPOSITORY must be exactly owner/repository');
  const [owner, repo] = repositoryParts;
  assert.ok(owner && repo, 'GITHUB_LIVE_TEST_REPOSITORY must be exactly owner/repository');
  const allowedRepositories = process.env.GITHUB_ALLOWED_REPOSITORIES
    .split(',')
    .map((value) => value.trim().toLowerCase());
  assert.ok(
    allowedRepositories.includes(`${owner}/${repo}`.toLowerCase()),
    'The live test repository must be included in GITHUB_ALLOWED_REPOSITORIES',
  );

  const transport = createGitHubTransport();
  const response = await transport({ owner, repo });

  assert.equal(`${response.owner.login}/${response.name}`.toLowerCase(), `${owner}/${repo}`.toLowerCase());
});
