import { describe, it, expect, vi } from 'vitest';
import { analyzeTranscript, generatePlatformOutputs } from '../llm';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the Gemini API
vi.mock('@google/generative-ai', () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
        response: {
            text: () => JSON.stringify({
                summary: 'Test summary',
                key_moments: [{ timestamp: '0:00', description: 'Start' }]
            })
        }
    });

    return {
        GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
            getGenerativeModel: vi.fn().mockReturnValue({
                generateContent: mockGenerateContent
            })
        }))
    };
});

describe('LLM Helpers', () => {
    it('analyzes a transcript and returns JSON', async () => {
        const result = await analyzeTranscript('This is a test transcript of a video.');
        expect(result).toHaveProperty('summary');
        expect(result.summary).toBe('Test summary');
        expect(result.key_moments).toHaveLength(1);
    });

    it('passes tone and audience parameters into the prompt implicitly', async () => {
        // Just verify it doesn't crash here since we mocked the result
        const result = await analyzeTranscript('Transcript text', { tone: 'funny', audience: 'kids' });
        expect(result.summary).toBe('Test summary');
    });
});
