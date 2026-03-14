import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings/billing", label: "Billing" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/95">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:px-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Repurposer</p>
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Turn one long-form video into a full publishing pipeline.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Built for creators, agencies, and operators who need reliable content transformation, fast review loops, and clean client-ready outputs.
          </p>
        </div>

        <div className="grid gap-3 text-sm">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <a href="mailto:hello@repurposer.com" className="text-muted-foreground transition-colors hover:text-foreground">
            hello@repurposer.com
          </a>
        </div>
      </div>
    </footer>
  );
}
