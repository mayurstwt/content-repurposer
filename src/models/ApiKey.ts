import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApiKey extends Document {
    userId: string; // Clerk user ID
    name: string; // Identifier for this key (e.g. "Production Script")
    keyHash: string; // securely hashed actual key
    workspaceId?: mongoose.Types.ObjectId; // Optional link to workspace
    lastUsed?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>(
    {
        userId: { type: String, required: true, index: true },
        name: { type: String, required: true },
        keyHash: { type: String, required: true, unique: true },
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', index: true },
        lastUsed: Date,
    },
    {
        timestamps: true,
    }
);

const ApiKey: Model<IApiKey> = mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', apiKeySchema);

export default ApiKey;
