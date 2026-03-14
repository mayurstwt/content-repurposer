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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-primary">Workspace</p>
            <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Transform YouTube videos into ready-to-publish social posts, review outputs, and keep an auditable history of every generation.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Jobs</p>
              <p className="mt-2 text-2xl font-semibold">{totalJobs}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Status</p>
              <p className="mt-2 text-2xl font-semibold">{hasActiveJobs ? 'Live' : 'Idle'}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Search</p>
              <p className="mt-2 text-2xl font-semibold">{q ? 'Filtered' : 'All'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Form */}
      <Card className="mb-10 overflow-hidden border-primary/10 shadow-xl">
        <CardHeader className="border-b bg-muted/30 pb-6">
          <CardTitle className="text-xl">Create New Content</CardTitle>
          <CardDescription>Drop your YouTube video link below to get started. Press ⌘ Enter to submit quickly.</CardDescription>
        </CardHeader>
        <CardContent>
          <InputForm />
        </CardContent>
      </Card>

      {/* Job List */}
      <Card className="shadow-sm">
        <CardHeader className="mb-4 border-b bg-muted/10 pb-4">
          <CardTitle className="text-lg">Recent Generations</CardTitle>
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
