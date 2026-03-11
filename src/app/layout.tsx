// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Layers } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Repurposer — Turn YouTube into Viral Content",
  description:
    "AI-powered tool to repurpose YouTube videos into social content for TikTok, LinkedIn, Twitter and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            inter.className,
            "min-h-screen bg-background antialiased",
          )}
        >
          {/* ── Navbar ── */}
          <header className="sticky top-0 z-50 bg-black text-white border-b border-white/10">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                <Layers className="w-5 h-5" />
                Repurposer
              </Link>

              {/* Center Nav (only on landing for logged-out users) */}
              <Show when="signed-out">
                <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
                  <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
                  <a href="#features" className="hover:text-white transition-colors">Features</a>
                  <a href="#faq" className="hover:text-white transition-colors">Pricing</a>
                </nav>
                <SignUpButton mode="modal">
                  <Button
                    size="sm"
                    className="rounded-full bg-white text-black hover:bg-white/90 font-semibold px-5"
                  >
                    Get Started
                  </Button>
                </SignUpButton>
              </Show>

              {/* Signed-in state */}
              <Show when="signed-in">
                <div className="flex items-center gap-4">
                  <Link href="/dashboard">
                    <Button
                      size="sm"
                      className="rounded-full bg-white text-black hover:bg-white/90 font-semibold px-5"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <UserButton />
                </div>
              </Show>
            </div>
          </header>

          <main>{children}</main>
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}