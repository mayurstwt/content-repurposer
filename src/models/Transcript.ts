import mongoose, { Schema, Document, Model } from 'mongoose';
import { encrypt, decrypt } from '@/lib/encryption';

export interface ITranscript extends Document {
    jobId: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

const transcriptSchema = new Schema<ITranscript>(
    {
        jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
        text: { type: String, required: true, get: decrypt, set: encrypt },
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true },
    }
);

const Transcript: Model<ITranscript> = mongoose.models.Transcript || mongoose.model<ITranscript>('Transcript', transcriptSchema);

export default Transcript;
