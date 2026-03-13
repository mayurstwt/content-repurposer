// src/components/JobOutputTabs.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check, Layers2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';

interface Props {
    outputs: any;
    jobId: string;
    watermark?: boolean;
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

function CopyButton({ text, label = 'Copy', watermark = false }: { text: string; label?: string; watermark?: boolean }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        const finalContent = watermark ? `${text}\n\n🤖 Made with Content Repurposer (repurposer.app)` : text;
        await navigator.clipboard.writeText(finalContent);
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

function Field({ label, value, watermark = false }: { label: string; value: string; watermark?: boolean }) {
    if (!value) return null;
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
                <div className="flex items-center gap-2">
                    <CharCount text={value} />
                    <CopyButton text={value} watermark={watermark} />
                </div>
            </div>
            <p className="text-sm bg-muted rounded-md p-3 whitespace-pre-wrap leading-relaxed">{value}</p>
        </div>
    );
}

// #59 — Platform performance hints
function Hint({ text }: { text: string }) {
    return (
        <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-xs px-3 py-2 rounded-md border border-amber-200/50 dark:border-amber-900/50 flex gap-2 items-start mt-1 mb-4 no-print">
            <span className="shrink-0 text-amber-500">💡</span>
            <p>{text}</p>
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

function ShortFormTab({ data, watermark }: { data: any, watermark?: boolean }) {
    if (!data) return <p className="text-sm text-muted-foreground">No data generated.</p>;
    return (
        <div className="space-y-4 pt-3">
            <Hint text="Fast-paced editing and an engaging hook in the first 3 seconds are crucial for short-form retention." />
            {/* #11 — Copy All button */}
            <div className="flex justify-end">
                <Button size="sm" variant="secondary" className="h-7 text-xs gap-1"
                    onClick={async () => {
                        const content = buildCopyAll(data);
                        const finalContent = watermark ? `${content}\n\n🤖 Made with Content Repurposer (repurposer.app)` : content;
                        await navigator.clipboard.writeText(finalContent);
                        toast.success('All fields copied!');
                    }}>
                    <Layers2 className="w-3 h-3" />
                    Copy All
                </Button>
            </div>
            <Field label="Hook" value={data.hook} watermark={watermark} />
            <Field label="Script" value={data.script} watermark={watermark} />
            <Field label="Caption" value={data.caption} watermark={watermark} />
            <Field label="Call to Action" value={data.cta} watermark={watermark} />
            {(data.suggested_clip_start || data.suggested_clip_end) && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                    {data.suggested_clip_start && <span>⏱ Clip start: {data.suggested_clip_start}</span>}
                    {data.suggested_clip_end && <span>End: {data.suggested_clip_end}</span>}
                </div>
            )}
        </div>
    );
}

function LinkedInTab({ data, watermark }: { data: any, watermark?: boolean }) {
    if (!data) return <p className="text-sm text-muted-foreground">No data generated.</p>;
    return (
        <div className="space-y-4 pt-3">
            <Hint text="LinkedIn algorithms favor posts that keep users on the platform. Avoid putting external links directly in the post body—put them in the comments instead!" />
            <Field label="Post" value={data.post_text} watermark={watermark} />
            {data.carousel_outline?.length > 0 && (
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Carousel Slides</span>
                        <CopyButton text={data.carousel_outline.join('\n')} label="Copy All" watermark={watermark} />
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
                <Field label="Hashtags" value={data.hashtags.map((h: string) => `#${h.replace(/^#/, '')}`).join(' ')} watermark={watermark} />
            )}
        </div>
    );
}

function TwitterTab({ data, watermark }: { data: any, watermark?: boolean }) {
    if (!data) return <p className="text-sm text-muted-foreground">No data generated.</p>;
    const tweets: string[] = data.tweets || [];
    const totalChars = tweets.join('\n\n').length;
    return (
        <div className="space-y-4 pt-3">
            <Hint text="Threads with a strong declarative hook and an image attached to the first tweet get significantly more impressions." />
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Thread · {tweets.length} tweets · {totalChars} chars
                </span>
                <CopyButton text={tweets.join('\n\n')} label="Copy Thread" watermark={watermark} />
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

function NewsletterTab({ data, watermark }: { data: any, watermark?: boolean }) {
    if (!data) return <p className="text-sm text-muted-foreground">No data generated.</p>;
    return (
        <div className="space-y-4 pt-3">
            <Hint text="Emails with 35-50 character subject lines see the highest open rates. Keep it punchy!" />
            <Field label="Subject Line" value={data.subject} watermark={watermark} />
            <Field label="Body" value={data.body} watermark={watermark} />
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

export default function JobOutputTabs({ outputs, jobId, watermark = false }: Props) {
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

    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Repurposed_Content_${jobId}`,
    });

    if (!outputs) return null;

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-2">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <div className="flex items-center justify-between gap-4">
                        <TabsList className="flex-wrap h-auto gap-1">
                            {TABS.map((tab) => (
                                <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden sm:flex gap-1 h-8 shrink-0"
                            onClick={() => handlePrint()}
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export PDF
                        </Button>
                    </div>

                    <TabsContent value="tiktok"><ShortFormTab data={outputs.tiktok} watermark={watermark} /></TabsContent>
                    <TabsContent value="instagram_reels"><ShortFormTab data={outputs.instagram_reels} watermark={watermark} /></TabsContent>
                    <TabsContent value="youtube_shorts"><ShortFormTab data={outputs.youtube_shorts} watermark={watermark} /></TabsContent>
                    <TabsContent value="linkedin"><LinkedInTab data={outputs.linkedin} watermark={watermark} /></TabsContent>
                    <TabsContent value="twitter_thread"><TwitterTab data={outputs.twitter_thread} watermark={watermark} /></TabsContent>
                    <TabsContent value="newsletter_summary"><NewsletterTab data={outputs.newsletter_summary} watermark={watermark} /></TabsContent>
                </Tabs>
            </div>

            {/* Hidden Printable Document */}
            <div className="hidden">
                <div ref={printRef} className="p-10 max-w-4xl mx-auto bg-white text-black space-y-8 font-sans">
                    <div className="border-b pb-4 mb-6">
                        <h1 className="text-3xl font-bold mb-1">Repurposed Content Report</h1>
                        <p className="text-gray-500 text-sm">Generated by Content Repurposer (Job #{jobId})</p>
                    </div>

                    {/* Short Form */}
                    {outputs.tiktok && (
                        <section className="space-y-4 pt-4 border-t">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Short-Form Video (TikTok / Reels / Shorts)</h2>
                            <div><strong className="block text-gray-500 uppercase text-xs mb-1">Hook</strong><p className="text-sm whitespace-pre-wrap leading-relaxed">{outputs.tiktok.hook}</p></div>
                            <div><strong className="block text-gray-500 uppercase text-xs mb-1">Script</strong><p className="text-sm whitespace-pre-wrap leading-relaxed">{outputs.tiktok.script}</p></div>
                            <div><strong className="block text-gray-500 uppercase text-xs mb-1">Caption / Hashtags</strong><p className="text-sm whitespace-pre-wrap leading-relaxed">{outputs.tiktok.caption}</p></div>
                        </section>
                    )}

                    {/* LinkedIn */}
                    {outputs.linkedin && (
                        <section className="space-y-4 pt-4 border-t" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. LinkedIn Post & Carousel</h2>
                            <div><strong className="block text-gray-500 uppercase text-xs mb-1">Post Text</strong><p className="text-sm whitespace-pre-wrap leading-relaxed">{outputs.linkedin.post_text}</p></div>
                            {outputs.linkedin.carousel_outline?.length > 0 && (
                                <div>
                                    <strong className="block text-gray-500 uppercase text-xs mb-1">Carousel Outline</strong>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        {outputs.linkedin.carousel_outline.map((slide: string, i: number) => <li key={i}>{slide}</li>)}
                                    </ol>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Twitter */}
                    {outputs.twitter_thread && (
                        <section className="space-y-4 pt-4 border-t" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Twitter Thread</h2>
                            <div className="space-y-3">
                                {outputs.twitter_thread.tweets?.map((tweet: string, i: number) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <span className="text-gray-400 shrink-0 font-medium">{i + 1}/{outputs.twitter_thread.tweets.length}</span>
                                        <p className="whitespace-pre-wrap leading-relaxed">{tweet}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Newsletter */}
                    {outputs.newsletter_summary && (
                        <section className="space-y-4 pt-4 border-t" style={{ pageBreakInside: 'avoid' }}>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Email Newsletter</h2>
                            <div><strong className="block text-gray-500 uppercase text-xs mb-1">Subject Line</strong><p className="text-sm font-semibold">{outputs.newsletter_summary.subject}</p></div>
                            <div><strong className="block text-gray-500 uppercase text-xs mb-1">Body Text</strong><p className="text-sm whitespace-pre-wrap leading-relaxed">{outputs.newsletter_summary.body}</p></div>
                        </section>
                    )}

                    {/* Watermark in PDF footer */}
                    {watermark && (
                        <div className="pt-8 mt-8 border-t text-sm font-medium text-gray-400 text-center uppercase tracking-wide">
                            Generated by repurposer.app
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
