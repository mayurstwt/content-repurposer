// src/components/JobCardSkeleton.tsx
// #8 — Animated skeleton loader for job cards
export function JobCardSkeleton() {
    return (
        <div className="border rounded-lg overflow-hidden p-4 animate-pulse">
            <div className="flex items-start gap-3">
                {/* Thumbnail placeholder */}
                <div className="shrink-0 w-[120px] h-[68px] bg-muted rounded" />
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1.5 flex-1">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/3" />
                            <div className="h-3 bg-muted rounded w-1/4" />
                        </div>
                        <div className="h-6 w-20 bg-muted rounded-full shrink-0" />
                    </div>
                    <div className="h-3 bg-muted rounded w-16" />
                </div>
            </div>
        </div>
    );
}

export function JobListSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => <JobCardSkeleton key={i} />)}
        </div>
    );
}
