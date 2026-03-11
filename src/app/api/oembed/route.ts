// src/app/api/oembed/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

    try {
        const res = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
            { next: { revalidate: 86400 } } // cache for 24h
        );
        if (!res.ok) throw new Error('oEmbed fetch failed');
        const data = await res.json();
        return NextResponse.json({
            title: data.title,
            thumbnail: data.thumbnail_url,
            author: data.author_name,
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
    }
}
