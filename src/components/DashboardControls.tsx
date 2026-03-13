'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function DashboardControls({
    hasJobs,
    totalPages
}: {
    hasJobs: boolean,
    totalPages: number
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentQ = searchParams.get('q') || '';
    const currentSort = searchParams.get('sort') || 'newest';
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    const [search, setSearch] = useState(currentQ);

    // Sync state if URL changes externally
    useEffect(() => {
        setSearch(currentQ);
    }, [currentQ]);

    const updateUrl = (newParams: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([k, v]) => {
            if (v === null) params.delete(k);
            else params.set(k, v);
        });

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateUrl({ q: search || null, page: '1' }); // reset page on search
    };

    const clearSearch = () => {
        setSearch('');
        updateUrl({ q: null, page: '1' });
    };

    if (!hasJobs && !currentQ) return null; // Don't show controls if completely empty

    return (
        <div className="space-y-4 pb-4 border-b mb-4">
            {/* Search and Sort row */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">

                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search titles or URLs..."
                        className="pl-9 pr-9 h-9 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </form>

                <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
                    <span className="text-xs text-muted-foreground hidden sm:inline-block">Sort:</span>
                    {(['newest', 'oldest', 'status'] as const).map((key) => (
                        <button
                            key={key}
                            onClick={() => updateUrl({ sort: key, page: '1' })}
                            className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors whitespace-nowrap ${currentSort === key
                                ? 'bg-foreground text-background border-foreground font-medium'
                                : 'border-border text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {key === 'newest' ? 'Newest' : key === 'oldest' ? 'Oldest' : 'By status'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pagination (only show if more than 1 page) */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm pt-1">
                    <p className="text-muted-foreground text-xs">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 pl-2"
                            disabled={currentPage <= 1 || isPending}
                            onClick={() => updateUrl({ page: (currentPage - 1).toString() })}
                        >
                            <ChevronLeft className="w-4 h-4" /> Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 pr-2"
                            disabled={currentPage >= totalPages || isPending}
                            onClick={() => updateUrl({ page: (currentPage + 1).toString() })}
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
