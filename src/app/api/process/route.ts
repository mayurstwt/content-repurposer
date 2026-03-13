// src/app/api/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ProcessInputSchema } from "@/lib/schemas";
import { createJob } from "@/lib/jobs";
import { inngest } from "@/inngest/client";
import { rateLimit } from "@/lib/rate-limit";
import { checkJobQuota } from "@/lib/quota";
import { logger } from "@/lib/logger";
import AuditLog from "@/models/AuditLog";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limiting (5 requests per hour)
  if (rateLimit) {
    const { success, reset } = await rateLimit.limit(userId);
    if (!success) {
      const msBeforeReset = Math.max(0, reset - Date.now());
      const minutes = Math.ceil(msBeforeReset / 60000);
      logger.warn({ userId, minutes }, "Rate limit exceeded for user");
      return NextResponse.json(
        { error: `Rate limit exceeded. Please try again in ${minutes} minutes.` },
        { status: 429 }
      );
    }
  }

  try {
    const body = await req.json();
    const { url, tone, audience, webhookUrl } = ProcessInputSchema.parse(body);

    const urls = url.split('\n').map(u => u.trim()).filter(Boolean);

    // Check Polar Quota BEFORE creating jobs
    const quota = await checkJobQuota(userId);
    if (!quota.allowed) {
      logger.warn({ userId, plan: quota.plan, limit: quota.limit }, "User exceeded Polar quota");
      return NextResponse.json(
        {
          error: quota.reason,
          code: "quota_exceeded",
          plan: quota.plan,
          limit: quota.limit
        },
        { status: 402 }
      );
    }

    const jobs = await Promise.all(
      urls.map(u => createJob(userId, u, tone, audience, webhookUrl || undefined))
    );

    // Trigger Inngest functions
    await inngest.send(
      jobs.map(job => ({
        name: "video/repurpose",
        data: {
          jobId: job._id.toString(),
          inputUrl: job.inputUrl,
        },
      }))
    );

    // Write Audit Log
    await AuditLog.create({
      userId,
      action: 'process_batch',
      resourceType: 'User',
      metadata: { jobCount: jobs.length, urls }
    });

    logger.info({ userId, jobCount: jobs.length }, "Dispatched new job batch");
    return NextResponse.json({ success: true, count: jobs.length });
  } catch (error: any) {
    logger.error({ userId, error: error.message }, "Process API Error");
    return NextResponse.json(
      { error: error.errors?.[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }
}
