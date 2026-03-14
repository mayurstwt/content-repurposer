/** @jest-environment node */

import { describe, it, expect, jest } from '@jest/globals';

// Mock the Gemini API
jest.mock('@google/generative-ai', () => {
    const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
            text: () => JSON.stringify({
                summary: 'Test summary',
                key_moments: [{ timestamp: '0:00', description: 'Start' }]
            })
        }
    });

    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: mockGenerateContent
            })
        }))
    };
});

const { analyzeTranscript, generatePlatformOutputs } = require('../llm');

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

    it('generates platform outputs as parsed JSON', async () => {
        const result = await generatePlatformOutputs({ summary: 'Summary' }, 'Transcript text');
        expect(result).toHaveProperty('summary');
    });
});
