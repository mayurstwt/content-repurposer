import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";

export function PricingCard({
    title,
    monthlyPrice,
    popular = false,
    ctaLabel,
    features,
}: {
    title: string;
    monthlyPrice: string | number;
    popular?: boolean;
    ctaLabel?: string;
    features: string[];
}) {
    return (
        <div className={`relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${popular ? 'border-primary/30 bg-gradient-to-b from-primary/[0.08] via-card to-card shadow-orange-500/10' : 'bg-card/80 backdrop-blur'}`}>
            {popular && (
                <div className="absolute right-6 top-6 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Most popular
                </div>
            )}

            <div className="mb-8">
                <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    {title === "Free" ? "Validate demand and test the workflow." : title === "Pro" ? "For operators shipping content every week." : "For teams, clients, and automation-heavy workflows."}
                </p>
            </div>
            <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tighter">${monthlyPrice}</span>
                <span className="text-muted-foreground font-medium">/mo</span>
            </div>

            <SignUpButton mode="modal">
                <Button className={`mb-8 h-12 w-full rounded-full text-base font-semibold ${popular ? '' : 'bg-foreground text-background hover:bg-foreground/90'}`}>
                    {ctaLabel || `Choose ${title}`}
                </Button>
            </SignUpButton>

            <ul className="mt-auto space-y-4 text-sm font-medium text-muted-foreground">
                {features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        {feat}
                    </li>
                ))}
            </ul>
        </div>
    );
}
