import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";

export function PricingCard({
    title,
    monthlyPrice,
    popular = false,
    features,
}: {
    title: string;
    monthlyPrice: string | number;
    popular?: boolean;
    features: string[];
}) {
    return (
        <div className={`relative flex flex-col p-10 rounded-[3rem] ${popular ? 'bg-muted shadow-xl border border-primary/20 scale-105 z-10' : 'bg-muted/50 border'} transition-transform hover:scale-[1.02]`}>
            {popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 py-2 border rounded-full shadow-sm flex items-center gap-2 text-sm font-bold">
                    🤑 Most popular
                </div>
            )}

            <h3 className="text-2xl font-semibold mb-2">{title}</h3>
            <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-extrabold tracking-tighter">${monthlyPrice}</span>
                <span className="text-muted-foreground font-medium">/mo</span>
            </div>

            <SignUpButton mode="modal">
                <Button className="w-full rounded-full py-6 text-lg font-bold mb-10 hover:scale-105 transition-transform">
                    Buy {title}
                </Button>
            </SignUpButton>

            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                {features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        {feat}
                    </li>
                ))}
            </ul>
        </div>
    );
}
