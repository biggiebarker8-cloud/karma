# Alliance Bot Capability

Alliance Bot is a cross-channel AI solutions consultant capability that includes action scaffolds for:

- TikTok
- Facebook / Meta
- Claude
- Amazon
- Instagram
- Shopify
- Wix
- Openclaw
- Larks
- Azure
- Manus
- AI solutions consulting

## Access policy

- Solutions Consultant is the primary operator for standard allowlisted actions.
- Payment/billing and admin-role/ownership/privilege-change requests are always blocked from execution.
- Blocked requests return a clear `not-permitted` response with handoff instructions for an authorized human admin.
- Every blocked request is logged with actor, timestamp, and requested action for auditing.

Implementation file:

- `/home/runner/work/karma/karma/packages/studio/src/assistant/plugins/allianceBotPlugin.js`

## Action IDs

- `tiktok-growth-playbook`
- `facebook-meta-campaign-setup`
- `claude-solution-design`
- `amazon-marketplace-strategy`
- `instagram-content-system`
- `shopify-conversion-architecture`
- `wix-site-implementation`
- `openclaw-workspace-setup`
- `larks-handoff-plan`
- `azure-platform-rollout`
- `manus-automation-blueprint`
- `ai-solutions-consulting`
