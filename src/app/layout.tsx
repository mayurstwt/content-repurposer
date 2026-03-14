// app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  ClerkProvider,
  SignUpButton,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserDropdown } from "@/components/UserDropdown";
import { Layers } from "lucide-react";

const fontSans = Plus_Jakarta_Sans({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Repurposer — Turn YouTube into Viral Content",
  description:
    "AI-powered tool to repurpose YouTube videos into social content for TikTok, LinkedIn, Twitter and more.",
  openGraph: {
    title: "Repurposer — Turn YouTube into Viral Content",
    description:
      "Paste a YouTube URL. Get TikTok scripts, LinkedIn posts, Twitter threads and newsletters in under 2 minutes.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Repurposer – AI Content Repurposing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Repurposer — Turn YouTube into Viral Content",
    description:
      "AI-powered content repurposing. One YouTube video → 6 platforms of content.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  return (
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: '#f97316',
        },
        elements: {
          card: "bg-background shadow-2xl border border-border rounded-xl",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            fontSans.className,
            "min-h-screen bg-background antialiased",
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* ── Navbar ── */}
            <header className="sticky top-0 z-50 bg-[#0f172a] text-[#f8fafc] border-b border-[#1e293b]">
              <div className="container mx-auto px-6 h-[72px] flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-[#0f172a] text-lg font-black">C</span>
                  </div>
                  Repurposer
                </Link>

                {/* Signed-out */}
                {!userId && (
                  <div className="flex items-center gap-6">
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80">
                      <a href="#demo" className="hover:text-white transition-colors">View demo</a>
                      <a href="#sales" className="hover:text-white transition-colors">Contact sales</a>
                      <SignInButton mode="modal">
                        <button className="hover:text-white transition-colors">Sign in</button>
                      </SignInButton>
                    </nav>

                    <div className="flex items-center gap-3">
                      <ThemeToggle />
                      <SignUpButton mode="modal">
                        <Button size="sm" className="rounded-md bg-white text-[#0f172a] hover:bg-white/90 font-semibold px-4 py-2 h-auto">
                          Start free trial
                        </Button>
                      </SignUpButton>
                    </div>
                  </div>
                )}

                {/* Signed-in */}
                {userId && (
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/dashboard">
                      <Button size="sm" className="rounded-md bg-white text-[#0f172a] hover:bg-white/90 font-semibold px-4 py-2 h-auto">
                        Dashboard
                      </Button>
                    </Link>
                    <UserDropdown />
                  </div>
                )}
              </div>
            </header>

            <main>{children}</main>
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}