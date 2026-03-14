import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ApiKey from "@/models/ApiKey";
import Job from "@/models/Job";
import { verifyApiKey } from "@/lib/encryption";
import mongoose from "mongoose";

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
        if (!rawKey) {
            return NextResponse.json({ error: "Empty Bearer token." }, { status: 401 });
        }

        const parts = rawKey.split('_');
        if (parts.length !== 3 || parts[0] !== 'rp') {
            return NextResponse.json({ error: "Invalid API Key format." }, { status: 401 });
        }
        const keyId = parts[1];

        if (!mongoose.isValidObjectId(keyId)) {
            return NextResponse.json({ error: "Invalid API Key." }, { status: 401 });
        }

        await dbConnect();
        const apiKeyDoc = await ApiKey.findById(keyId).lean();

        if (!apiKeyDoc) {
            return NextResponse.json({ error: "Invalid API Key." }, { status: 401 });
        }

        const isValid = await verifyApiKey(rawKey, apiKeyDoc.keyHash);
        if (!isValid) {
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
