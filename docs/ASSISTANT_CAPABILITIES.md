# Assistant Capability Foundation

This repository now includes a foundation for:

- Plugin/capability registration with feature flags and permission checks
- Claude model gateway with strict JSON mode and schema validation
- Voice/hearing adapters and turn controls (pause, interrupt, confirm)
- Vision adapter with multi-format image normalization and validation
- Integration plugin connectors for Openclaw, TikTok, Facebook, Instagram, Shopify, Amazon, and Canva
- Opt-in Apple sign-in and CloudKit connection provider hooks
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
- Apple integration is disabled by default. Enable `appleEnabled`, grant `apple:sign-in` and/or `apple:cloud-connect`, and inject `appleAuth` and `appleCloud` when creating the runtime. `apple-sign-in` supports `sign-in` and `sign-out`; `apple-cloud` supports `connect`, `get-status`, `sync`, and `disconnect`. The cloud actions require a session from `appleAuth.getSession(context)`, not a user ID supplied by the caller.
- The host application must implement the Apple authorization-code callback and server-side token exchange and verification (signature against Apple's keys, issuer, audience, expiry, nonce/state), issue its own secure session, and provide `appleAuth.signIn`, `getSession`, and `signOut`. Never return raw tokens in the user result or persist them in assistant memory. CloudKit needs an Apple Developer account, configured container and entitlements, and its **own** authentication/authorization in `appleCloud.connect/getStatus/disconnect`; Sign in with Apple alone does not authorize CloudKit. CloudKit accesses the application's container, not arbitrary personal iCloud Drive files. No live Apple connection is made until these providers are supplied.
- For iPhone and iMac (including the 2024 10-core model), the host's `appleCloud.sync(session)` must synchronize the same app CloudKit container/account and handle offline changes and conflicts. The runtime exposes the sync action without platform or CPU restrictions, but does not itself store data or perform automatic device syncing.
- iOS is handled with explicit install guidance (Add to Home Screen) because browsers do not permit silent auto-install, while still exposing Apple App Store and Google Play links together when configured.
- The Microsoft hub acts as a curated Microsoft knowledge base, including Copilot, business, cloud, contact/support, and developer/visual suite sections plus official Microsoft links and Apple-friendly web-first guidance for iPhone, iPad, and Mac users.
