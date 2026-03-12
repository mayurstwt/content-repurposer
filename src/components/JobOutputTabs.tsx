// src/components/JobOutputTabs.tsx
'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check, Layers2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    outputs: any;
    jobId: string;
}

// #3 — Character count badge
function CharCount({ text }: { text: string }) {
    if (!text) return null;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return (
        <span className="text-xs text-muted-foreground tabular-nums">
            {text.length} chars · {words} words
        </span>
    );
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied!');
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <Button size="sm" variant="outline" onClick={handleCopy} className="h-7 text-xs gap-1">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : label}
        </Button>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    if (!value) return null;
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
                <div className="flex items-center gap-2">
                    <CharCount text={value} />
                    <CopyButton text={value} />
                </div>
            </div>
            <p className="text-sm bg-muted rounded-md p-3 whitespace-pre-wrap leading-relaxed">{value}</p>
        </div>
    );
}

// #11 — Build a "copy all" string from short-form data
function buildCopyAll(data: any): string {
    return [
        data.hook && `HOOK:\n${data.hook}`,
        data.script && `\nSCRIPT:\n${data.script}`,
        data.caption && `\nCAPTION:\n${data.caption}`,
        data.cta && `\nCTA:\n${data.cta}`,
    ].filter(Boolean).join('\n');
}

function ShortFormTab({ data }: { data: any }) {
    if (!data) return <p className="text-sm text-muted-foreground">No data generated.</p>;
    return (
        <div className="space-y-4 pt-3">
            {/* #11 — Copy All button */}
            <div className="flex justify-end">
                <Button size="sm" variant="secondary" className="h-7 text-xs gap-1"
                    onClick={async () => {
                        await navigator.clipboard.writeText(buildCopyAll(data));
                        toast.success('All fields copied!');
                    }}>
                    <Layers2 className="w-3 h-3" />
                    Copy All
                </Button>
            </div>
            <Field label="Hook" value={data.hook} />
            <Field label="Script" value={data.script} />
            <Field label="Caption" value={data.caption} />
            <Field label="Call to Action" value={data.cta} />
            {(data.suggested_clip_start || data.suggested_clip_end) && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                    {data.suggested_clip_start && <span>⏱ Clip start: {data.suggested_clip_start}</span>}
                    {data.suggested_clip_end && <span>End: {data.suggested_clip_end}</span>}
                </div>
            )}
        </div>
    );
}

function LinkedInTab({ data }: { data: any }) {
    if (!data) return <p className="text-sm text-muted-foreground">No data generated.</p>;
    return (
        <div className="space-y-4 pt-3">
            <Field label="Post" value={data.post_text} />
            {data.carousel_outline?.length > 0 && (
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Carousel Slides</span>
                        <CopyButton text={data.carousel_outline.join('\n')} label="Copy All" />
                    </div>
                    <ol className="space-y-1">
                        {data.carousel_outline.map((slide: string, i: number) => (
                            <li key={i} className="text-sm bg-muted rounded-md p-2 flex gap-2">
                                <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                                <span>{slide}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
            {data.hashtags?.length > 0 && (
                <Field label="Hashtags" value={data.hashtags.map((h: string) => `#${h.replace(/^#/, '')}`).join(' ')} />
            )}
        </div>
    );
}

function TwitterTab({ data }: { data: any }) {
    if (!data) return <p className="text-sm text-muted-foreground">No data generated.</p>;
    const tweets: string[] = data.tweets || [];
    const totalChars = tweets.join('\n\n').length;
    return (
        <div className="space-y-4 pt-3">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Thread · {tweets.length} tweets · {totalChars} chars
                </span>
                <CopyButton text={tweets.join('\n\n')} label="Copy Thread" />
            </div>
            <ol className="space-y-2">
                {tweets.map((tweet: string, i: number) => (
                    <li key={i} className="text-sm bg-muted rounded-md p-3 flex gap-2">
                        <span className="text-muted-foreground text-xs shrink-0 mt-0.5">{i + 1}/{tweets.length}</span>
                        <div className="flex-1 min-w-0">
                            <p className="whitespace-pre-wrap leading-relaxed">{tweet}</p>
                            <p className="text-xs text-muted-foreground mt-1">{tweet.length}/280</p>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}

function NewsletterTab({ data }: { data: any }) {
    if (!data) return <p className="text-sm text-muted-foreground">No data generated.</p>;
    return (
        <div className="space-y-4 pt-3">
            <Field label="Subject Line" value={data.subject} />
            <Field label="Body" value={data.body} />
        </div>
    );
}

const TABS = [
    { id: 'tiktok', label: '🎵 TikTok' },
    { id: 'instagram_reels', label: '📸 Instagram' },
    { id: 'youtube_shorts', label: '▶ Shorts' },
    { id: 'linkedin', label: '💼 LinkedIn' },
    { id: 'twitter_thread', label: '🐦 Twitter' },
    { id: 'newsletter_summary', label: '📧 Newsletter' },
];

export default function JobOutputTabs({ outputs, jobId }: Props) {
    // #6 — Persist active tab per job in localStorage
    const storageKey = `repurposer-tab-${jobId}`;
    const [activeTab, setActiveTab] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(storageKey) || 'tiktok';
        }
        return 'tiktok';
    });

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        localStorage.setItem(storageKey, tab);
    };

    if (!outputs) return null;

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
            <TabsList className="flex-wrap h-auto gap-1">
                {TABS.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value="tiktok"><ShortFormTab data={outputs.tiktok} /></TabsContent>
            <TabsContent value="instagram_reels"><ShortFormTab data={outputs.instagram_reels} /></TabsContent>
            <TabsContent value="youtube_shorts"><ShortFormTab data={outputs.youtube_shorts} /></TabsContent>
            <TabsContent value="linkedin"><LinkedInTab data={outputs.linkedin} /></TabsContent>
            <TabsContent value="twitter_thread"><TwitterTab data={outputs.twitter_thread} /></TabsContent>
            <TabsContent value="newsletter_summary"><NewsletterTab data={outputs.newsletter_summary} /></TabsContent>
        </Tabs>
    );
}
