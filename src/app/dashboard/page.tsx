// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import InputForm from '@/components/InputForm';
import JobPoller from '@/components/JobPoller';
import DashboardControls from '@/components/DashboardControls';
import JobCard from '@/components/JobCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoIcon } from 'lucide-react';

export default async function DashboardPage(props: { searchParams?: Promise<{ q?: string; page?: string; sort?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const searchParams = await props.searchParams;
  const q = searchParams?.q || '';
  const page = parseInt(searchParams?.page || '1', 10);
  const sortParam = searchParams?.sort || 'newest';

  await dbConnect();

  // 1. Build query object
  const query: any = { userId };
  if (q) {
    query.$text = { $search: q };
  }

  // 2. Build sort object
  let sortObj: any = { createdAt: -1 }; // newest
  if (sortParam === 'oldest') sortObj = { createdAt: 1 };
  if (sortParam === 'status') sortObj = { status: 1, createdAt: -1 }; // alphabetical status + newest

  // 3. Pagination limits
  const limit = 10;
  const skip = (page - 1) * limit;

  // 4. Fetch jobs and total count
  const [rawJobs, totalJobs] = await Promise.all([
    Job.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
    Job.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalJobs / limit);

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
          <CardDescription>Paste any public YouTube URL — or press ⌘ Enter to submit</CardDescription>
        </CardHeader>
        <CardContent>
          <InputForm />
        </CardContent>
      </Card>

      {/* Job List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>{totalJobs} job{totalJobs !== 1 ? 's' : ''} total</CardDescription>
        </CardHeader>
        <CardContent>
          <JobPoller hasActiveJobs={hasActiveJobs} />

          {userJobs.length === 0 && !q ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <VideoIcon className="w-10 h-10 opacity-30" />
              <p className="font-medium">No jobs yet</p>
              <p className="text-sm">Paste your first YouTube URL above to get started!</p>
            </div>
          ) : userJobs.length === 0 && q ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <p className="font-medium">No results found</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          ) : (
            <>
              <DashboardControls hasJobs={totalJobs > 0} totalPages={totalPages} />
              <div className="space-y-3">
                {userJobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}