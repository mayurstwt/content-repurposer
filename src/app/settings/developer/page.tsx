import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import DeveloperKeysClient from "./DeveloperKeysClient";

export default async function DeveloperSettingsPage() {
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
                    <span className="text-4xl">🛠️</span>
                </div>
                <h1 className="text-3xl font-bold">Developer API Access</h1>
                <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    Programmatic API keys allow you to natively integrate the video repurposer engine into your own custom apps, software, and Zapier workflows.
                </p>
                <p className="font-medium bg-muted p-4 rounded-lg inline-block border">
                    API Access requires the <strong className="text-primary">Agency</strong> Plan.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <DeveloperKeysClient />
        </div>
    );
}
