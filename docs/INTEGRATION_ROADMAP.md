# Integration implementation roadmap

## Status rules

- **LIVE-capable** means code can make an authenticated provider request when valid server credentials are configured. It does not mean deployment credentials or a real account were verified.
- **PARTIAL** means a real authenticated operation exists, but setup, controls, coverage, or live verification is incomplete.
- **PLACEHOLDER** means planning/scaffold code only; it does not make an authenticated call to that service.
- **DOCUMENTATION-ONLY** means the repository contains guidance or a local catalog, not an external service connection.
- **DONE** requires an observed real authenticated call in a controlled account/environment, validated result, and a record of the date, environment, account type, operation, and outcome. Mocks, setup plans, docs, and token presence do not qualify.

All provider credentials, client secrets, access/refresh tokens, and signing keys must remain server-side. Do not commit them or expose them to browser code. Any future write, publish, spend, account connection, permission change, or admin action must retain exact owner approval bound to that operation and its parameters.

## Phase 1 — Existing authenticated code paths

### OpenAI

- **Current status:** LIVE-capable; not live-verified.
- **Credentials/config:** `OPENAI_API_KEY` in server environment. No OAuth scopes; restrict project/key access to intended inference where provider controls allow.
- **Backend work:** Timeout and non-empty response validation are implemented. No automatic retry is used for billable POSTs because a timeout may occur after provider processing and a retry could duplicate charges. Record cost/usage without logging prompts or secrets.
- **Tests:** Mock regression tests exist; add/use opt-in real-provider smoke testing outside ordinary CI.
- **Approval gates:** No approval for ordinary inference. Gate budget changes and account administration.
- **DONE:** Controlled deployment completes an authenticated request using the intended server-side key; record model and validated result; verify no key or sensitive prompt appears in logs/client output.

### Anthropic / Claude

- **Current status:** LIVE-capable; not live-verified.
- **Credentials/config:** `ANTHROPIC_API_KEY` in server environment. No OAuth scopes; restrict project/key access to intended inference where supported.
- **Backend work:** Timeout and non-empty text response validation are implemented. No automatic retry of billable POSTs. Record cost/usage without logging prompts or secrets.
- **Tests:** Mock regression tests exist; add/use opt-in real-provider smoke testing outside ordinary CI.
- **Approval gates:** No approval for ordinary inference. Gate budget changes and account administration.
- **DONE:** Controlled deployment completes an authenticated request with the intended key; record model and validated result; confirm secrets are not exposed.

### GitHub repository read

- **Current status:** PARTIAL. A bearer-token read transport exists, with exact repository allowlisting and bounded pagination. No live account call has been established.
- **Credentials/config:** Server-side `GITHUB_TOKEN` and `GITHUB_ALLOWED_REPOSITORIES` (comma-separated exact `owner/repository` values); `githubEnabled` and `github:read` must be enabled/granted.
- **Scopes:** Prefer a GitHub App installation token or fine-grained token restricted to allowlisted repositories. Use Metadata: read and Contents: read for repository/file reads. Confirm Code Search permissions for the selected token/account before enabling search.
- **Backend work:** Existing transport is read-only. Add/verify provider rate-limit handling and operational live-result recording; retain repository allowlisting.
- **Tests:** Mocks cover calls and allowlist denial. Add opt-in real reads for an allowlisted test repository/file and denial cases for out-of-scope repositories.
- **Approval gates:** Reads need no owner approval by default. Any future write, spend, permission change, or admin action must be separately implemented and owner-approved.
- **DONE:** Real authenticated reads of an allowlisted controlled repository and file succeed; out-of-scope requests fail; no write operation is exposed.

### MuAPI pricing

- **Current status:** PARTIAL. The UI performs a GET to the app/API route with session cookies and retries transient failures. Its authentication contract and production response have not been independently verified.
- **Credentials/config:** Confirm endpoint owner and production routing. No new client-side secret should be introduced.
- **Scopes:** Not applicable until the endpoint's authentication model is confirmed.
- **Backend work:** Document endpoint contract, auth, returned data and environment; ensure any credentials stay server-side.
- **Tests:** Mock retry/error coverage and a controlled request against the intended environment.
- **Approval gates:** Read-only lookup needs none; purchases/account changes require separate approval.
- **DONE:** Real request succeeds under the documented auth model and returns validated expected pricing data.

