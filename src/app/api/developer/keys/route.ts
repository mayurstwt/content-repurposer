import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import ApiKey from "@/models/ApiKey";
import User from "@/models/User";
import { hashApiKey } from "@/lib/encryption";
import mongoose from "mongoose";

function generateKey() {
    const prefix = "rp_";
    const keyId = new mongoose.Types.ObjectId().toString();
    const secret = crypto.randomBytes(24).toString("hex");
    return { rawKey: `${prefix}${keyId}_${secret}`, keyId };
}

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const dbUser = await User.findOne({ clerkId: userId });
    if (dbUser?.plan !== "agency") {
        return NextResponse.json({ error: "API access requires the Agency plan." }, { status: 403 });
    }

    try {
        const keys = await ApiKey.find({ userId }).sort({ createdAt: -1 });
        // We never return the hash itself to the frontend as a best practice, but we do need the DB doc,
        // so we format the output carefully.
        const formattedKeys = keys.map((k) => ({
            _id: k._id,
            name: k.name,
            createdAt: k.createdAt,
            lastUsed: k.lastUsed,
        }));
        return NextResponse.json(formattedKeys);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const dbUser = await User.findOne({ clerkId: userId });
    if (dbUser?.plan !== "agency") {
        return NextResponse.json({ error: "API access requires the Agency plan." }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name } = body;
        if (!name?.trim()) {
            return NextResponse.json({ error: "Key name is required" }, { status: 400 });
        }

        const maxKeys = 10;
        const currentCount = await ApiKey.countDocuments({ userId });
        if (currentCount >= maxKeys) {
            return NextResponse.json({ error: `You can only generate up to ${maxKeys} active keys.` }, { status: 400 });
        }

        const { rawKey, keyId } = generateKey();
        const keyHash = await hashApiKey(rawKey);

        const apiKey = await ApiKey.create({
            _id: keyId,
            userId,
            name,
            keyHash,
        });

        return NextResponse.json({
            _id: apiKey._id,
            name: apiKey.name,
            key: rawKey, // <-- The only time the plain text key is ever returned!
            createdAt: apiKey.createdAt,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
