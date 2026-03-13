import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import ApiKey from "@/models/ApiKey";
import { ProcessInputSchema } from "@/lib/schemas";
import { createJob } from "@/lib/jobs";
import { inngest } from "@/inngest/client";
import { logger } from "@/lib/logger";
import User from "@/models/User";

function hashKey(key: string) {
    return crypto.createHash("sha256").update(key).digest("hex");
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Missing or invalid authorization header. Please provide a Bearer token." }, { status: 401 });
        }

        const rawKey = authHeader.split(" ")[1];
        if (!rawKey) {
            return NextResponse.json({ error: "Empty Bearer token." }, { status: 401 });
        }

        const keyHash = hashKey(rawKey);

        await dbConnect();
        const apiKeyDoc = await ApiKey.findOne({ keyHash });

        if (!apiKeyDoc) {
            return NextResponse.json({ error: "Invalid API Key." }, { status: 401 });
        }

        // Update last used asynchronously
        ApiKey.updateOne({ _id: apiKeyDoc._id }, { lastUsed: new Date() }).exec();

        // Ensure the user actually still has an Agency plan
        const user = await User.findOne({ clerkId: apiKeyDoc.userId }).lean();
        if (!user || user.plan !== "agency") {
            return NextResponse.json({ error: "Your API Key is valid, but an active Agency Plan subscription is required to use this endpoint." }, { status: 403 });
        }

        const body = await req.json();
        // Re-use the exact same Zod schema that powers the UI for consistent validation
        const parsed = ProcessInputSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request payload", details: parsed.error.issues }, { status: 400 });
        }

        const { url, tone, audience, webhookUrl } = parsed.data;
        const urls = url.split('\n').map(u => u.trim()).filter(Boolean);

        // Limit API batch size to 10 max
        if (urls.length > 10) {
            return NextResponse.json({ error: "Batch processing via API is limited to a maximum of 10 URLs per request." }, { status: 400 });
        }

        // Create jobs synchronously in the DB
        const jobs = await Promise.all(
            urls.map(u => createJob(apiKeyDoc.userId, u, tone, audience, webhookUrl || undefined))
        );

        // Trigger Inngest processing asynchronously
        await inngest.send(
            jobs.map(job => ({
                name: "video/repurpose",
                data: {
                    jobId: job._id.toString(),
                    inputUrl: job.inputUrl,
                },
            }))
        );

        logger.info({ userId: apiKeyDoc.userId, keyId: apiKeyDoc._id, jobCount: jobs.length }, "API V1 Repurpose triggered");

        return NextResponse.json({
            success: true,
            data: jobs.map(j => ({
                jobId: j._id,
                status: j.status,
                inputUrl: j.inputUrl,
            })),
            message: "Jobs successfully queued. We will POST the final contents to your webhookUrl when completed.",
        }, { status: 202 });

    } catch (error: any) {
        logger.error({ error: error.message }, "API V1 process error");
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