## Phase 2 — Shared provider foundation

### OAuth, token persistence, and tenant isolation

- **Current status:** PLACEHOLDER. `oauthTokenStore.js` uses an in-memory map only.
- **Credentials/config:** Provider app IDs/secrets, redirect URIs, encryption key management, and persistence are not configured.
- **Scopes:** None until provider, product, operations, data owner, and minimum scopes are specified and approved.
- **Backend work:** Implement state/CSRF and redirect validation; encrypted persistent tokens; refresh/revocation; tenant/account mapping; least-privilege grants; secret rotation; audit records. Keep tokens out of logs and browser responses.
- **Tests:** State mismatch, expiry/revocation, refresh, encryption at rest, tenant isolation, provider errors, and controlled OAuth flow with test applications.
- **Approval gates:** Owner approval for account connection/disconnection, scope grants/revocations, and administration.
- **DONE:** A controlled provider test account completes OAuth, encrypted tokens persist and refresh/revoke, tenant isolation holds, and credentials never reach client/log output.

## Phase 3 — Provider connections blocked on product/scope decisions

For each service, first define the required operations. Then verify exact scope names and app-review requirements against current official provider docs; do not request broad scopes by default.

### TikTok — PLACEHOLDER

- **Credentials/config:** Developer app, client key/secret, approved redirect URI, callback/domain, and authorized controlled account are missing.
- **Scopes:** Select TikTok product/API and intended reads/writes first; account identity, listing, upload, and publishing may differ. Verify current exact scopes/review requirements.
- **Backend work:** OAuth through Phase 2; authenticated API client; account mapping; token lifecycle; status/error/rate-limit handling; audit trail; enforce `post:tiktok` and read permissions. `post:tiktok` is enforced in the scaffold, but does not establish a TikTok API connection.
- **Tests:** Mock contracts, denied scopes, expiry/revocation, controlled authenticated read; test publish only when provider and owner approve a safe test.
- **Approval gates:** Owner approval for connection/scopes; exact owner approval for publishing, deletion, spend, and administration.
- **DONE:** Controlled authorized account completes the agreed authenticated read. Any write succeeds only in an approved test context and has an owner-approval gate.

### Shopify — PLACEHOLDER

- **Credentials/config:** App registration, client credentials, callback URLs, development store, and token store are missing.
- **Scopes:** Derive minimum Admin API scopes from approved operations and confirm using current Shopify documentation.
- **Backend work:** OAuth/install, per-store tenant mapping, API client, webhook verification if used, token lifecycle, audit, rate limits, and error handling.
- **Tests:** Mock contracts, development-store OAuth/read, insufficient-scope denial, controlled writes.
- **Approval gates:** Owner approval for store connection/scopes; exact owner approval for catalog/inventory/order changes, purchases/spend, and admin work.
- **DONE:** Real authenticated read succeeds against a controlled store; each enabled write is owner-gated and safely tested.

### Wix — NOT IMPLEMENTED

- **Credentials/config:** No app, OAuth client, callback, test site, or API client exists.
- **Scopes:** Choose Wix APIs/operations, then verify and request only exact documented scopes.
- **Backend work:** Provider OAuth, site tenancy, token lifecycle, API client, audit, limits, and safe errors.
- **Tests:** OAuth/read and scope-denial tests on a controlled site; writes only after approval.
- **Approval gates:** Owner approval for site connection/scopes; exact approval for publishing, deletion, billing/spend, or administration.
- **DONE:** Real authenticated read succeeds against controlled Wix site; any write is owner-gated and safely tested.

### Lark — DOCUMENTATION-ONLY

