"use client";

import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserDropdown } from "@/components/UserDropdown";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
];

const privateLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pricing", label: "Pricing" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/settings/team", label: "Team" },
  { href: "/settings/developer", label: "Developer" },
];

export function SiteHeader({ userId }: { userId?: string | null }) {
  const links = userId ? privateLinks : publicLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08111f]/85 backdrop-blur-xl supports-[backdrop-filter]:bg-[#08111f]/72">
      <div className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f97316] via-[#fb923c] to-[#fdba74] shadow-lg shadow-orange-500/20 transition-transform group-hover:scale-[1.03]">
            <Sparkles className="h-5 w-5 text-slate-950" />
          </div>
          <div className="leading-tight">
            <p className="font-semibold tracking-[0.18em] text-white/60 uppercase text-[10px]">Content Engine</p>
            <p className="text-lg font-bold tracking-tight text-white">Repurposer</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/72 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {!userId && (
            <SignInButton mode="modal">
              <button className="rounded-full px-4 py-2 text-sm font-medium text-white/72 transition-colors hover:bg-white/10 hover:text-white">
                Sign in
              </button>
            </SignInButton>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {!userId ? (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="rounded-full bg-white text-slate-950 hover:bg-white/90">
                  Start Free
                </Button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button className="rounded-full bg-white text-slate-950 hover:bg-white/90">Dashboard</Button>
              </Link>
              <UserDropdown />
            </>
          )}

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white md:hidden">
            <Menu className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 md:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80"
            >
              {link.label}
            </Link>
          ))}
          {!userId && (
            <SignInButton mode="modal">
              <button className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80">
                Sign in
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
