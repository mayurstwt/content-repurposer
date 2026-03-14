import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignUpButton, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock3, FolderKanban, Sparkles, Workflow } from 'lucide-react';
import { PricingSection } from '@/components/PricingSection';
import { TestimonialCard } from '@/components/TestimonialCard';
import { Button } from '@/components/ui/button';

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="overflow-hidden pb-12">
      <section className="mx-auto grid w-full max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pt-24">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI content repurposing
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Turn one YouTube link into a week of publish-ready content.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Generate TikToks, Reels, Shorts, LinkedIn posts, Twitter threads, and newsletter summaries from a single video without stitching together tools.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
            <SignUpButton mode="modal">
              <Button size="lg" className="h-12 rounded-full px-7 text-base font-semibold shadow-lg shadow-orange-500/20">
                Get Started Free
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button size="lg" variant="outline" className="h-12 rounded-full px-7 text-base font-semibold">
                Sign In
              </Button>
            </SignInButton>
            <Button asChild size="lg" variant="ghost" className="h-12 rounded-full px-5 text-base font-semibold">
              <Link href="/pricing">
                View Pricing
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Outputs</p>
              <p className="mt-3 text-3xl font-semibold">6</p>
              <p className="mt-2 text-sm text-muted-foreground">Platform-specific formats generated from one source asset.</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Typical flow</p>
              <p className="mt-3 text-3xl font-semibold">~2 min</p>
              <p className="mt-2 text-sm text-muted-foreground">Background processing with status polling and retry support.</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Scale mode</p>
              <p className="mt-3 text-3xl font-semibold">API + Team</p>
              <p className="mt-2 text-sm text-muted-foreground">Move from solo operation to agency workflow without replatforming.</p>
            </div>
          </div>
        </div>

        <div className="relative rounded-[2rem] border border-white/10 bg-[#08111f] p-6 text-white shadow-[0_40px_120px_-60px_rgba(8,17,31,0.9)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Workflow</p>
              <div className="mt-6 space-y-4">
                {[
                  { icon: Clock3, title: "Paste source video", text: "Drop one or many YouTube URLs into the dashboard." },
                  { icon: Workflow, title: "Run AI pipeline", text: "Transcription, analysis, and platform formatting happen in the background." },
                  { icon: FolderKanban, title: "Review and publish", text: "Share outputs, export to PDF, or hand off to clients and teammates." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <item.icon className="mt-0.5 h-5 w-5 text-orange-300" />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-white/65">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/8 to-transparent p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Preview</p>
                  <h2 className="mt-2 text-2xl font-semibold">Reliable content pipeline</h2>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Live-ready
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">How to repurpose long-form interviews</span>
                    <span className="rounded-full bg-amber-300/15 px-2 py-1 text-xs text-amber-100">Processing</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-orange-400 to-cyan-300" />
                  </div>
                  <p className="mt-3 text-xs text-white/55">Transcript extraction, analysis, and output generation in progress.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">TikTok Hook</p>
                    <p className="mt-3 text-sm leading-6 text-white/80">"This one editing decision doubled our retention in 48 hours."</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">LinkedIn Angle</p>
                    <p className="mt-3 text-sm leading-6 text-white/80">Break the episode into one insight, one operator takeaway, and one repeatable framework.</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex flex-wrap gap-2">
                    {["Thread", "Newsletter", "Reel caption", "CTA"].map((item) => (
                      <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-sm text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    All outputs saved to the dashboard and ready for sharing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Trusted by operators</p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">A UI designed for repeatable publishing, not novelty screenshots.</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TestimonialCard
            text="We stopped rewriting the same episode into five formats manually. The handoff into our publishing workflow is dramatically cleaner."
            authorName="Daniel Sales"
            authorTitle="Design Director - Lorem Co"
          />
          <TestimonialCard
            text="The structure matters: hooks, captions, threads, and newsletter summaries all come out in a form our team can actually review fast."
            authorName="Sarah Jenkins"
            authorTitle="Content Creator - Viral Inc"
          />
        </div>
      </section>

      <PricingSection />

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-gradient-to-r from-primary to-orange-400 px-6 py-12 text-primary-foreground shadow-2xl shadow-orange-500/20 sm:px-10 lg:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">Ready to ship faster</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Build a cleaner content operation around one reliable workflow.
              </h2>
              <p className="mt-4 text-base leading-8 text-primary-foreground/85">
                Start with free usage, upgrade when volume demands it, and keep the same dashboard, outputs, and sharing model as your process matures.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <SignUpButton mode="modal">
                <Button size="lg" className="rounded-full bg-white px-7 text-slate-950 hover:bg-white/90">
                  Start Free
                </Button>
              </SignUpButton>
              <Button asChild size="lg" variant="secondary" className="rounded-full border border-white/20 bg-white/10 px-7 text-white hover:bg-white/20">
                <Link href="/pricing">Compare Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
