// src/lib/schemas.ts
import { z } from 'zod';

export const ProcessInputSchema = z.object({
  url: z.string().url().refine(
    (val) => val.includes('youtube.com') || val.includes('youtu.be'),
    { message: 'Must be a valid YouTube URL' }
  ),
});

export type ProcessInput = z.infer<typeof ProcessInputSchema>;