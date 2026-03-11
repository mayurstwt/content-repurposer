// app/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignUpButton, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Video, BarChart2, Share2, ArrowRight, CheckCircle } from 'lucide-react';

export default async function LandingPage() {
  const { userId } = await auth();

  // If already signed in, go straight to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-background to-muted/30">
        <Badge variant="secondary" className="mb-6 px-4 py-1 text-sm font-medium">
          🚀 Powered by Gemini AI + Deepgram
        </Badge>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl">
          Turn <span className="text-primary">YouTube Videos</span> into
          <br />Viral Social Content
        </h1>

        <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
          Paste any YouTube URL. Get a full transcript, AI-powered analysis, and
          ready-to-post content for TikTok, LinkedIn, Twitter, Instagram &amp; newsletters — in under 2 minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SignUpButton mode="modal">
            <Button size="lg" className="text-base px-8 py-6 gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button size="lg" variant="outline" className="text-base px-8 py-6">
              Sign In
            </Button>
          </SignInButton>
        </div>

        <p className="text-sm text-muted-foreground mt-4">No credit card required</p>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Video, step: '1', title: 'Paste a YouTube URL', desc: 'Drop in any public YouTube video link. Lectures, podcasts, tutorials — anything.' },
              { icon: Zap, step: '2', title: 'AI Does the Work', desc: 'We transcribe the audio and run it through Gemini AI to extract the best moments.' },
              { icon: Share2, step: '3', title: 'Copy & Post', desc: 'Get platform-ready content for TikTok, LinkedIn, Twitter, and more. Just copy and go.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center p-6 rounded-xl bg-background border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">STEP {step}</div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What You Get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              'Full video transcript',
              'Key viral moments with timestamps',
              'TikTok & Instagram Reels scripts',
              'LinkedIn post + carousel outline',
              'Twitter/X thread (ready to post)',
              'Newsletter summary with CTA',
              'Target audience analysis',
              'Tone + virality scoring',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 p-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 px-4 bg-primary text-primary-foreground text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to 10x your content output?</h2>
        <p className="mb-8 text-primary-foreground/80">Join for free. No credit card needed.</p>
        <SignUpButton mode="modal">
          <Button size="lg" variant="secondary" className="text-base px-8 py-6 gap-2">
            Start Repurposing Now <ArrowRight className="w-4 h-4" />
          </Button>
        </SignUpButton>
      </section>
    </div>
  );
}