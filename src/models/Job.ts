// src/models/Job.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  userId: string;                // Clerk user ID
  status: 'pending' | 'processing' | 'completed' | 'failed';
  inputUrl: string;              // YouTube URL
  title?: string;                // Fetched from YT
  transcript?: string;           // Full text or JSON
  analysis?: Record<string, any>; // LLM summary + key moments (JSON)
  outputs?: Record<string, any>; // { tiktok: {...}, linkedin: {...} }
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    inputUrl: { type: String, required: true },
    title: String,
    transcript: String,
    analysis: Schema.Types.Mixed,
    outputs: Schema.Types.Mixed,
    error: String,
  },
  { timestamps: true }
);

// Model caching for hot reload
const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);

export default Job;