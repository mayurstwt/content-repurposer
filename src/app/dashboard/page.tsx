// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import InputForm from '@/components/InputForm';
import JobPoller from '@/components/JobPoller';
import JobCard from '@/components/JobCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoIcon } from 'lucide-react';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  await dbConnect();
  const rawJobs = await Job.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  // Serialize for client components (no _id ObjectId issues)
  const userJobs = rawJobs.map((j: any) => ({
    _id: j._id.toString(),
    inputUrl: j.inputUrl,
    status: j.status,
    error: j.error ?? null,
    outputs: j.outputs ?? null,
    createdAt: j.createdAt?.toISOString?.() ?? new Date().toISOString(),
  }));

  const hasActiveJobs = userJobs.some(
    (j) => j.status === 'pending' || j.status === 'processing'
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Submit a YouTube video to repurpose it into social content.</p>

      {/* Submit Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>New Job</CardTitle>
          <CardDescription>Paste any public YouTube URL below</CardDescription>
        </CardHeader>
        <CardContent>
          <InputForm />
        </CardContent>
      </Card>

      {/* Job List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <JobPoller hasActiveJobs={hasActiveJobs} />

          {userJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <VideoIcon className="w-10 h-10 opacity-30" />
              <p className="font-medium">No jobs yet</p>
              <p className="text-sm">Submit your first YouTube URL above to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}