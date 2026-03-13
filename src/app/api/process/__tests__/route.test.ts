import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock External Dependencies
vi.mock('@clerk/nextjs/server', () => ({
    auth: vi.fn().mockResolvedValue({ userId: 'test_user_id' })
}));

vi.mock('@/lib/jobs', () => ({
    createJob: vi.fn().mockResolvedValue({ _id: 'mock_job_id', inputUrl: 'https://youtube.com/watch?v=123' })
}));

vi.mock('@/inngest/client', () => ({
    inngest: { send: vi.fn().mockResolvedValue({}) }
}));

vi.mock('@/lib/rate-limit', () => ({
    rateLimit: { limit: vi.fn().mockResolvedValue({ success: true, reset: Date.now() + 60000 }) }
}));

vi.mock('@/lib/logger', () => ({
    logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() }
}));

vi.mock('@/models/AuditLog', () => ({
    default: { create: vi.fn().mockResolvedValue({}) }
}));

describe('POST /api/process', () => {
    it('returns 400 for invalid YouTube URLs', async () => {
        const req = new NextRequest('http://localhost:3000/api/process', {
            method: 'POST',
            body: JSON.stringify({ url: 'https://google.com' })
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.error).toContain('valid YouTube URL');
    });

    it('returns 200 and triggers Inngest for valid URLs', async () => {
        const req = new NextRequest('http://localhost:3000/api/process', {
            method: 'POST',
            body: JSON.stringify({ url: 'https://youtube.com/watch?v=hello' })
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.count).toBe(1);
    });
});
