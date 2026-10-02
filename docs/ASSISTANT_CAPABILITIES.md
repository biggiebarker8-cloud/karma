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
- Read-only GitHub repository access for repository metadata, files, and code search
- Separate Karma and GPT-powered Collaborator profiles, bounded Together replies, and approval-gated tool execution

## ChatGPT setup

The assistant can use OpenAI GPT models through the server-side model transport. Set
`OPENAI_API_KEY` in the server environment before creating the default runtime; never
put this key in browser code or client-exposed configuration. Supported model names
include `gpt-5` and `gpt-5-mini`.

## GitHub repository setup

The GitHub connector is read-only and permission-gated. Set `GITHUB_TOKEN` only in
the server environment, grant the assistant `github:read`, and enable
`githubEnabled`. Use a fine-grained token limited to the repositories it should
help with; never expose the token in browser code or client configuration.

## Two-assistant runtime

`runtime.assistantProfiles` exposes `karma`, `collaborator`, and `together` chat
modes. Karma uses Claude and Collaborator uses GPT; Together returns one labeled
reply from each, with an optional single review. Profile instructions, histories,
feedback, and examples are kept separate in the shared memory store. Only facts
reviewed by Dan are included in the shared business knowledge supplied to prompts.

Tool calls should go through `assistantProfiles.executeTool`; the plugin registry
rechecks its permission gates for every execution. Actions matching the runtime's
sensitive-action policy require an exact, single-use approval requested for one
profile and action. The runtime defaults to denying Dan-only changes and approvals.
When constructing the runtime, configure `authorizeDanAction` to check a verified
server identity (for example, `(_operation, identity) => identity?.id === danUserId`).
Never accept the identity from a request body or expose the runtime or authorization
callback directly to browser code.

`TwoAssistantChat.jsx` provides Karma, Collaborator, and Together chat, profile
history, and shared-fact and action-approval review. Its same-origin API is
implemented by `createAssistantHttpHandler` in
`packages/studio/src/assistant/server/assistantHttpHandler.js`. Mount that handler
at the `/api/assistant/` paths and provide `getAuthenticatedIdentity` using the
host's verified session middleware plus Dan's stable user ID. The handler ignores
client-supplied identity fields and checks Dan's identity for fact review and action
approval. The host's identity resolver must also enforce its normal session and
CSRF protections on state-changing requests.

This remains a runtime foundation rather than a complete hosted product: profile
history and approvals are retained only in process memory, and the host must mount
the handler, supply authenticated identity/session and CSRF protections, and provide
durable storage if history must survive restarts. API keys remain server-side.
This does not import ChatGPT's private memory or transfer an existing assistant.

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
