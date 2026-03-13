// app/api/polar/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("webhook-signature") ?? req.headers.get("polar-signature") ?? "";
        const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

        if (!webhookSecret) {
            logger.error("POLAR_WEBHOOK_SECRET is not set in environment");
            return new NextResponse("Server configuration error", { status: 500 });
        }

        // Polar SDK wants the payload parsed as JSON internally, but validateEvent expects string
        const event = validateEvent(rawBody, {
            "webhook-signature": signature
        }, webhookSecret);

        await dbConnect();

        // Handle Subscription Creation
        if (event.type === "subscription.created" || event.type === "subscription.updated") {
            const payload = event.data as any; // Cast to bypass strict SDK types
            const metadata = payload.metadata as Record<string, any>;
            const userId = metadata?.userId;
            const productId = payload.productId as string;
            const customerId = payload.customerId as string;
            // @ts-ignore - The Polar SDK payload types are currently flawed for ID on Subscription Updates
            const subscriptionId = payload.id as string;

            if (!userId) {
                logger.warn({ eventId: event.id }, "Received Polar webhook without userId in metadata");
                return new NextResponse("ok"); // Ignore it so Polar doesn't retry
            }

            // Map Polar productId back to our database plan strings
            const planMap: Record<string, string> = {
                [process.env.POLAR_PRO_PRODUCT_ID || ""]: "pro",
                [process.env.POLAR_AGENCY_PRODUCT_ID || ""]: "agency",
            };
            const plan = planMap[productId] || "free";

            // Update user in database
            await User.findOneAndUpdate(
                { clerkId: userId },
                {
                    $set: {
                        plan,
                        polarSubscriptionId: subscriptionId,
                        polarCustomerId: customerId,
                        planUpdatedAt: new Date()
                    }
                },
                { upsert: true }
            );

            logger.info({ userId, plan }, "User subscription upgraded via Polar webhook");
        }

        // Handle Subscription Cancellation
        if (event.type === "subscription.canceled" || event.type === "subscription.revoked") {
            const payload = event.data as any;
            const metadata = payload.metadata as Record<string, any>;
            const userId = metadata?.userId;

            if (userId) {
                await User.findOneAndUpdate(
                    { clerkId: userId },
                    {
                        $set: { plan: "free", planUpdatedAt: new Date() }
                        // Intentionally keeping the polarCustomerId and polarSubscriptionId for record
                    }
                );
                logger.info({ userId }, "User subscription downgraded to free via Polar webhook");
            }
        }

        return new NextResponse("ok");

    } catch (error: any) {
        logger.error({ error: error.message }, "Polar webhook error");
        // Only return 400 if it's a signature validation error, so we don't leak logic details
        return new NextResponse("Webhook payload validation failed", { status: 400 });
    }
}
