// src/components/DashboardSorter.tsx
// #18 — Client-side sort control for dashboard jobs
'use client';

import { useState } from 'react';
import JobCard from '@/components/JobCard';
import { JobListSkeleton } from '@/components/JobCardSkeleton';

type SortKey = 'newest' | 'oldest' | 'status';

interface Job {
    _id: string;
    inputUrl: string;
    status: string;
    error?: string;
    outputs?: any;
    createdAt: string;
}

const STATUS_ORDER: Record<string, number> = {
    processing: 0,
    pending: 1,
    completed: 2,
    failed: 3,
};

interface Props {
    jobs: Job[];
    loading?: boolean;
}

export default function DashboardSorter({ jobs, loading }: Props) {
    const [sort, setSort] = useState<SortKey>('newest');

    const sorted = [...jobs].sort((a, b) => {
        if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sort === 'status') return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
        return 0;
    });

    if (loading) return <JobListSkeleton />;

    return (
        <div className="space-y-3">
            {/* Sort controls */}
            <div className="flex items-center gap-2 pb-1">
                <span className="text-xs text-muted-foreground">Sort:</span>
                {(['newest', 'oldest', 'status'] as SortKey[]).map((key) => (
                    <button
                        key={key}
                        onClick={() => setSort(key)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${sort === key
                                ? 'bg-foreground text-background border-foreground'
                                : 'border-border text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {key === 'newest' ? 'Newest first' : key === 'oldest' ? 'Oldest first' : 'By status'}
                    </button>
                ))}
            </div>

            {sorted.map((job) => (
                <JobCard key={job._id} job={job} />
            ))}
        </div>
    );
}
