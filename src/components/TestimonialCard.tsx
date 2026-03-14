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
        <div className="flex flex-col p-8 md:p-12 rounded-[2.5rem] bg-muted/40 border">
            <Quote className="w-12 h-12 text-blue-500 mb-6" fill="currentColor" />

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 flex-1">
                "{text}"
            </p>

            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center font-bold text-lg">
                    {authorName[0]}
                </div>
                <div>
                    <h4 className="font-bold tracking-tight uppercase text-sm">{authorName}</h4>
                    <p className="text-xs text-muted-foreground">{authorTitle}</p>
                </div>
            </div>
        </div>
    );
}
