# 🎬 Content Repurposer

**AI-powered tool that turns any YouTube video into viral social media content.**

Paste a YouTube URL → get a full transcript + AI-generated content for TikTok, Instagram Reels, YouTube Shorts, LinkedIn, Twitter, and newsletters — all in under 2 minutes.

---

## ✨ Features

### Core
- 🎵 **6 Platform Outputs** — TikTok, Instagram Reels, YouTube Shorts, LinkedIn, Twitter/X thread, and Newsletter
- 📋 **Per-field copy buttons** + **Copy All** for each platform
- 📊 **Char + word count** on every output field; Twitter 280-char counter per tweet
- 🖼️ **YouTube thumbnails + titles** auto-fetched via oEmbed
- 📊 **AI Analysis** — summary, key moments, virality potential, target audience, tone
- 🔄 **Background processing** via Inngest — no timeouts, retries on failure
- 🔐 **Auth** via Clerk (sign up / sign in / sign out)

### UX / Dashboard
- ⏳ **Live elapsed timer** on processing jobs
- 🎉 **Confetti burst** when a job completes + auto-expands outputs
- 🌙 **Dark / light mode toggle** — respects system preference
- 📑 **Tab persistence** — remembers last viewed platform tab per job
- 🔃 **Sort controls** — newest, oldest, or by status
- 🗑️ **Delete jobs** per user (auth-gated)
- 🔗 **Open in YouTube** link per job card

### Input Form
- ⌨️ **Cmd/Ctrl+Enter** keyboard shortcut to submit
- 📋 **Clipboard paste button** next to URL field
- ✅ **YouTube URL validation** (rejects non-YouTube links)
- 🔒 **Double-submit prevention** (button disabled while loading)

### Infrastructure
- 🔄 **Auto-polling** every 5s (3-min cap) while jobs are active
- ⚡ **Skeleton loaders** matching job card layout
- 🚀 **SSR** for job list + **CSR** for interactive elements

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | Clerk |
| Database | MongoDB via Mongoose |
| Background Jobs | Inngest |
| Transcription | Deepgram (`nova-2` model) |
| Audio Download | yt-dlp-wrap (auto-downloads binary) |
| AI / LLM | Google Gemini (`gemini-2.5-flash`) |
| UI | shadcn/ui + Tailwind CSS v4 + Radix UI |
| Toasts | Sonner |
| Forms | React Hook Form + Zod |
| Deployment | Netlify / Vercel |

---

## 🔄 How It Works

```
User submits YouTube URL
        │
        ▼
POST /api/process  →  Create Job in MongoDB (status: pending)
        │              Emit Inngest event: video/repurpose
        ▼
Inngest Background Function (repurpose-video):
  Step 1: Mark job as "processing"
  Step 2: Download audio via yt-dlp (auto-binary download if missing)
  Step 3: Transcribe audio via Deepgram API
  Step 4: Cleanup temp audio files
  Step 5: Analyze transcript via Gemini AI → summary, key moments, quotes
  Step 6: Generate platform outputs via Gemini AI → TikTok, LinkedIn, Twitter, etc.
  Step 7: Save results to MongoDB (status: completed)
        │
        ▼
Dashboard polls every 5s → displays results with tabbed UI
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page (redirects to dashboard if signed in)
│   ├── layout.tsx                # Root layout with dark navbar + Clerk + Toaster
│   ├── globals.css
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard (job submission + list)
│   └── api/
│       ├── process/route.ts      # POST: create job + fire Inngest event
│       ├── inngest/route.ts      # Inngest webhook handler
│       ├── oembed/route.ts       # GET: fetch YouTube title + thumbnail
│       └── jobs/[id]/route.ts    # DELETE: remove a job (auth-gated)
├── components/
│   ├── InputForm.tsx             # YouTube URL form with validation + toast
│   ├── JobCard.tsx               # Job list item (thumbnail, status, outputs)
│   ├── JobOutputTabs.tsx         # Tabbed output viewer with copy buttons
│   ├── JobPoller.tsx             # Auto-refresh poller (max 3 min)
│   └── ui/                       # shadcn components (Button, Badge, Card, Tabs, etc.)
├── inngest/
│   ├── client.ts                 # Inngest client instance
│   └── functions.ts              # repurposeVideo background function
├── lib/
│   ├── db.ts                     # MongoDB connection (cached for hot reload)
│   ├── llm.ts                    # Gemini AI helpers: analyzeTranscript, generatePlatformOutputs
│   ├── schemas.ts                # Zod schema: YouTube URL validation
│   └── utils.ts                  # cn() utility
└── models/
    └── Job.ts                    # Mongoose Job model
```

