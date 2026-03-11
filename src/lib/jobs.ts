import dbConnect from './db';
import Job, { IJob } from '@/models/Job';

export async function createJob(userId: string, inputUrl: string): Promise<IJob> {
  await dbConnect();
  const job = await Job.create({
    userId,
    inputUrl,
    status: 'pending',
  });
  return job;
}

export async function getJobById(id: string): Promise<IJob | null> {
  await dbConnect();
  return Job.findById(id);
}

export async function updateJob(id: string, updates: Partial<IJob>): Promise<IJob | null> {
  await dbConnect();
  return Job.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}