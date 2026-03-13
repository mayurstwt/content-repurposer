// src/lib/schemas.ts
import { z } from 'zod';

export const ProcessInputSchema = z.object({
  url: z.string().refine(
    (val) => {
      const urls = val.split('\n').map((u) => u.trim()).filter(Boolean);
      if (urls.length === 0) return false;
      if (urls.length > 10) return false;
      return urls.every((u) => {
        try {
          const parsed = new URL(u);
          return parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be');
        } catch {
          return false;
        }
      });
    },
    { message: 'Provide 1 to 10 valid YouTube URLs, each on a new line.' }
  ),
  tone: z.string().optional(),
  audience: z.string().optional(),
  webhookUrl: z.string().url('Must be a valid HTTP URL').optional().or(z.literal('')),
});

export type ProcessInput = z.infer<typeof ProcessInputSchema>;