// app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const fontSans = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans"
});

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
          fontFamily: 'var(--font-sans)',
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
            fontSans.variable,
            "min-h-screen bg-background antialiased",
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(circle_at_top,#fb923c20,transparent_55%),linear-gradient(180deg,#08111f,transparent_60%)]" />
              <SiteHeader userId={userId} />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
