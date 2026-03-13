import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceInvite from "@/models/WorkspaceInvite";

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const workspace = await Workspace.findOne({ ownerId: userId }).lean();
    if (!workspace) {
        return NextResponse.json({ error: "Unauthorized or no workspace found" }, { status: 403 });
    }

    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');

    // Expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await WorkspaceInvite.create({
        workspaceId: workspace._id,
        token,
        expiresAt,
    });

    return NextResponse.json({ token: invite.token, expiresAt: invite.expiresAt });
}

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const workspace = await Workspace.findOne({ ownerId: userId }).lean();
    if (!workspace) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const invites = await WorkspaceInvite.find({ workspaceId: workspace._id }).sort({ createdAt: -1 });
    return NextResponse.json(invites);
}
