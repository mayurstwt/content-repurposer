import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import { inngest } from '@/inngest/client';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import AuditLog from '@/models/AuditLog';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (rateLimit) {
        const { success, reset } = await rateLimit.limit(userId);
        if (!success) {
            const minutes = Math.ceil(Math.max(0, reset - Date.now()) / 60000);
            logger.warn({ userId, jobId: id }, "Rate limit hit on job retry");
            return NextResponse.json({ error: `Rate limit. Retrying counts towards quota. Try in ${minutes}m.` }, { status: 429 });
        }
    }

    await dbConnect();
    const job = await Job.findOne({ _id: id, userId });
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (job.status !== 'failed') return NextResponse.json({ error: 'Can only retry failed jobs' }, { status: 400 });

    // Reset status
    job.status = 'pending';
    job.error = undefined;
    await job.save();

    // Re-emit Inngest event
    await inngest.send({
        name: "video/repurpose",
        data: {
            jobId: job._id.toString(),
            inputUrl: job.inputUrl,
        },
    });

    await AuditLog.create({
        userId,
        action: 'retry_job',
        resourceType: 'Job',
        resourceId: job._id.toString()
    });
    logger.info({ userId, jobId: job._id.toString() }, "Job retry queued");

    return NextResponse.json({ success: true });
}
