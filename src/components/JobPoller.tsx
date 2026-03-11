// src/components/JobPoller.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
    hasActiveJobs: boolean;
}

const MAX_POLLS = 36; // 36 × 5s = 3 minutes max polling before giving up

export default function JobPoller({ hasActiveJobs }: Props) {
    const router = useRouter();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollCountRef = useRef(0);
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        if (!hasActiveJobs) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            pollCountRef.current = 0;
            setTimedOut(false);
            return;
        }

        pollCountRef.current = 0;

        intervalRef.current = setInterval(() => {
            pollCountRef.current += 1;

            if (pollCountRef.current >= MAX_POLLS) {
                clearInterval(intervalRef.current!);
                setTimedOut(true);
                return;
            }

            router.refresh();
        }, 5000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [hasActiveJobs, router]);

    if (!hasActiveJobs) return null;

    if (timedOut) {
        return (
            <p className="text-xs text-center text-muted-foreground py-2">
                ⚠️ A job is taking longer than expected.{' '}
                <button
                    className="underline"
                    onClick={() => {
                        pollCountRef.current = 0;
                        setTimedOut(false);
                        router.refresh();
                    }}
                >
                    Refresh manually
                </button>
            </p>
        );
    }

    return (
        <p className="text-xs text-center text-muted-foreground animate-pulse py-2">
            ⏳ Processing... auto-refreshing
        </p>
    );
}
