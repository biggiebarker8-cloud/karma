# Assistant Capability Foundation

This repository now includes a foundation for:

- Plugin/capability registration with feature flags and permission checks
- Claude model gateway with strict JSON mode and schema validation
- Voice/hearing adapters and turn controls (pause, interrupt, confirm)
- Vision adapter with multi-format image normalization and validation
- Integration plugin connectors for Openclaw, TikTok, Facebook, Instagram, Shopify, Amazon, and Canva
- Microsoft hub capability with curated Copilot, business, cloud, developer/visual suite, product, offer, partner, contact, learning, and Apple-friendly pages
- Creative plugins for hoodie design, comics, and movie clip workflows
- Cross-device desktop install advisor and install plugin for iOS/Android/desktop paths
- Memory scopes (session/user/task), tone profiles, and accessibility profiles
- Continuous learning feedback capture
- Internet reference retrieval with domain allowlisting and required citations

## Entry point

- `/home/runner/work/karma/karma/packages/studio/src/assistant/index.js`

## Notes

- Integrations are scaffolded as safe plugin connectors with permission gates, audit logging, and rate limiting.
- Openclaw is registered as its own assistant integration with a dedicated feature flag and permission so it can stay separate from other AI or agency-specific tooling.
- Openclaw exposes standalone app planning, agency workspace setup, TikTok dashboard setup, AI permissions handoff, and Larks documentation handoff actions so it can support an agency launch without being coupled into Larks.
- Creative and vision capabilities are dependency-injected so production analyzers/providers can be wired safely.
- Network/OAuth-specific implementations are intentionally dependency-injected for secure wiring in app-specific runtime code.
- iOS is handled with explicit install guidance (Add to Home Screen) because browsers do not permit silent auto-install, while still exposing Apple App Store and Google Play links together when configured.
- The Microsoft hub acts as a curated Microsoft knowledge base, including Copilot, business, cloud, contact/support, and developer/visual suite sections plus official Microsoft links and Apple-friendly web-first guidance for iPhone, iPad, and Mac users.
