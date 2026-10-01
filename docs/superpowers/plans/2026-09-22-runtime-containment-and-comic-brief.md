# Runtime Containment and Comic-Mode Brief Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route every public runtime import through one policy-enforced factory and provide an approval-aware, structured comic-mode brief through the existing comics plugin.

**Architecture:** `index.mjs` becomes a compatibility re-export of `index.js`, removing its separate, unaudited registry. The comics plugin remains within the existing registry, feature-flag, permission, rate-limit, and audit boundary, but returns a deterministic brief for a dedicated `create-comic-brief` action. Node’s built-in test runner provides dependency-free regression coverage.

**Tech Stack:** Node.js ESM, `node:test`, `node:assert/strict`, existing Karma Studio plugin registry.

**Spec:** `docs/SPEC-runtime-containment-and-comic-brief.md`

## Global Constraints

- Add no runtime dependencies.
- Do not add network calls, credentials, data persistence, publishing, or provider execution.
- Do not copy third-party fork code or text.
- Preserve the MIT attribution for adapted concepts from the first-party `karmas-alliance` source.
- Use existing feature flags, permissions, audit logging, and rate-limit boundaries.

---

### Task 1: Add failing public-contract tests

**Files:**
- Create: `packages/studio/test/assistant-runtime.test.js`

**Interfaces:**
- Consumes: `createAssistantRuntime` from both public entrypoints and the existing canonical plugin registry.
- Produces: executable regression coverage for import parity and comic-brief behavior.

- [ ] **Step 1: Write the failing test**

```javascript
import { createAssistantRuntime as canonicalRuntime } from '../src/assistant/index.js';
import { createAssistantRuntime as compatibilityRuntime } from '../src/assistant/index.mjs';

assert.strictEqual(compatibilityRuntime, canonicalRuntime);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test packages/studio/test/assistant-runtime.test.js`
Expected: FAIL because `index.mjs` currently exports a separate factory.

- [ ] **Step 3: Add comic-brief expectations**

```javascript
const result = await runtime.pluginRegistry.execute('comics', 'create-comic-brief', {
  variant: 'carousel',
  factualClaims: ['Price claim'],
});
assert.deepStrictEqual(result.comicBrief.panelRange, { min: 6, max: 10 });
assert.equal(result.approvalRequired, true);
```

- [ ] **Step 4: Run test to verify it fails for the missing behavior**

Run: `node --test packages/studio/test/assistant-runtime.test.js`
Expected: FAIL because the current comics plugin only returns a generic queued payload.

### Task 2: Contain the alternate entrypoint

**Files:**
- Modify: `packages/studio/src/assistant/index.mjs`
- Test: `packages/studio/test/assistant-runtime.test.js`

**Interfaces:**
- Consumes: canonical named export from `./index.js`.
- Produces: the same `createAssistantRuntime` function through both public paths.

- [ ] **Step 1: Replace independent runtime code with a named re-export**

```javascript
export { createAssistantRuntime } from './index.js';
```

- [ ] **Step 2: Run focused test**

Run: `node --test packages/studio/test/assistant-runtime.test.js`
Expected: the import-parity assertion passes; comic-brief assertions still fail until Task 3.

### Task 3: Implement the structured comic-mode brief

**Files:**
- Modify: `packages/studio/src/assistant/plugins/comicsPlugin.js`
- Test: `packages/studio/test/assistant-runtime.test.js`

**Interfaces:**
- Consumes: `action`, `context.variant`, `context.hook`, `context.characterScene`, `context.coreMessage`, `context.cta`, `context.caption`, `context.hashtags`, `context.factualClaims`, `context.publicFacing`, and `context.brandSensitive`.
- Produces: `{ status: 'ready', comicBrief, approvalRequired, guardrails }` for `create-comic-brief`.

- [ ] **Step 1: Define immutable variant plans**

```javascript
const COMIC_VARIANTS = Object.freeze({
  'short-form-social': { panelRange: { min: 3, max: 5 } },
  carousel: { panelRange: { min: 6, max: 10 } },
  'promo-launch': { panelRange: { min: 3, max: 5 } },
});
```

- [ ] **Step 2: Build only the dedicated brief action**

```javascript
if (action === 'create-comic-brief') {
  return createComicBrief(context);
}
```

- [ ] **Step 3: Preserve the existing generic queued response for other actions**

```javascript
return { domain: 'storytelling', type: 'comics', action, context, status: 'queued' };
```

- [ ] **Step 4: Run focused test**

Run: `node --test packages/studio/test/assistant-runtime.test.js`
Expected: PASS.

### Task 4: Add usability, provenance, and package verification support

**Files:**
- Modify: `packages/studio/package.json`
- Modify: `README.md`
- Create: `docs/PROVENANCE.md`

**Interfaces:**
- Consumes: Node built-in test runner and the MIT-licensed first-party `karmas-alliance` comic-mode playbook.
- Produces: portable commands and source attribution.

- [ ] **Step 1: Add `npm test`**

```json
"test": "node --test"
```

- [ ] **Step 2: Replace the absolute README path with repository-relative commands**

```bash
cd packages/studio
npm test
npm run try:assistant
```

- [ ] **Step 3: Add the source notice**

Record the first-party source repository, MIT copyright holder, adapted concept, and the statement that no third-party fork code was imported.

- [ ] **Step 4: Run verification**

Run: `npm test && npm run try:assistant`
Expected: exit code 0.

### Task 5: Review and commit

**Files:**
- Review: all modified and created files

- [ ] **Step 1: Review staged diff and scan for secrets**

Run: `git diff --check && git diff --staged | grep -i -E 'password|secret|api[_-]?key|token'`
Expected: no whitespace errors and no sensitive material.

- [ ] **Step 2: Commit one logical change**

```bash
git add README.md docs packages/studio
git commit -m "fix: contain runtime entrypoint and add comic briefs"
```
