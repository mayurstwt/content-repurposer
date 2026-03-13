// src/app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { repurposeVideo, resetMonthlyQuota } from '@/inngest/functions';
import { inngest } from '@/inngest/client';

// Serve all functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [repurposeVideo, resetMonthlyQuota],
});