import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWorkspace extends Document {
    name: string;
    ownerId: string; // Clerk user ID of the agency owner
    memberIds: string[]; // Array of Clerk user IDs for team members
    plan: 'free' | 'pro' | 'agency'; // Inherited from the owner
    branding?: {
        logo?: string;
        primaryColor?: string;
        domain?: string; // Custom white-label domain
    };
    createdAt: Date;
    updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
    {
        name: { type: String, required: true },
        ownerId: { type: String, required: true, index: true },
        memberIds: [{ type: String, index: true }],
        plan: { type: String, enum: ['free', 'pro', 'agency'], default: 'agency' },
        branding: {
            logo: String,
            primaryColor: String,
            domain: { type: String, unique: true, sparse: true, index: true },
        },
    },
    {
        timestamps: true,
    }
);

const Workspace: Model<IWorkspace> = mongoose.models.Workspace || mongoose.model<IWorkspace>('Workspace', workspaceSchema);

export default Workspace;
