import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import JobOutputTabs from '@/components/JobOutputTabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    await dbConnect();
    const job = await Job.findById(id).lean();

    if (!job || (!job.isPublic && job.status !== 'completed')) {
        return { title: 'Job Not Found - Content Repurposer' };
    }

    const jobTitle = job.title || 'Video Content';
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://repurposer.app';

    return {
        title: `${jobTitle} | Repurposed by AI`,
        description: 'Check out these AI-generated social media posts and newsletters generated from a YouTube video.',
        openGraph: {
            title: `${jobTitle} | Repurposed by AI`,
            description: 'Check out these AI-generated social media posts and newsletters generated from a YouTube video.',
            url: `${siteUrl}/jobs/${job._id}`,
            siteName: 'Content Repurposer',
            images: [
                {
                    url: `${siteUrl}/api/og?title=${encodeURIComponent(jobTitle)}`, // Optional: If we had a dynamic OG API route
                    width: 1200,
                    height: 630,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${jobTitle} | Repurposed by AI`,
            description: 'AI-generated social media posts from a YouTube video.',
        },
    };
}

export default async function PublicJobPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { userId } = await auth();

    await dbConnect();

    const job = await Job.findById(id).lean();

    if (!job) {
        notFound();
    }

    // Access control: User must be the owner OR the job must be public
    if (job.userId !== userId && !job.isPublic) {
        if (!userId) {
            redirect('/sign-in');
        }
        notFound();
    }

    if (job.status !== 'completed' || !job.outputs) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
                <h1 className="text-2xl font-bold mb-4">Job Not Ready</h1>
                <p className="text-muted-foreground">This job is still processing or has failed.</p>
                <div className="mt-8">
                    <Link href="/dashboard">
                        <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const isOwner = job.userId === userId;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                    </Link>
                </div>

                {isOwner && job.isPublic && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                        Publicly Shared
                    </Badge>
                )}
            </div>

            <div className="mb-6 space-y-2">
                <h1 className="text-3xl font-bold">Repurposed Content</h1>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <span>Source:</span>
                    <a
                        href={job.inputUrl as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-0.5"
                    >
                        {job.inputUrl as string}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>

            <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6">
                    <JobOutputTabs outputs={job.outputs as any} jobId={job._id.toString()} />
                </div>
            </div>

            {!isOwner && (
                <div className="mt-12 pt-8 border-t text-center text-muted-foreground text-sm">
                    <p>Generated with <span className="font-semibold text-foreground">Content Repurposer</span></p>
                    <Link href="/">
                        <Button variant="link" className="mt-2 text-blue-500 font-medium">Create your own viral content →</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
