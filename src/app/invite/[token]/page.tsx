import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import WorkspaceInvite from "@/models/WorkspaceInvite";
import Workspace from "@/models/Workspace";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { userId } = await auth();
    if (!userId) {
        // If not signed in, redirect them to sign-in, with a post-login redirect back here
        redirect("/sign-in");
    }

    const { token } = await params;

    await dbConnect();
    const invite = await WorkspaceInvite.findOne({ token }).populate("workspaceId");

    if (!invite) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
                <h1 className="text-2xl font-bold">Invalid or Expired Invite</h1>
                <p className="text-muted-foreground">This invitation link is no longer valid. Please ask your team administrator for a new one.</p>
                <Link href="/"><Button>Return Home</Button></Link>
            </div>
        );
    }

    // Check if it's expired
    if (new Date() > new Date(invite.expiresAt)) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
                <h1 className="text-2xl font-bold">Invite Expired</h1>
                <p className="text-muted-foreground">This invitation link has expired. Please ask your team administrator for a new one.</p>
                <Link href="/"><Button>Return Home</Button></Link>
            </div>
        );
    }

    const workspace = invite.workspaceId as any;

    // If the user happens to strangely invite themselves
    if (workspace.ownerId === userId) {
        redirect("/dashboard");
    }

    // Check if user is already a member
    if (workspace.memberIds.includes(userId)) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-blue-500 mx-auto" />
                <h1 className="text-2xl font-bold">You're already in!</h1>
                <p className="text-muted-foreground">You are already a member of {workspace.name}.</p>
                <Link href="/dashboard"><Button>Go to Dashboard</Button></Link>
            </div>
        );
    }

    // Process acceptance automatically as it's a secure token link
    await Workspace.updateOne({ _id: workspace._id }, { $addToSet: { memberIds: userId } });

    // Optionally delete the invite so it's 1-time use
    // await WorkspaceInvite.deleteOne({ _id: invite._id });

    return (
        <div className="max-w-md mx-auto mt-20 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h1 className="text-3xl font-bold">Welcome to the Team!</h1>
            <p className="text-muted-foreground">You've successfully joined <strong>{workspace.name}</strong>. You now have access to their Agency plan features and shared API quotas.</p>

            <div className="pt-6">
                <Link href="/dashboard">
                    <Button size="lg" className="w-full">Let's Go</Button>
                </Link>
            </div>
        </div>
    );
}
