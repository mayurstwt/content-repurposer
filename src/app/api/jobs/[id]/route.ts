// src/app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const deleted = await Job.findOneAndDelete({ _id: id, userId });
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true });
}
