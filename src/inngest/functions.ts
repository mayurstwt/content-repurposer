// src/inngest/functions.ts
import { inngest } from './client';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
// ✅ FIX 1: Import Deepgram class (not createClient)
import { createClient } from '@deepgram/sdk';
import YTDlpWrap from 'yt-dlp-wrap';
import fs from 'fs/promises';  // better async version
import path from 'path';
import os from 'os';
import { analyzeTranscript, generatePlatformOutputs } from '@/lib/llm';

export const repurposeVideo = inngest.createFunction(
  {
    id: 'repurpose-video',
    // ✅ FIX 2: Use 'attempts' with literal number (not maxAttempts)
    retries: 3, // auto-retry on transient fails
  },
  { event: 'video/repurpose' },
  async ({ event, step }) => {
    const { jobId } = event.data as { jobId: string };

    await dbConnect();

    // Step 1: Mark processing
    await step.run('update-processing', async () => {
      await Job.findByIdAndUpdate(jobId, { status: 'processing' });
    });

    let transcriptResult: any = null;
    let errorMessage: string | null = null;
    let tempDir: string = '';
    let tempAudioPath: string = '';

    try {
      // Step 2a: Extract & download audio to temp file
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repurposer-'));
      tempAudioPath = path.join(tempDir, `${jobId}.m4a`);

      const audioPath = await step.run('download-audio', async () => {
        // Automatically download the yt-dlp binary if missing (fixes ENOENT error)
        const ytDlpBinaryPath = path.join(os.tmpdir(), 'yt-dlp-binary');
        try {
          await fs.stat(ytDlpBinaryPath);
        } catch (e) {
          console.log('yt-dlp binary not found, downloading from GitHub...');
          await YTDlpWrap.downloadFromGithub(ytDlpBinaryPath);
        }

        const ytDlp = new YTDlpWrap(ytDlpBinaryPath); // Use the downloaded binary

        const ytDlpArgs = [
          event.data.inputUrl,
          '-f', 'bestaudio[ext=m4a]',  // prefer m4a (AAC) for size/compatibility
          '--audio-format', 'm4a',
          '-o', tempAudioPath,
          '--no-playlist',             // avoid downloading whole playlist
          '--quiet',
          '--no-warnings',
        ];

        console.log('Running yt-dlp with args:', ytDlpArgs);

        await ytDlp.execPromise(ytDlpArgs);

        // Verify file exists and has size
        const stats = await fs.stat(tempAudioPath);
        if (stats.size === 0) {
          throw new Error('Downloaded audio file is empty');
        }

        return tempAudioPath;
      });

      // Step 2b: Transcribe the local file
      transcriptResult = await step.run('transcribe-video', async () => {
        const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

        const audioBuffer = await fs.readFile(audioPath!);

        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
          audioBuffer,
          {
            model: 'nova-2',
            smart_format: true,
            language: 'en',
            punctuate: true,
            // Temporarily removed diarize, paragraphs, and utterances for debugging
          }
        );

        if (error) {
          throw new Error(`Deepgram failed: ${JSON.stringify(error)}`);
        }

        const transcriptText = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

        return {
          fullTranscript: transcriptText,
        };
      });




      // Clean up temp files (critical on serverless!)
      await step.run('cleanup-files', async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
        console.log('Temp files cleaned');
      });

    } catch (err: any) {
      errorMessage = err.message || 'Audio download/transcription failed';
      console.error('Full processing error:', err);

      // Optional: cleanup on error too
      if (tempDir) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => { });
      }
    }


    let analysis: any = null;
    let outputs: any = null;

    if (transcriptResult) {
      // Step 3: LLM Analysis
      analysis = await step.run('llm-analyze', async () => {
        return await analyzeTranscript(transcriptResult.fullTranscript);
      });

      // Step 4: Generate platform outputs
      outputs = await step.run('llm-generate-outputs', async () => {
        return await generatePlatformOutputs(analysis, transcriptResult.fullTranscript);
      });
    }

    // Step 5: Update job with result or error
    await step.run('update-job-result', async () => {
      const updates: any = {
        updatedAt: new Date(),
      };

      if (transcriptResult) {
        updates.transcript = transcriptResult.fullTranscript;
        updates.analysis = analysis;
        updates.outputs = outputs;
        updates.status = 'completed';
      } else {
        updates.error = errorMessage;
        updates.status = 'failed';
      }

      await Job.findByIdAndUpdate(jobId, updates);
    });

    if (errorMessage) {
      throw new Error(errorMessage); // let Inngest retry or mark failed
    }

    return { message: `Transcription done for job ${jobId}` };
  }
);