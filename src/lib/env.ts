// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(), // we'll add later
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  // Add more later: DEEPGRAM_API_KEY, ANTHROPIC_API_KEY, MONGODB_URI / SUPABASE_URL etc.
});

const env = envSchema.parse(process.env);

export default env;