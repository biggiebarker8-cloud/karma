# Spec: Runtime Containment and Comic-Mode Brief

## Objective

Make the public assistant runtime safer by eliminating the unaudited alternate entrypoint, and improve the existing comics capability with a structured, approval-aware creative brief. The change serves operators and creative users who need a consistent runtime contract and reusable comic campaign planning without triggering publish actions.

## Tech Stack

The implementation uses the existing Node.js ESM JavaScript package at `packages/studio`. It adds no runtime dependency. Automated coverage uses Node’s built-in `node:test` runner and strict assertions.

## Commands

```bash
cd packages/studio
npm test
npm run try:assistant
```

## Project Structure

| Path | Responsibility |
|---|---|
| `packages/studio/src/assistant/index.mjs` | Compatibility entrypoint that must expose the canonical runtime only. |
| `packages/studio/src/assistant/plugins/comicsPlugin.js` | Comics plugin and its structured brief behavior. |
| `packages/studio/test/assistant-runtime.test.js` | Entrypoint parity, availability, and comic-brief behavior tests. |
| `packages/studio/package.json` | Package-local test command. |
| `README.md` | Portable setup and verification instructions. |
| `docs/PROVENANCE.md` | Source attribution for adapted first-party comic-workflow concepts. |

## Code Style

Use ESM imports with explicit `.js` extensions, small pure helpers, named constants for supported variants, and structured return values. Plugin actions must remain side-effect-free unless an integration explicitly implements an audited operation.

## Testing Strategy

Tests import both public runtime entrypoints and assert identity parity. Tests execute the comics plugin through the canonical plugin registry to validate its existing feature-flag and permission gate, its short-form/carousel/launch panel ranges, and approval signaling for factual, public-facing, or brand-sensitive content.

## Boundaries

- **Always:** preserve the canonical runtime API, use the existing plugin registry, run tests and the existing smoke check before commit, and retain source provenance for adapted material.
- **Ask first:** add dependencies, change CI or deployment configuration, introduce external network calls, alter data storage, or enable publishing/integration actions.
- **Never:** bypass third-party licensing, import blocked fork code, weaken permissions, add secrets, or merge the branch without an explicit request.

## Success Criteria

1. `index.mjs` exports the exact canonical `createAssistantRuntime` function from `index.js` and exposes no independent plugin executor.
2. The comics plugin produces a deterministic structured creative brief for short-form social, carousel, and promo-launch variants.
3. The comics brief signals required human approval when supplied content is factual, public-facing, or brand-sensitive, but does not publish anything.
4. Node tests and the existing assistant smoke command complete successfully.

## Open Questions

The broader authorization redesign, data-governance program, URL/SSRF hardening, provider integrations, and release-root restoration remain separate workstreams because they require architectural decisions or external credentials.