- **Credentials/config:** No app credentials, region/tenant, callback, or API client; existing action only describes a handoff.
- **Scopes:** Identify intended Docs, messaging, calendar, drive, or admin operations and region; verify exact scopes.
- **Backend work:** OAuth/API client, tenant mapping, encrypted token lifecycle, any required signature verification, audit and rate limits.
- **Tests:** Controlled tenant OAuth/authenticated read, scope-denial, and webhook verification if applicable.
- **Approval gates:** Owner approval for connection/scopes; exact approval for sending messages, modifying/deleting content, and administration.
- **DONE:** Authenticated read succeeds against controlled tenant; documentation-only handoff does not count.

### Facebook and Instagram — PLACEHOLDERS

- **Credentials/config:** Meta developer app, business/account setup, callbacks, and approved test tokens are missing.
- **Scopes:** Determine by Graph API product/account and operation; verify exact permissions, review, and business verification requirements.
- **Backend work:** OAuth, account mapping, Graph clients, token lifecycle, webhook verification if used, audit and rate-limit handling.
- **Tests:** Controlled business-account authenticated reads, permission-denial/expiry, test-account writes only.
- **Approval gates:** Owner approval for connections/scopes; exact approval for publish/delete and business/admin changes.
- **DONE:** Real reads succeed for authorized controlled accounts; every active write is gated and tested safely.

### Canva — PLACEHOLDER

- **Credentials/config:** App registration, OAuth credentials, callback, and controlled authorized account are missing.
- **Scopes:** Determine minimum Connect API scopes from approved operations and verify current names in Canva docs.
- **Backend work:** OAuth/token lifecycle, account/brand mapping, API client, audit, limits, safe errors.
- **Tests:** Controlled OAuth/read, scoped denial, and controlled asset actions.
- **Approval gates:** Owner approval for account/scope grant; exact approval for public publishing, destructive changes, spending, and administration.
- **DONE:** Real authenticated call succeeds against controlled account; public/destructive operations are gated.

### Amazon — PLACEHOLDER

- **Credentials/config:** Select target product/API first (for example, Selling Partner API); no app, role, credentials, or account mapping is configured.
- **Scopes:** Determine product-specific roles, authorization and signing requirements from official docs after selecting operations.
- **Backend work:** Implement selected authorization/signing, tenancy, token lifecycle, throttling, audit, and safe errors.
- **Tests:** Controlled developer/sandbox authenticated reads and auth/signing failures; writes only in safe test environment.
- **Approval gates:** Owner approval for access/roles; exact approval for purchases, spend, listing/order changes, or admin actions.
- **DONE:** Real authenticated operation succeeds in intended controlled environment; mock success does not count.

## Other claimed capabilities

- **Microsoft Hub — DOCUMENTATION-ONLY:** Uses a bundled catalog, not Microsoft account APIs. Select a Microsoft API/use case, configure Entra app and least-privilege permissions/consent, implement client, and test a real controlled-tenant read. Owner approval for admin consent and writes. DONE requires real authenticated API success.
- **Openclaw/agency setup — PLACEHOLDER/local planning:** Returns local setup plans. Identify a provider/API before implementing authenticated actions; gate account, spend, write, and admin operations.
- **Evidence register — local-only:** Structures supplied entries and labels them unverified. It is not a search or source-verification integration.
- **Voice, vision, internet references — PARTIAL/injected:** No default provider is wired. Select/configure providers, credentials and data controls; verify real calls where authentication applies.
- **Comics — local brief generation; hoodie design/movie clips — PLACEHOLDER:** No third-party creation or publishing API is connected.
- **ByteDance — no separate integration found:** TikTok references are not evidence of a ByteDance API connection.

## Release checklist

- [ ] Approve purpose, exact operations, provider API/product, and data owner for each service.
- [ ] Verify scopes in current official documentation before registering apps or requesting consent.
- [ ] Keep credentials server-side and encrypted; never commit them.
- [ ] Add tenant isolation, allowlists, revocation/rotation, audit, rate limits, timeouts, and safe errors.
- [ ] Bind owner approvals to exact connect/disconnect, scope grant/revoke, write, publish, delete, spend, and admin operations.
- [ ] Separate mocked CI tests from opt-in live tests; use controlled accounts and avoid unapproved destructive/public actions.
- [ ] Record date, environment, account type, operation, and result for each real authenticated verification; do not infer completion from docs, mocks, plans, or token presence.
