import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { PLAN_LIMITS } from "@/lib/quota";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import Link from "next/link";
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN || '' });

// Form logic extracted to a client component if interactive, but for a simple "Upgrade" we can use a server action or Link to the API
export default async function BillingPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    await dbConnect();
    const user = await User.findOne({ clerkId: userId }).lean() || { plan: 'free', jobsThisMonth: 0, polarCustomerId: null };
    const currentPlan = user.plan || 'free';
    const limit: number = (PLAN_LIMITS as any)[currentPlan] ?? 3;
    const usage = user.jobsThisMonth || 0;
    const usagePercent = Math.min(100, Math.round((usage / limit) * 100));

    let portalUrl = null;
    if (user.polarCustomerId && process.env.POLAR_ACCESS_TOKEN) {
        try {
            const session = await polar.customerSessions.create({
                customerId: user.polarCustomerId
            });
            portalUrl = session.customerPortalUrl;
        } catch (e) {
            console.error("Failed to generate Polar portal URL", e);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
                <p className="text-muted-foreground mt-2">Manage your subscription and view usage.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Usage</CardTitle>
                    <CardDescription>You are on the <span className="font-semibold text-primary capitalize">{currentPlan}</span> plan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>{usage} videos repurposed</span>
                            <span className="text-muted-foreground">{limit === Infinity ? 'Unlimited' : `${limit} limit`}</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className={`h-full ${usagePercent > 90 ? 'bg-destructive' : 'bg-primary'} transition-all`}
                                style={{ width: `${limit === Infinity ? 0 : usagePercent}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
                {portalUrl && (
                    <CardFooter>
                        <Button variant="outline" className="w-full sm:w-auto" asChild>
                            <a href={portalUrl} target="_blank" rel="noreferrer">Manage Billing & Invoices</a>
                        </Button>
                    </CardFooter>
                )}
            </Card>

            <div className="grid md:grid-cols-3 gap-6 pt-4">
                {/* Free Plan */}
                <Card className={currentPlan === 'free' ? 'border-primary' : ''}>
                    <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>$0 / month</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> 3 jobs per month</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> All 6 core platforms</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Watermarked share links</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant={currentPlan === 'free' ? 'secondary' : 'outline'} className="w-full" disabled>
                            {currentPlan === 'free' ? 'Current Plan' : 'Free'}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Pro Plan */}
                <Card className={`relative ${currentPlan === 'pro' ? 'border-primary shadow-md' : 'border-border'}`}>
                    {currentPlan !== 'pro' && (
                        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Popular
                            </span>
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle>Pro</CardTitle>
                        <CardDescription>$19 / month</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex gap-2 text-foreground font-medium"><Check className="w-4 h-4 text-green-500" /> 30 jobs per month</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> No watermark on shares</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Fast queue processing</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> PDF Exports</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {currentPlan === 'pro' ? (
                            <Button variant="secondary" className="w-full" disabled>Current Plan</Button>
                        ) : (
                            <form action="/api/polar/checkout" method="POST" className="w-full">
                                <input type="hidden" name="productId" value={process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID || ''} />
                                <Button type="submit" className="w-full" variant={currentPlan === 'free' ? 'default' : 'outline'}>
                                    Upgrade to Pro
                                </Button>
                            </form>
                        )}
                    </CardFooter>
                </Card>

                {/* Agency Plan */}
                <Card className={currentPlan === 'agency' ? 'border-primary' : ''}>
                    <CardHeader>
                        <CardTitle>Agency</CardTitle>
                        <CardDescription>$99 / month</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex gap-2 text-foreground font-medium"><Check className="w-4 h-4 text-green-500" /> Unlimited jobs</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> API Access (Coming soon)</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> White-label workspaces</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {currentPlan === 'agency' ? (
                            <Button variant="secondary" className="w-full" disabled>Current Plan</Button>
                        ) : (
                            <form action="/api/polar/checkout" method="POST" className="w-full">
                                <input type="hidden" name="productId" value={process.env.NEXT_PUBLIC_POLAR_AGENCY_PRODUCT_ID || ''} />
                                <Button type="submit" className="w-full" variant="outline">
                                    Upgrade to Agency
                                </Button>
                            </form>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
