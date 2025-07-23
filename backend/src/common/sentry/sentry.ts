import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,

  integrations: [
    nodeProfilingIntegration(),
  ],

  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  
  _experiments: { enableLogs: true },
});