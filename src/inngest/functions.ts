// src/inngest/functions.ts
import { inngest } from './client';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import Transcript from '@/models/Transcript';
import User from '@/models/User';
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
    onFailure: async ({ event, error }) => {
      // Catch terminal failures (after 3 retries exhausted)
      await dbConnect();
      const jobId = event.data.event.data.jobId;
      await Job.findByIdAndUpdate(jobId, {
        status: 'failed',
        error: error.message || 'Job failed repeatedly.',
        updatedAt: new Date()
      });
    }
  },
  { event: 'video/repurpose' },
  async ({ event, step }) => {
    const { jobId } = event.data as { jobId: string };

    await dbConnect();

    // Step 1: Mark processing and get options
    const jobOptions: any = await step.run('update-processing', async () => {
      const job = await Job.findByIdAndUpdate(jobId, { status: 'processing' });
      // Plain object return for serialization
      return {
        tone: job?.generateOptions?.tone,
        audience: job?.generateOptions?.audience,
        webhookUrl: job?.webhookUrl,
      };
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
        return await analyzeTranscript(transcriptResult.fullTranscript, jobOptions);
      });

      // Step 4: Generate platform outputs
      outputs = await step.run('llm-generate-outputs', async () => {
        return await generatePlatformOutputs(analysis, transcriptResult.fullTranscript, jobOptions);
      });
    }

    let transcriptId: any = null;
    if (transcriptResult) {
      // Step 5: Save raw transcript separately
      transcriptId = await step.run('save-transcript', async () => {
        await dbConnect();
        const t = await Transcript.create({
          jobId,
          text: transcriptResult.fullTranscript,
        });
        return t._id.toString();
      });
    }

    // Step 6: Update job with result or error
    await step.run('update-job-result', async () => {
      const updates: any = {
        updatedAt: new Date(),
      };

      if (transcriptResult) {
        updates.transcriptId = transcriptId;
        updates.analysis = analysis;
        updates.outputs = outputs;
        updates.status = 'completed';
      } else {
        updates.error = errorMessage;
        updates.status = 'failed';
      }

      await Job.findByIdAndUpdate(jobId, updates, { runSettersOnQuery: true });
    });

    if (errorMessage) {
      throw new Error(errorMessage); // let Inngest retry or mark failed
    }

    // Step 7: Trigger Webhook if present
    if (jobOptions.webhookUrl) {
      await step.run('fire-webhook', async () => {
        try {
          await fetch(jobOptions.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jobId,
              status: 'completed',
              inputUrl: event.data.inputUrl,
              outputs,
            })
          });
        } catch (e) {
          console.error('Webhook payload failed to deliver:', e);
          // We do not throw here to prevent failing the entire job if the user's webhook is down.
        }
      });
    }

    return { message: `Transcription done for job ${jobId}` };
  }
);

// Cron job to reset monthly limits on the 1st of every month at midnight UTC
export const resetMonthlyQuota = inngest.createFunction(
  { id: 'reset-monthly-quota' },
  { cron: '0 0 1 * *' }, // 1st day of every month
  async ({ step }) => {
    await step.run('reset-mongodb-quotas', async () => {
      await dbConnect();
      const result = await User.updateMany({}, { $set: { jobsThisMonth: 0 } });
      return { resetCount: result.modifiedCount };
    });
  }
);