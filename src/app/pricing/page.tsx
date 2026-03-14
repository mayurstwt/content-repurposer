import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PricingSection } from "@/components/PricingSection";
import { Button } from "@/components/ui/button";

export default async function PricingPage() {
  const { userId } = await auth();

  return (
    <div className="pb-16">
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Transparent pricing
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Choose the plan that matches your content operation.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Start with single-video validation, move into production workflows, and scale into teams and API-driven publishing without switching tools.
          </p>
          <div className="flex flex-wrap gap-3">
            {userId ? (
              <Button asChild className="rounded-full px-6">
                <Link href="/dashboard">
                  Open Dashboard
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild className="rounded-full px-6">
                <Link href="/sign-up">Start Free</Link>
              </Button>
            )}
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link href={userId ? "/settings/billing" : "/pricing"}>Compare billing features</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-xl backdrop-blur">
          <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-5">
            <p className="text-sm font-semibold text-foreground">Every plan includes</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="flex gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Structured outputs</p>
                  <p className="text-sm text-muted-foreground">TikTok, Reels, Shorts, LinkedIn, threads, and newsletter summaries.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Production-safe workflow</p>
                  <p className="text-sm text-muted-foreground">Rate limiting, quota checks, retry support, and background processing built in.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Users className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Upgrade path</p>
                  <p className="text-sm text-muted-foreground">Grow from personal use into team collaboration and developer access without migration.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-[#08111f] p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">Best fit</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium">Free</p>
                <p className="mt-1 text-sm text-white/70">Creators validating the workflow or testing short campaigns.</p>
              </div>
              <div className="rounded-2xl border border-orange-400/30 bg-orange-400/10 p-4">
                <p className="font-medium">Pro</p>
                <p className="mt-1 text-sm text-white/70">Weekly publishers, consultants, and operators who need volume and polish.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium">Agency</p>
                <p className="mt-1 text-sm text-white/70">Teams running shared workspaces, client delivery, or API-led automation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingSection
        eyebrow="Compare plans"
        title="Simple tiers, clear operational boundaries"
        description="The pricing structure is designed around how content teams actually scale: first proving ROI, then increasing throughput, then introducing team and API workflows."
      />
    </div>
  );
}
