import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignUpButton, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ArrowRight, ThumbsUp } from 'lucide-react';
import { PricingCard } from '@/components/PricingCard';
import { TestimonialCard } from '@/components/TestimonialCard';
import Image from 'next/image';

export default async function LandingPage() {
  const { userId } = await auth();

  // If already signed in, go straight to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)] overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-32 px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-12">
        <div className="flex-1 text-center lg:text-left z-10">
          <h1 className="text-6xl md:text-[5.5rem] lg:text-[7rem] font-black tracking-tighter leading-[0.85] uppercase mb-8 text-foreground drop-shadow-sm">
            THE BEST<br />
            <span className="text-accent">TEMPLATE</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
            Paste a YouTube link. Get TikToks, LinkedIn posts, and viral tweets instantly. Stop wasting hours editing.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <SignUpButton mode="modal">
              <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xl font-bold px-10 py-8 shadow-xl hover:scale-105 transition-all">
                Get Started Free
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button size="lg" variant="ghost" className="rounded-full text-xl font-bold px-8 py-8 hover:bg-muted transition-all">
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>

        {/* Floating Mockup Abstract */}
        <div className="flex-1 relative w-full max-w-lg aspect-[4/5] bg-muted rounded-[3rem] border shadow-2xl overflow-hidden flex items-center justify-center p-8 group">
          {/* Decorative abstract cards simulating the app interface */}
          <div className="absolute top-10 right-10 w-48 h-64 bg-background rounded-3xl shadow-xl -rotate-12 group-hover:rotate-0 transition-transform duration-500 ease-out border p-4 flex flex-col gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full" />
            <div className="w-full h-4 bg-muted rounded-full" />
            <div className="w-3/4 h-4 bg-muted rounded-full" />
            <div className="mt-auto w-full h-10 bg-accent/20 rounded-xl" />
          </div>
          <div className="absolute bottom-10 left-10 w-56 h-48 bg-background rounded-3xl shadow-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500 ease-out border p-5 flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1DA1F2]/20" />
              <div className="w-8 h-8 rounded-full bg-[#0077b5]/20" />
            </div>
            <div className="w-full h-20 bg-muted rounded-xl" />
          </div>

          <div className="relative z-10 text-[10rem] font-black text-primary drop-shadow-2xl">
            10x
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="mb-20">
          <div className="w-16 h-1 bg-blue-500 mb-6 rounded-full" />
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
            They say <br /> <span className="text-blue-500">about us</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TestimonialCard
            text="Sed nec rutrum ex. Nullam id mi odio. Suspendisse vulputate dapibus eroi os, ac suscipit metus egestas nec. Duis nec nunc a quam porta bibendum."
            authorName="Daniel Sales"
            authorTitle="Design Director - Lorem Co"
          />
          <TestimonialCard
            text="Nullam dictum ex a augue laoreet condimentum sit amet vel dolor. Cras ef ficitur orci diam, a suscipit ligula lacinia euismod. Duis libero magna, aliquet sit amet vulputate."
            authorName="Sarah Jenkins"
            authorTitle="Content Creator - Viral Inc"
          />
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="mb-20">
          <div className="w-16 h-1 bg-accent mb-6 rounded-full" />
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
            Our <span className="text-accent">price</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pt-10">
          <PricingCard
            title="Free"
            monthlyPrice="0"
            features={["10 Videos per month", "Standard Generation", "Watermarked Sharing", "Basic Support"]}
          />
          <PricingCard
            title="Pro"
            monthlyPrice="19"
            popular={true}
            features={["100 Videos per month", "Priority Generation", "Custom Workspaces", "No Watermarks", "24/7 Support"]}
          />
          <PricingCard
            title="Premium"
            monthlyPrice="39"
            features={["Unlimited Videos", "Agency API Keys", "Custom White-labeling", "Dedicated Account Manager"]}
          />
        </div>
      </section>

      {/* NEWSLETTER CTA BLOCK */}
      <section className="px-4 py-8 max-w-[1400px] mx-auto w-full">
        <div className="bg-primary rounded-[3rem] px-8 py-20 md:p-24 flex flex-col lg:flex-row items-center justify-between gap-16 relative overflow-hidden">

          {/* Center floating icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white shadow-2xl rounded-full flex items-center justify-center text-6xl rotate-12 z-10 hidden lg:flex border-8 border-primary">
            👍
          </div>

          <div className="flex-1 text-primary-foreground max-w-xl z-20">
            <p className="text-sm font-bold tracking-widest uppercase opacity-70 mb-4">Stay up to date</p>
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-none mb-10">
              get our<br />newsletter
            </h2>

            <div className="flex items-center gap-2 border-b-2 border-primary-foreground/30 pb-4 max-w-md">
              <input
                type="email"
                placeholder="you@company.com"
                className="bg-transparent border-none outline-none text-xl w-full placeholder:text-primary-foreground/50 font-medium"
              />
              <button className="w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
                <ArrowRight strokeWidth={3} className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 text-primary-foreground text-left lg:text-right max-w-xl flex flex-col lg:items-end z-20">
            <p className="text-sm font-bold tracking-widest uppercase opacity-70 mb-4">Stay up to date</p>
            <a href="mailto:hello@repurposer.com" className="text-4xl md:text-5xl font-medium tracking-tight hover:opacity-80 transition-opacity">hello@repurposer.com</a>
            <p className="text-4xl md:text-5xl font-medium tracking-tight mt-2 mb-12">+01 (2) 345 67 89</p>

            <div className="text-3xl md:text-4xl font-medium tracking-tight text-left lg:text-right leading-tight">
              New York<br />
              2300 Avenue
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}