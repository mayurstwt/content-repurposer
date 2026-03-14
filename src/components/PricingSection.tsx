import { PricingCard } from "@/components/PricingCard";

export function PricingSection({
  title = "Plans built for solo creators and content teams",
  eyebrow = "Pricing",
  description = "Start free, scale into faster queues, client sharing, team workspaces, and API-driven repurposing when you need it.",
}: {
  title?: string;
  eyebrow?: string;
  description?: string;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-12 max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
        <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{title}</h2>
        <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <PricingCard
          title="Free"
          monthlyPrice="0"
          ctaLabel="Start Free"
          features={["10 videos per month", "Core platform outputs", "Watermarked public sharing", "Basic support"]}
        />
        <PricingCard
          title="Pro"
          monthlyPrice="19"
          popular={true}
          ctaLabel="Go Pro"
          features={["100 videos per month", "Priority generation queue", "Clean share pages", "Advanced customization controls", "PDF exports"]}
        />
        <PricingCard
          title="Agency"
          monthlyPrice="99"
          ctaLabel="Scale With Agency"
          features={["Unlimited usage", "Team workspaces", "Developer API keys", "White-label sharing", "Higher-throughput operations"]}
        />
      </div>
    </section>
  );
}
