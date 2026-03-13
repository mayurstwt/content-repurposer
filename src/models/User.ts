import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    clerkId: string;
    email?: string;
    plan: 'free' | 'pro' | 'agency';
    polarSubscriptionId?: string;
    polarCustomerId?: string;
    jobsThisMonth: number;
    planUpdatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        clerkId: { type: String, required: true, unique: true, index: true },
        email: { type: String },
        plan: {
            type: String,
            enum: ['free', 'pro', 'agency'],
            default: 'free',
        },
        polarSubscriptionId: { type: String, index: true, sparse: true },
        polarCustomerId: { type: String, index: true, sparse: true },
        jobsThisMonth: { type: Number, default: 0 },
        planUpdatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
