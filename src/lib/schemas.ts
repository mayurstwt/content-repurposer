import { z } from 'zod';

function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

    // Block private, loopback, and cloud metadata IPs
    const blockedIPs = [
      /^localhost$/,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^0\./,
      /^\[::1\]$/,
    ];

    return !blockedIPs.some(regex => regex.test(parsed.hostname));
  } catch {
    return false;
  }
}

export const ProcessInputSchema = z.object({
  url: z.string().refine(
    (val) => {
      const urls = val.split('\n').map((u) => u.trim()).filter(Boolean);
      if (urls.length === 0) return false;
      if (urls.length > 10) return false;
      return urls.every((u) => {
        try {
          const parsed = new URL(u);
          if (parsed.searchParams.has('list')) return false; // Block playlists
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
  webhookUrl: z.string().url('Must be a valid HTTP URL').optional().or(z.literal(''))
    .refine((url) => !url || isValidWebhookUrl(url), { message: "Invalid webhook URL: Private IPs or localhost are not allowed." }),
});

export type ProcessInput = z.infer<typeof ProcessInputSchema>;