import { Quote } from "lucide-react";

export function TestimonialCard({
    text,
    authorName,
    authorTitle,
}: {
    text: string;
    authorName: string;
    authorTitle: string;
}) {
    return (
        <div className="flex h-full flex-col rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-sm backdrop-blur-sm md:p-10">
            <Quote className="mb-6 h-12 w-12 text-primary" fill="currentColor" />

            <p className="mb-10 flex-1 text-lg leading-relaxed text-muted-foreground md:text-xl">
                "{text}"
            </p>

            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/15 font-bold text-lg text-primary">
                    {authorName[0]}
                </div>
                <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight">{authorName}</h4>
                    <p className="text-xs text-muted-foreground">{authorTitle}</p>
                </div>
            </div>
        </div>
    );
}
