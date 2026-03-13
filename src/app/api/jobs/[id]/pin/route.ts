import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import { logger } from '@/lib/logger';
import AuditLog from '@/models/AuditLog';
import { z } from 'zod';

const PinUpdateSchema = z.object({
    pinned: z.boolean().optional(),
    isPublic: z.boolean().optional(),
}).refine(data => data.pinned !== undefined || data.isPublic !== undefined, {
    message: "At least one of 'pinned' or 'isPublic' must be provided."
});

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { pinned, isPublic } = PinUpdateSchema.parse(body);

        const updateData: any = {};
        if (pinned !== undefined) updateData.pinned = Boolean(pinned);
        if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);

        await dbConnect();
        const job = await Job.findOneAndUpdate(
            { _id: id, userId },
            { $set: updateData },
            { new: true }
        );

        if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        await AuditLog.create({
            userId,
            action: 'update_job_status',
            resourceType: 'Job',
            resourceId: job._id.toString(),
            metadata: updateData
        });
        logger.info({ userId, jobId: job._id.toString(), updates: updateData }, "Job status updated");

        return NextResponse.json({ success: true, pinned: job.pinned, isPublic: job.isPublic });
    } catch (err: any) {
        logger.error({ userId, jobId: id, error: err.message }, "Error updating job status");
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
}
