import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
    userId: string;
    action: string;
    resourceType: 'Job' | 'User' | 'Transcript' | 'Webhook';
    resourceId?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
    {
        userId: { type: String, required: true, index: true },
        action: { type: String, required: true },
        resourceType: { type: String, required: true, enum: ['Job', 'User', 'Transcript', 'Webhook'] },
        resourceId: { type: String, index: true },
        metadata: Schema.Types.Mixed,
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Audit logs are immutable
    }
);

// TTL index to automatically delete audit logs after 90 days (optional but good practice)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
