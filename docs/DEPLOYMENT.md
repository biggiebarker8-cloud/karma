# Deploy the Karma assistant

## Recommended host

Use a Render Node.js web service with a persistent disk. This app is a single
Node.js HTTP server using the built-in `node:sqlite` module; it is not a static
site or a serverless function. The service needs a writable, durable filesystem
for SQLite, and its WAL database files must remain on the same persistent disk.
The included [`render.yaml`](../render.yaml) configures that service and disk.

Run one service instance. SQLite on a local disk is not shared storage, and the
login-attempt limiter is held in process memory, so multiple instances would not
share state. Render persistent disks require a paid service and do not support
zero-downtime deploys; expect a brief interruption during deploys. Back up the
disk/database before risky changes and keep a separate backup of the session
secret.

## What runs

- Server entry point: `packages/studio/scripts/serve-assistant.mjs`
- Start command from the configured service root (`packages/studio`): `npm start`
- Runtime: Node.js 22.13.0 or newer. The app uses Node's built-in SQLite module.
- The service listens on `HOST` and `PORT`; the deployment sets `HOST=0.0.0.0`
  and Render supplies `PORT`.
- SQLite path: `DATABASE_PATH`, set to `/var/data/assistant.sqlite` on the
  persistent disk. The app creates the containing directory and database.
- Profile histories, proposed/approved shared facts, sessions, and action
  approvals persist in SQLite. The SQLite `-wal` and `-shm` files are created
  beside the database and therefore also reside on the disk.

## Required environment

The Render Blueprint generates `SESSION_SECRET` and prompts you to supply:

| Variable | Set to |
| --- | --- |
| `DAN_USER_ID` | A stable private identifier for the workspace owner. |
| `DAN_PASSWORD` | A unique, strong workspace password (at least 12 bytes). |
| `OPENAI_API_KEY` | Your OpenAI API key, entered only in Render's secret environment settings. |
| `ANTHROPIC_API_KEY` | Your Anthropic API key, entered only in Render's secret environment settings. |

Never commit or paste API keys into source code, deployment files, browser
configuration, or chat. The app requires both model credentials at startup.

The Blueprint also sets `NODE_ENV=production`, `HOST=0.0.0.0`,
`DATABASE_PATH=/var/data/assistant.sqlite`, and `COOKIE_SECURE=true`. Render
sets `PORT`. After Render assigns the service URL, set `PUBLIC_ORIGIN` in the
service's environment to the exact browser-visible origin, for example
`https://your-service-name.onrender.com` (no path or trailing slash). This is
needed for same-origin checks behind Render's TLS proxy. If you use a custom
domain, use that canonical HTTPS origin instead.

## Render setup

1. Push this repository to GitHub and sign in to Render.
2. In Render, choose **New → Blueprint**, connect this repository, and select
   the `main` branch. Render reads the root `render.yaml`.
3. Confirm the `karma-assistant` web service and its 1 GB persistent disk.
   Choose a unique service name if the proposed name is unavailable.
4. Enter `DAN_USER_ID`, `DAN_PASSWORD`, `OPENAI_API_KEY`, and
   `ANTHROPIC_API_KEY` in Render's Blueprint prompts. Use a password manager to
   generate and retain the workspace password. Do not put real credentials in
   the repository.
5. Create the Blueprint and wait for the first deploy to finish.
6. Copy the assigned HTTPS service URL from Render. In **Environment**, add
   `PUBLIC_ORIGIN` as that URL's origin (scheme and host only), save, and
   redeploy if prompted.
7. Open the HTTPS URL, sign in with `DAN_PASSWORD`, and check that both
   assistants answer. These checks make live model requests and require valid
   provider credentials and available API quota.
8. Keep the service at one instance. Set up and periodically verify backups for
   the persistent disk and securely retain `SESSION_SECRET`; changing that
   secret invalidates existing signed sessions.

## Local verification

From the repository root:

```sh
cd packages/studio
npm test
npm run try:assistant
```

Local start also requires all five variables checked by the server entry point:
`SESSION_SECRET`, `DAN_USER_ID`, `DAN_PASSWORD`, `OPENAI_API_KEY`, and
`ANTHROPIC_API_KEY`. Set real credentials only in a private local environment,
never in tracked files.
