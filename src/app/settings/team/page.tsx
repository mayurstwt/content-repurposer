import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import TeamClient from "./TeamClient";

export default async function TeamSettingsPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect("/sign-in");
    }

    await dbConnect();
    const user = await User.findOne({ clerkId: userId }).lean();

    if (!user || user.plan !== "agency") {
        // Graceful fallback for non-agency users
        return (
            <div className="max-w-3xl mx-auto space-y-6 pt-12 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                    <span className="text-4xl">🏢</span>
                </div>
                <h1 className="text-3xl font-bold">Team Workspaces</h1>
                <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    Unlock team collaboration. Invite unlimited colleagues to share your agency limits, jobs, and API keys.
                </p>
                <p className="font-medium bg-muted p-4 rounded-lg inline-block border">
                    Team Workspaces require the <strong className="text-primary">Agency</strong> Plan.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <TeamClient />
        </div>
    );
}
