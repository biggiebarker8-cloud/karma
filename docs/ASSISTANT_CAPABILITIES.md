# Assistant Capability Foundation

This repository now includes a foundation for:

- Plugin/capability registration with feature flags and permission checks
- Claude model gateway with strict JSON mode and schema validation
- Voice/hearing adapters and turn controls (pause, interrupt, confirm)
- Vision adapter with multi-format image normalization and validation
- Integration plugin connectors for Openclaw, TikTok (personal, business, ads), Facebook, Instagram, WhatsApp Business, Meta Business, Reddit, Shopify, Amazon, and Canva
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
- Shopify and Amazon plugins expose store-running actions (store overview, order listing, inventory levels, inventory/price updates, discounts/promotions, and Amazon account health) behind their existing `shopify:write`/`amazon:write` permission gates, returning safe documentation-ready stubs until real store credentials are wired in.
- Facebook and Instagram plugins expose Meta Business Suite-style actions (page/profile overview, post creation/scheduling, insights, and ad account listing) behind the existing `post:facebook`/`post:instagram` permissions.
- The `meta-business` plugin is a read-only umbrella (`meta-business:read`) that reports Meta for Business account overview and which connected platforms (Facebook, Instagram, WhatsApp Business) are linked.
- The `whatsapp-business` plugin (`post:whatsapp-business`) exposes business profile lookup, message sending, message template listing, and conversation insights.
- The `reddit` plugin (`post:reddit`) targets a Reddit business account with post creation, subreddit insights, and ads campaign listing actions.
- TikTok is split into three scoped plugins: `tiktok` (personal account, `post:tiktok`), `tiktok-business` (`post:tiktok-business`), and `tiktok-ads` (`tiktok-ads:write`), each with its own account overview, content/campaign, and insights actions.
- Creative and vision capabilities are dependency-injected so production analyzers/providers can be wired safely.
- Network/OAuth-specific implementations are intentionally dependency-injected for secure wiring in app-specific runtime code.
- iOS is handled with explicit install guidance (Add to Home Screen) because browsers do not permit silent auto-install, while still exposing Apple App Store and Google Play links together when configured.
- The Microsoft hub acts as a curated Microsoft knowledge base, including Copilot, business, cloud, contact/support, and developer/visual suite sections plus official Microsoft links and Apple-friendly web-first guidance for iPhone, iPad, and Mac users.
