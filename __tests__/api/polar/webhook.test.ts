/** @jest-environment node */

import { NextRequest } from "next/server";
import { POST } from "@/app/api/polar/webhook/route";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import dbConnect from "@/lib/db";
import User from "@/models/User";

// Mock dependencies
jest.mock("@polar-sh/sdk/webhooks");
jest.mock("@/lib/db");
jest.mock("@/models/User");
jest.mock("@/lib/logger", () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe("Polar Webhook POST Route", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            POLAR_WEBHOOK_SECRET: "test-secret",
            POLAR_PRO_PRODUCT_ID: "pro-id",
            POLAR_AGENCY_PRODUCT_ID: "agency-id",
        };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("1. Should return 400 if webhook-signature is missing", async () => {
        const req = new NextRequest("http://localhost/api/polar/webhook", {
            method: "POST",
            body: JSON.stringify({}),
        });
        // Deliberately no webhook-signature header

        const res = await POST(req);
        expect(res.status).toBe(400);
        expect(await res.text()).toBe("Missing webhook-signature header");
    });

    it("2. Should upgrade user plan on subscription.created", async () => {
        // 1. Mock a NextRequest with the correct headers
        const req = new NextRequest("http://localhost/api/polar/webhook", {
            method: "POST",
            headers: { "webhook-signature": "valid-signature" },
            body: JSON.stringify({ fake: "data" }),
        });

        // 2. Mock the Polar SDK event parser to return a valid 'subscription.created' event
        (validateEvent as jest.Mock).mockReturnValue({
            type: "subscription.created",
            data: {
                id: "sub_123",
                productId: "pro-id",
                customerId: "cus_123",
                metadata: { userId: "user_clerk_123" },
            },
        });

        // 3. Trigger the route
        const res = await POST(req);

        // 4. Assertions
        expect(dbConnect).toHaveBeenCalled();
        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
            { clerkId: "user_clerk_123" },
            {
                $set: expect.objectContaining({
                    plan: "pro",
                    polarSubscriptionId: "sub_123",
                    polarCustomerId: "cus_123",
                }),
            },
            { upsert: true }
        );
        expect(res.status).toBe(200);
        expect(await res.text()).toBe("ok");
    });

    it("3. Should downgrade user plan to free on subscription.canceled", async () => {
        const req = new NextRequest("http://localhost/api/polar/webhook", {
            method: "POST",
            headers: { "webhook-signature": "valid-signature" },
            body: JSON.stringify({ fake: "data" }),
        });

        (validateEvent as jest.Mock).mockReturnValue({
            type: "subscription.canceled",
            data: {
                metadata: { userId: "user_clerk_123" },
            },
        });

        const res = await POST(req);

        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
            { clerkId: "user_clerk_123" },
            {
                $set: expect.objectContaining({
                    plan: "free",
                }),
            }
        );
        expect(res.status).toBe(200);
    });

    it("4. Should return 500 if POLAR_WEBHOOK_SECRET is missing", async () => {
        delete process.env.POLAR_WEBHOOK_SECRET;
        const req = new NextRequest("http://localhost/api/polar/webhook", {
            method: "POST",
            headers: { "webhook-signature": "valid-signature" },
            body: JSON.stringify({}),
        });

        const res = await POST(req);
        expect(res.status).toBe(500);
        expect(await res.text()).toBe("Server configuration error");
    });

    it("5. Should return 400 on signature validation failure", async () => {
        const req = new NextRequest("http://localhost/api/polar/webhook", {
            method: "POST",
            headers: { "webhook-signature": "invalid-signature" },
            body: JSON.stringify({ fake: "data" }),
        });

        (validateEvent as jest.Mock).mockImplementation(() => {
            throw new Error("Webhook signature verification failed.");
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        expect(await res.text()).toBe("Webhook payload validation failed");
    });

    it("6. Should handle subscription.updated to upgrade user plan", async () => {
        const req = new NextRequest("http://localhost/api/polar/webhook", {
            method: "POST",
            headers: { "webhook-signature": "valid-signature" },
            body: JSON.stringify({ fake: "data" }),
        });

        (validateEvent as jest.Mock).mockReturnValue({
            type: "subscription.updated",
            data: {
                id: "sub_456",
                productId: "agency-id",
                customerId: "cus_456",
                metadata: { userId: "user_clerk_456" },
            },
        });

        const res = await POST(req);

        expect(dbConnect).toHaveBeenCalled();
        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
            { clerkId: "user_clerk_456" },
            {
                $set: expect.objectContaining({
                    plan: "agency",
                    polarSubscriptionId: "sub_456",
                    polarCustomerId: "cus_456",
                }),
            },
            { upsert: true }
        );
        expect(res.status).toBe(200);
    });
});
