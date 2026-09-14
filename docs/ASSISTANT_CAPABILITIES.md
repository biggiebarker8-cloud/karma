# Assistant Capability Foundation

This repository now includes a foundation for:

- Plugin/capability registration with feature flags and permission checks
- Claude model gateway with strict JSON mode and schema validation
- Voice/hearing adapters and turn controls (pause, interrupt, confirm)
- Integration plugin connectors for TikTok, Facebook, Instagram, Shopify, Amazon, and Canva
- Memory scopes (session/user/task), tone profiles, and accessibility profiles
- Continuous learning feedback capture
- Internet reference retrieval with domain allowlisting and required citations

## Entry point

- `/home/runner/work/karma/karma/packages/studio/src/assistant/index.js`

## Notes

- Integrations are scaffolded as safe plugin connectors with permission gates, audit logging, and rate limiting.
- Network/OAuth-specific implementations are intentionally dependency-injected for secure wiring in app-specific runtime code.

