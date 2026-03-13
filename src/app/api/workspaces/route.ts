import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import Workspace from "@/models/Workspace";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    // Find workspaces where user is owner OR member
    let workspace = await Workspace.findOne({
        $or: [{ ownerId: userId }, { memberIds: userId }]
    }).lean();

    if (!workspace) {
        // Check if user is an Agency plan owner. If they are, auto-create a workspace.
        const user = await User.findOne({ clerkId: userId }).lean();
        if (user?.plan === "agency") {
            workspace = await Workspace.create({
                name: "My Agency Workspace",
                ownerId: userId,
                memberIds: [],
                plan: "agency"
            });
        } else {
            return NextResponse.json({ error: "No workspace found. Upgrade to Agency to unlock Workspaces." }, { status: 403 });
        }
    }

    return NextResponse.json(workspace);
}

export async function PUT(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { name, branding } = await req.json();
        if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        await dbConnect();
        const workspace = await Workspace.findOneAndUpdate(
            { ownerId: userId },
            { name, branding },
            { new: true }
        ).lean();

        if (!workspace) {
            return NextResponse.json({ error: "Workspace not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json(workspace);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
