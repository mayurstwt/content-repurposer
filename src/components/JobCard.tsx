// src/components/JobCard.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash2, ExternalLink, Star, RotateCw, Share2, Link as LinkIcon } from 'lucide-react';
import JobOutputTabs from '@/components/JobOutputTabs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import confetti from 'canvas-confetti';

interface Job {
    _id: string;
    inputUrl: string;
    status: string;
    error?: string;
    pinned?: boolean;
    isPublic?: boolean;
    outputs?: any;
    createdAt: string;
}

function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

// #7 — Elapsed time since job was created
function useElapsed(createdAt: string, active: boolean) {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        if (!active) return;
        const start = new Date(createdAt).getTime();
        const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [createdAt, active]);
    return elapsed;
}

function formatElapsed(s: number) {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; className: string }> = {
        completed: { label: '✅ Completed', className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400' },
        failed: { label: '❌ Failed', className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400' },
        processing: { label: '⏳ Processing', className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' },
        pending: { label: '🕐 Pending', className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300' },
    };
    const { label, className } = map[status] ?? { label: status, className: '' };
    return (
        <Badge variant="outline" className={`shrink-0 text-xs ${className}`}>
            {label}
        </Badge>
    );
}

export default function JobCard({ job }: { job: Job }) {
    const [meta, setMeta] = useState<{ title?: string; thumbnail?: string; author?: string } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [retrying, setRetrying] = useState(false);
    const [pinning, setPinning] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const prevStatus = useRef(job.status);
    const router = useRouter();

    const isActive = job.status === 'pending' || job.status === 'processing';
    const elapsed = useElapsed(job.createdAt, isActive);

    // Fetch YouTube thumbnail + title
    useEffect(() => {
        fetch(`/api/oembed?url=${encodeURIComponent(job.inputUrl)}`)
            .then((r) => r.json())
            .then((d) => { if (d.title) setMeta(d); })
            .catch(() => { });
    }, [job.inputUrl]);

    // #17 — Confetti burst when job transitions to completed
    useEffect(() => {
        if (prevStatus.current !== 'completed' && job.status === 'completed') {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
            });
            setExpanded(true); // auto-expand outputs too
        }
        prevStatus.current = job.status;
    }, [job.status]);

    const handleDelete = async () => {
        if (!confirm('Delete this job?')) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/jobs/${job._id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            toast.success('Job deleted');
            router.refresh();
        } catch {
            toast.error('Failed to delete job');
        } finally {
            setDeleting(false);
        }
    };

    const handlePin = async () => {
        setPinning(true);
        try {
            const res = await fetch(`/api/jobs/${job._id}/pin`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pinned: !job.pinned })
            });
            if (!res.ok) throw new Error('Failed to pin');
            router.refresh();
        } catch {
            toast.error('Failed to update pin status');
        } finally {
            setPinning(false);
        }
    };

    const handleRetry = async () => {
        setRetrying(true);
        try {
            const res = await fetch(`/api/jobs/${job._id}/retry`, { method: 'POST' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Retry failed');
            }
            toast.success('Job queued for retry');
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setRetrying(false);
        }
    };

    const handleShare = async () => {
        setSharing(true);
        try {
            const res = await fetch(`/api/jobs/${job._id}/share`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to create share link');

            const { shareSlug } = await res.json();
            const url = `${window.location.origin}/share/${shareSlug}`;

            await navigator.clipboard.writeText(url);
            toast.success('Public link copied to clipboard!');
            router.refresh();
        } catch {
            toast.error('Failed to create share link');
        } finally {
            setSharing(false);
        }
    };

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Thumbnail + header */}
            <div className="flex items-start gap-3 p-4">
                {meta?.thumbnail && (
                    <div className="shrink-0">
                        <Image
                            src={meta.thumbnail}
                            alt={meta.title || 'Video thumbnail'}
                            width={120}
                            height={68}
                            className="rounded object-cover"
                        />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="font-semibold text-sm leading-tight line-clamp-2">
                                {meta?.title ?? 'Loading...'}
                            </p>
                            {meta?.author && (
                                <p className="text-xs text-muted-foreground mt-0.5">{meta.author}</p>
                            )}
                            {/* #13 — Open in YouTube */}
                            <a
                                href={job.inputUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline flex items-center gap-0.5 mt-0.5"
                            >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                Open in YouTube
                            </a>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <StatusBadge status={job.status} />

                            {job.status === 'completed' && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`h-7 w-7 text-muted-foreground ${job.isPublic ? 'text-blue-500' : 'hover:text-blue-500'}`}
                                    onClick={handleShare}
                                    disabled={sharing}
                                    title="Share public link"
                                >
                                    <LinkIcon className="w-3.5 h-3.5" />
                                </Button>
                            )}

                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-yellow-500"
                                onClick={handlePin}
                                disabled={pinning}
                                title={job.pinned ? "Unpin job" : "Pin job"}
                            >
                                <Star className="w-3.5 h-3.5" fill={job.pinned ? "currentColor" : "none"} />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={handleDelete}
                                disabled={deleting}
                                title="Delete job"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <p className="text-xs text-muted-foreground">{timeAgo(job.createdAt)}</p>
                        {/* #7 — Elapsed time while processing */}
                        {isActive && (
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-mono">
                                ⏱ {formatElapsed(elapsed)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Error */}
            {job.status === 'failed' && job.error && (
                <div className="mx-4 mb-3 flex items-start justify-between gap-4 text-destructive text-xs bg-destructive/10 rounded p-2">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{job.error}</span>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px] px-2 shrink-0 border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={handleRetry}
                        disabled={retrying}
                    >
                        {retrying ? <RotateCw className="w-3 h-3 animate-spin mr-1" /> : <RotateCw className="w-3 h-3 mr-1" />}
                        Retry Job
                    </Button>
                </div>
            )}

            {/* Outputs */}
            {job.status === 'completed' && job.outputs && (
                <div className="border-t px-4 pb-4">
                    {!expanded ? (
                        <button
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors pt-3"
                            onClick={() => setExpanded(true)}
                        >
                            ▸ View Generated Outputs
                        </button>
                    ) : (
                        <>
                            <JobOutputTabs outputs={job.outputs} jobId={job._id} />
                            <button
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-3"
                                onClick={() => setExpanded(false)}
                            >
                                ▴ Collapse
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
