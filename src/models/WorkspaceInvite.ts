import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWorkspaceInvite extends Document {
    workspaceId: mongoose.Types.ObjectId;
    token: string;
    createdAt: Date;
    expiresAt: Date;
}

const workspaceInviteSchema = new Schema<IWorkspaceInvite>(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        token: { type: String, required: true, unique: true },
        expiresAt: { type: Date, required: true },
    },
    {
        timestamps: true,
    }
);

// Auto-expire documents after `expiresAt`
workspaceInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const WorkspaceInvite: Model<IWorkspaceInvite> = mongoose.models.WorkspaceInvite || mongoose.model<IWorkspaceInvite>('WorkspaceInvite', workspaceInviteSchema);

export default WorkspaceInvite;
