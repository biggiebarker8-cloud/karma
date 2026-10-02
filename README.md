# Karma

## Validate the assistant runtime locally

From a clone of this repository, run the following commands:

```bash
cd packages/studio
npm test
npm run try:assistant
```

`npm test` runs the dependency-free Node.js regression suite. `npm run try:assistant` exercises the canonical assistant runtime and verifies that the OpenClaw plugin is available through the permission- and feature-flag-aware plugin registry.

## Run the two-assistant chat app

The runnable Node.js host serves the two-assistant UI, verifies sign-in and CSRF
tokens, and stores profile histories and approvals in SQLite. It requires Node.js
22.13+ plus server-side model keys and workspace credentials. See the [assistant
capabilities guide](docs/ASSISTANT_CAPABILITIES.md#two-assistant-runtime) for
required environment variables and local startup instructions. For hosting and
persistent-storage setup, see the [deployment guide](docs/DEPLOYMENT.md).

## Current scope

Karma provides a JavaScript ESM assistant runtime foundation with feature flags, permissions, audit logging, rate limits, voice and vision adapters, memory and learning stores, internet reference retrieval, installation guidance, and plugin foundations for creative and platform integrations.

The comics plugin supports a structured `create-comic-brief` action for short-form social comics, carousels, and promotional launches. It is planning-only: when factual claims, public-facing content, or brand-sensitive output is present, the returned brief requires human approval before any separate publishing workflow may proceed.

See [runtime/comic implementation specification](docs/SPEC-runtime-containment-and-comic-brief.md), [implementation plan](docs/superpowers/plans/2026-09-22-runtime-containment-and-comic-brief.md), and [source provenance](docs/PROVENANCE.md) for scope, verification, and attribution details.
