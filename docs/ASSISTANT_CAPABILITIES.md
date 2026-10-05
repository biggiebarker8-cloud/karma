# Assistant Capability Foundation

This repository now includes a foundation for:

- Plugin/capability registration with feature flags and permission checks
- Claude model gateway with strict JSON mode and schema validation
- Voice/hearing adapters and turn controls (pause, interrupt, confirm)
- Vision adapter with multi-format image normalization and validation
- Scaffold integrations for TikTok personal, TikTok Business, TikTok Ads, Facebook, Instagram, WhatsApp Business, Reddit, Shopify, Amazon, and Meta Business
- Openclaw planning and Canva integration scaffolds
- Creative plugins for hoodie design, comics, and movie clip workflows
- Cross-device desktop install advisor and install plugin for iOS/Android/desktop paths
- Memory scopes (session/user/task), tone profiles, and accessibility profiles
- Continuous learning feedback capture
- Internet reference retrieval with domain allowlisting and required citations

## Entry point

- `/home/runner/work/karma/karma/packages/studio/src/assistant/index.js`

## Notes

- Integrations are scaffolded as safe plugin connectors with permission gates, audit logging, and rate limiting.
- All ten social/business/commerce scaffolds return `status: 'stubbed'`, `executed: false`, and `requiresConnection: true` for every action, including capability descriptions, read overviews, and unsupported fallbacks. Nothing is posted, scheduled, sent, queued, synchronized, or changed externally.
- Nested result, overview, and profile objects also report `executed: false` and `requiresConnection: true`. Outcome and connection-readiness flags remain false even with complete request data. `documentationReady` and `supports*` fields describe the scaffold's documentation and planned scope, not a working external connection.
- Meta Business reports empty actual connected-platform lists and separate `supportedPlatforms` documentation for Facebook, Instagram, and WhatsApp Business. Empty orders, insights, templates, and inventory lists are placeholders, not fetched data; nested order `status` is a request filter, not an execution status.
- Openclaw is registered as its own assistant integration with a dedicated feature flag and permission so it can stay separate from other AI or agency-specific tooling.
- Openclaw exposes standalone app planning, agency workspace plans, TikTok dashboard plans, AI permissions handoff, and Larks documentation handoff actions without being coupled into Larks. Workspace/dashboard setup and permission grants are explicitly stubbed, not executed, and require connection; dashboard automation is not ready. Supplied permissions are `requestedPermissions`, never actual grants (`granted: false`, `grantedPermissions: []`). Local capability/config/handoff documentation does not provision an app or execute externally.
- Creative and vision capabilities are dependency-injected so production analyzers/providers can be wired safely.
- Network/OAuth-specific implementations are intentionally dependency-injected for secure wiring in app-specific runtime code.
- iOS is handled with explicit install guidance (Add to Home Screen) because browsers do not permit silent auto-install.