---

## 🗄️ Job Data Model

```typescript
{
  userId: string;          // Clerk user ID
  status: 'pending' | 'processing' | 'completed' | 'failed';
  inputUrl: string;        // YouTube URL
  transcript?: string;     // Full text transcript from Deepgram
  analysis?: {             // Gemini analysis result
    summary: string;
    key_moments: Array<{ start_time, description, virality_potential, why_viral }>;
    main_quotes: string[];
    target_audience: string;
    primary_tone: string;
  };
  outputs?: {              // Platform-specific generated content
    tiktok: { hook, script, caption, cta, suggested_clip_start, suggested_clip_end };
    instagram_reels: { ... };
    youtube_shorts: { ... };
    linkedin: { post_text, carousel_outline, hashtags };
    twitter_thread: { tweets: string[] };
    newsletter_summary: { subject, body };
  };
  error?: string;          // Error message if status === 'failed'
  createdAt: Date;
  updatedAt: Date;
}
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/content-repurposer

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Deepgram (transcription)
DEEPGRAM_API_KEY=...

# Google Gemini
GEMINI_API_KEY=...

# Inngest
INNGEST_APP_NAME=content-repurposer
INNGEST_EVENT_KEY=...           # From Inngest Cloud dashboard
INNGEST_SIGNING_KEY=...         # From Inngest Cloud dashboard
```

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Clerk account
- Deepgram account
- Google AI Studio account (Gemini API key)
- [Inngest account](https://inngest.com)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/mayurstwt/content-repurposer.git
cd content-repurposer

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in all values in .env.local

# 4. Start the Next.js dev server
npm run dev

# 5. In a separate terminal, start the Inngest dev server
npx inngest-cli@latest dev
# This starts the Inngest dev UI at http://localhost:8288
# It auto-discovers the /api/inngest endpoint

# 6. Open the app
open http://localhost:3000
```

---

## 🧪 Testing the Pipeline

1. Sign up / sign in via Clerk
2. Go to the Dashboard
3. Paste a YouTube URL (e.g. any public video under 30 minutes)
4. Click **Repurpose Video**
5. A job card appears — watch it auto-update from `pending → processing → completed`
6. Once complete, expand the job and click through the platform tabs to see generated content

> **Note:** The first job may take slightly longer as yt-dlp auto-downloads its binary. Subsequent jobs are faster.

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/process` | ✅ | Create a new repurpose job |
| `DELETE` | `/api/jobs/[id]` | ✅ | Delete a job (owner only) |
| `GET` | `/api/oembed?url=...` | ❌ | Fetch YouTube title + thumbnail |
| `PUT/POST` | `/api/inngest` | Inngest signature | Inngest webhook handler |

---

## 🌐 Deployment (Netlify / Vercel)

### Netlify
1. Push to GitHub
2. Connect repo to Netlify
3. Add all environment variables in **Site Settings → Environment Variables**
4. Set build command: `npm run build`
5. Set publish directory: `.next`
6. Install the **@netlify/plugin-nextjs** plugin

### Vercel (recommended)
1. Push to GitHub
2. Import project on Vercel
3. Add all environment variables
4. Deploy — Vercel auto-detects Next.js

> **Important:** For Inngest to work in production, set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` from the [Inngest Cloud dashboard](https://app.inngest.com).

---

## 🧩 Key Design Decisions

- **Inngest for background jobs** — YouTube download + transcription + LLM analysis can take 60–120s, far beyond serverless function limits. Inngest handles this with durable execution and automatic retries.
- **yt-dlp auto-download** — The yt-dlp binary is automatically downloaded at runtime to `os.tmpdir()` so it works in serverless environments without manual installation.
- **Gemini `responseMimeType: application/json`** — Forces structured JSON output, avoiding the need for prompt-hacking or regex parsing.
- **oEmbed for thumbnails** — No YouTube Data API key needed. The oEmbed endpoint is public and returns title + thumbnail for any public video.

---

## 📄 License

MIT
