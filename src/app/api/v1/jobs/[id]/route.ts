import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import ApiKey from "@/models/ApiKey";
import Job from "@/models/Job";

function hashKey(key: string) {
    return crypto.createHash("sha256").update(key).digest("hex");
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Missing or invalid authorization header." }, { status: 401 });
        }

        const rawKey = authHeader.split(" ")[1];
        const keyHash = hashKey(rawKey);

        await dbConnect();
        const apiKeyDoc = await ApiKey.findOne({ keyHash }).lean();

        if (!apiKeyDoc) {
            return NextResponse.json({ error: "Invalid API Key." }, { status: 401 });
        }

        ApiKey.updateOne({ _id: apiKeyDoc._id }, { lastUsed: new Date() }).exec();

        const { id } = await params;
        const job = await Job.findById(id).lean();

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        if (job.userId !== apiKeyDoc.userId) {
            return NextResponse.json({ error: "Unauthorized access to this job" }, { status: 403 });
        }

        return NextResponse.json({
            jobId: job._id,
            inputUrl: job.inputUrl,
            status: job.status,
            outputs: job.outputs || null,
            error: job.error || null,
            createdAt: job.createdAt,
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
