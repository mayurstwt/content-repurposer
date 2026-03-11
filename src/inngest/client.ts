// src/inngest/client.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: process.env.INNGEST_APP_NAME || 'content-repurposer',
  eventKey: process.env.INNGEST_EVENT_KEY!,
  // For local dev: connect to Inngest Dev Server (optional but recommended)
  // We'll run `npx inngest-cli@latest dev` later
});