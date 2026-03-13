import mongoose, { Schema, Document, Model } from 'mongoose';
import { encrypt, decrypt } from '@/lib/encryption';

export interface IJob extends Document {
  userId: string;                // Clerk user ID
  status: 'pending' | 'processing' | 'completed' | 'failed';
  inputUrl: string;              // YouTube URL
  title?: string;                // Fetched from YT
  transcriptId?: mongoose.Types.ObjectId; // Ref to Transcript collection
  analysis?: Record<string, any>; // LLM summary + key moments (JSON)
  outputs?: Record<string, any>; // { tiktok: {...}, linkedin: {...} }
  error?: string;
  pinned?: boolean;              // User stared/pinned job
  isPublic?: boolean;            // Share-by-link toggle
  shareSlug?: string;            // nanoid unique public share URL
  webhookUrl?: string;           // Optional URL to ping on completion
  generateOptions?: {
    tone?: string;
    audience?: string;
  };
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
    transcriptId: { type: Schema.Types.ObjectId, ref: 'Transcript' },
    analysis: Schema.Types.Mixed,
    outputs: Schema.Types.Mixed,
    error: String,
    pinned: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    shareSlug: { type: String, unique: true, sparse: true },
    webhookUrl: String,
    generateOptions: {
      tone: String,
      audience: String,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Add text index for search
jobSchema.index({ title: 'text', inputUrl: 'text' });

// Add compound indexes for dashboard fast retrieval
jobSchema.index({ userId: 1, createdAt: -1 });
jobSchema.index({ userId: 1, status: 1, createdAt: -1 });

// Model caching for hot reload
const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);

export default Job;