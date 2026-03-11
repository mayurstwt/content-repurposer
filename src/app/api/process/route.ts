// src/app/api/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ProcessInputSchema } from "@/lib/schemas";
import { createJob } from "@/lib/jobs";
import { inngest } from "@/inngest/client";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { url } = ProcessInputSchema.parse(body);

    const job = await createJob(userId, url);

    // Trigger Inngest function
    // In POST handler, after creating job:
    await inngest.send({
      name: "video/repurpose",
      data: {
        jobId: job._id.toString(),
        inputUrl: url, // pass URL here so function doesn't query DB again
      },
    });

    return NextResponse.json({ success: true, jobId: job._id.toString() });
  } catch (error: any) {
    console.error("Process API Error:", error);
    return NextResponse.json(
      { error: error.errors?.[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }
}
