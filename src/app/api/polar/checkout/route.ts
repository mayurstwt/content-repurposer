import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Polar } from "@polar-sh/sdk";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const polar = new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN || '' });

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const clerkUser = await currentUser();
        const email = clerkUser?.emailAddresses[0]?.emailAddress;

        const checkout = await polar.checkouts.custom.create({
            productId,
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?upgraded=true`,
            customerEmail: email,
            metadata: { userId },
        });

        return NextResponse.json({ url: checkout.url });
    } catch (error: any) {
        console.error("Polar Checkout Error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
