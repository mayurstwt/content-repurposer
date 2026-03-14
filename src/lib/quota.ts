import dbConnect from "./db";
import User from "@/models/User";
import Workspace from '@/models/Workspace';

export const PLAN_LIMITS = { free: 10, pro: 100, agency: Infinity };

export async function checkJobQuota(userId: string): Promise<{ allowed: boolean; reason?: string; limit?: number; plan?: string }> {
    await dbConnect();

    // Upsert user if they don't exist in DB yet
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
        user = await User.create({ clerkId: userId, plan: 'free', jobsThisMonth: 0 });
    }

    let plan = user?.plan || 'free';
    let jobsThisMonth = user?.jobsThisMonth || 0;

    // Workspace Inheritance Support: 
    // If the user belongs to an Agency team workspace, they inherit the "unlimited" tier
    const workspace = await Workspace.findOne({ memberIds: userId }).lean();
    if (workspace && workspace.plan === 'agency') {
        plan = 'agency';
        // Members of an agency plan essentially bypass the local jobsThisMonth limits.
    }

    if (plan === 'agency') {
        return { allowed: true, limit: Infinity, plan: 'agency' };
    }

    const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

    if (jobsThisMonth >= limit) {
        return { allowed: false, reason: `You've reached your limit of ${limit} jobs for the ${plan.toUpperCase()} plan. Please upgrade to continue.`, limit, plan };
    }

    return { allowed: true, limit, plan };
}
