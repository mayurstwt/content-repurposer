/** @jest-environment node */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

async function loadRoute() {
  let POST!: (req: NextRequest) => Promise<Response>;

  await jest.isolateModulesAsync(async () => {
    jest.doMock('@clerk/nextjs/server', () => ({
      auth: jest.fn().mockResolvedValue({ userId: 'test_user_id' }),
    }));

    jest.doMock('@/lib/jobs', () => ({
      createJob: jest.fn().mockResolvedValue({
        _id: { toString: () => 'mock_job_id' },
        inputUrl: 'https://www.youtube.com/watch?v=hello123',
      }),
    }));

    jest.doMock('@/inngest/client', () => ({
      inngest: { send: jest.fn().mockResolvedValue({}) },
    }));

    jest.doMock('@/lib/rate-limit', () => ({
      rateLimit: { limit: jest.fn().mockResolvedValue({ success: true, reset: Date.now() + 60000 }) },
    }));

    jest.doMock('@/lib/quota', () => ({
      checkJobQuota: jest.fn().mockResolvedValue({ allowed: true, plan: 'free', limit: 10 }),
    }));

    jest.doMock('@/lib/logger', () => ({
      logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
    }));

    jest.doMock('@/models/AuditLog', () => ({
      __esModule: true,
      default: { create: jest.fn().mockResolvedValue({}) },
    }));

    POST = (await import('../route')).POST;
  });

  return POST;
}

describe('POST /api/process', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns 400 for invalid YouTube URLs', async () => {
    const POST = await loadRoute();
    const req = new NextRequest('http://localhost:3000/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://google.com' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Provide 1 to 10 valid YouTube URLs, each on a new line.');
  });

  it('returns 200 and triggers Inngest for valid URLs', async () => {
    const POST = await loadRoute();
    const req = new NextRequest('http://localhost:3000/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=hello123' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.count).toBe(1);
  });
});
