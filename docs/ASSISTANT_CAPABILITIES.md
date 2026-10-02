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

`npm start` in `packages/studio` runs the local Node.js app. The browser UI in
`packages/studio/public` provides Karma, Collaborator, and Together chat, profile
history, and shared-fact and action-approval review. It mounts
`createAssistantHttpHandler` behind
`createAssistantApp`'s login/session and CSRF middleware. The SQLite store persists
profile histories, proposed and approved shared facts, sessions, and pending or
approved action tokens across app restarts. Approval consumption is transactional
and single-use. The data file is created with owner-only permissions.

Use Node.js 22.13 or newer (the built-in `node:sqlite` module is currently
experimental). Configure these environment variables before startup:

- `SESSION_SECRET`: random secret of at least 32 bytes used to sign session cookies.
- `DAN_USER_ID`: stable server-side identity for the single workspace account.
- `DAN_PASSWORD`: workspace login password, at least 12 bytes.
- `OPENAI_API_KEY` and `ANTHROPIC_API_KEY`: server-side model credentials.
- `DATABASE_PATH`: SQLite file path; defaults to `./data/assistant.sqlite`.
- `PORT`: HTTP port; defaults to `3000`.
- `HOST`: listen address; defaults to `127.0.0.1`.
- `PUBLIC_ORIGIN`: optional exact HTTP(S) origin for deployments behind a TLS
  reverse proxy; configure it to the browser-visible origin so POST origin checks
  do not trust forwarded headers.
- `COOKIE_SECURE`: explicitly set `true` or `false`; defaults to secure cookies except
  when `NODE_ENV=development`. Use HTTPS and secure cookies outside local development.

For local development:

```sh
cd packages/studio
export SESSION_SECRET="$(openssl rand -base64 48)"
export DAN_USER_ID="dan"
export DAN_PASSWORD="replace-with-a-long-local-password"
export OPENAI_API_KEY="..."
export ANTHROPIC_API_KEY="..."
NODE_ENV=development npm start
```

The browser receives an HttpOnly, SameSite=Strict signed session cookie. Each
state-changing API request must also pass same-origin validation and the CSRF token
issued for that server-verified session. The server never accepts identity from
request bodies or headers. This starter uses one configured workspace account;
production account lifecycle, HTTPS termination, backups, and operational database
management remain responsibilities of the deployer. API keys remain server-side.
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
