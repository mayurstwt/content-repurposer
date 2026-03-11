// src/lib/llm.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeTranscript(transcript: string) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.4,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
        },
    });

    const prompt = `
You are an expert viral content strategist in 2026.

Transcript:
${transcript}

Analyze the transcript and output strict JSON only (no extra text):

{
  "summary": "One-paragraph core message (80-150 words)",
  "key_moments": [
    {
      "start_time": "MM:SS or seconds number",
      "description": "Short description or quote (max 30 words)",
      "virality_potential": 1-10,
      "why_viral": "One sentence reason"
    }
    // 5-10 best moments
  ],
  "main_quotes": ["exact quote 1", "exact quote 2", "..."],
  "target_audience": "One sentence description",
  "primary_tone": "educational | motivational | controversial | casual | humorous"
}
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error('Gemini JSON parse failed:', e);
        console.error('Raw JSON:', jsonText);
        throw new Error('Invalid JSON from Gemini');
    }
}

export async function generatePlatformOutputs(analysis: any, transcript: string) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
        },
    });

    const prompt = `
Using this analysis and transcript:

Analysis: ${JSON.stringify(analysis)}
Transcript excerpt: ${transcript.slice(0, 8000)}... (truncated)

Generate platform-optimized content as strict JSON:

{
  "tiktok": {
    "hook": "First 3-second spoken hook",
    "script": "Full spoken script (15-60 seconds)",
    "suggested_clip_start": "seconds or MM:SS",
    "suggested_clip_end": "seconds or MM:SS",
    "caption": "Caption with emojis + 5-8 hashtags",
    "cta": "Call to action"
  },
  "instagram_reels": { same structure as tiktok },
  "youtube_shorts": { same structure },
  "linkedin": {
    "post_text": "Full post (hook + body + CTA, 100-300 words)",
    "carousel_outline": ["Slide 1 text", "Slide 2 text", ...],
    "hashtags": ["tag1", "tag2"]
  },
  "twitter_thread": {
    "tweets": [
      "Tweet 1/5 text",
      "Tweet 2/5 text",
      ...
    ]
  },
  "newsletter_summary": {
    "subject": "Catchy subject line",
    "body": "300-500 word summary + CTA"
  }
}
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error('Gemini outputs parse failed:', e);
        console.error('Raw JSON outputs:', jsonText);
        throw new Error('Invalid JSON from Gemini');
    }
}