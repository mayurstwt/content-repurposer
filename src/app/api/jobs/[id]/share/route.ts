import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import { nanoid } from 'nanoid';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const { id } = await params;
        const job = await Job.findById(id);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        if (job.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        let shareSlug = job.shareSlug;
        if (!shareSlug) {
            shareSlug = nanoid(10);
            job.shareSlug = shareSlug;
        }

        // Always ensure it's marked as public when getting share link
        job.isPublic = true;
        await job.save();

        return NextResponse.json({ shareSlug });
    } catch (error: any) {
        console.error('Error generating share link:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate link' }, { status: 500 });
    }
}
