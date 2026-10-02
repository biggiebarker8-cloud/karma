import { createAssistantApp } from '../src/assistant/server/assistantApp.js';

const required = ['SESSION_SECRET', 'DAN_USER_ID', 'DAN_PASSWORD', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '127.0.0.1';
  const app = createAssistantApp({
    databasePath: process.env.DATABASE_PATH ?? './data/assistant.sqlite',
    sessionSecret: process.env.SESSION_SECRET,
    danUserId: process.env.DAN_USER_ID,
    danPassword: process.env.DAN_PASSWORD,
    publicOrigin: process.env.PUBLIC_ORIGIN,
    secureCookies: process.env.COOKIE_SECURE === undefined
      ? process.env.NODE_ENV !== 'development'
      : process.env.COOKIE_SECURE === 'true',
  });

  try {
    const address = await app.listen(port, host);
    console.log(`Karma assistant listening at http://${address.address}:${address.port}`);
  } catch (error) {
    app.storage.close();
    throw error;
  }

  let stopping = false;
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      if (stopping) return;
      stopping = true;
      await app.close();
      process.exit(0);
    });
  }
}
