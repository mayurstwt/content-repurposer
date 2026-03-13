# 🎬 Content Repurposer (SaaS)

**AI-powered tool that turns any YouTube video into 6 formats of viral social media content + completely Monetized via Polar.**

Paste a YouTube URL → get a full transcript + AI-generated content for TikTok, Instagram Reels, YouTube Shorts, LinkedIn, Twitter, and newsletters — all in under 2 minutes.

---

## ✨ Features

### Content Generation
- 🎵 **6 Platform Outputs** — TikTok, Instagram Reels, YouTube Shorts, LinkedIn, Twitter/X thread, and Newsletter
- 📊 **AI Analysis** — summary, key moments, virality potential, target audience, tone
- 🖼️ **YouTube thumbnails + titles** auto-fetched via oEmbed
- 🎛️ **Tone & Audience controls** — override the AI generation style and target demographic
- 📑 **Export Options** — Copy individually, "Copy All" blocks, or Export the full document as a branded PDF
- 🌍 **Share-by-Link (Virality)** — Generate secure, public `nanoid` shortlinks of outputs to share with clients or friends. Auto-watermarks free tier content.

### B2B & Growth (Phase 3)
- 🏢 **Team Workspaces** — Agency owners can generate secure invite links to onboard team members to share their unlimited quota.
- 🎨 **White-Labeling** — Workspaces support custom branding (Logo URLs) which dynamically override the default UI on public share links.
- 🔑 **Developer API Keys** — Generate secure hashes to programmatically trigger the background `/v1/repurpose` video engine from Zapier or custom code.

### Monetization (Polar)
- 💳 **Tiered Subscriptions** — Free (10/mo), Pro (100/mo), Agency (Unlimited + Workspaces + API)
- 🛒 **Checkout Sessions** — Integrated seamlessly with Polar.sh for Merchant of Record billing and subscriptions.
- 🪝 **Webhook Syncing** — Listens to Polar `subscription.created`, `updated`, and `revoked` to auto-provision user quotas.
- 🚦 **Quota Gating** — Automatically validates plan limits before dispatching costly background compute jobs, offering clean Upgrade UI prompts.

### UX & Infrastructure
- 🔄 **Background processing** via Inngest — zero timeouts, with `maxAttempts` retry buffers and explicit failure handlers.
- ⏱️ **Job Status Polling** — Real-time live elapsed timer UI that polls MongoDB every 5s while processing.
- 🔐 **Auth & Security** — Clerk JWT authentication, Upstash Redis Rate-Limiting (10 req/hr), and strict validation via Zod schemas.
- 🌙 **Dark / light mode toggle** — responsive UI using `shadcn/ui` + Tailwind CSS v4.
- 📅 **Cron Jobs** — Scheduled automated monthly job quota resets via Inngest `cron`.

---

## 🔄 Core Application Workflow

```text
User Submits YouTube URL (Frontend)
        │
        ▼
POST /api/process 
  1. Authenticates User via Clerk
  2. Applies Upstash Redis Rate-Limiting
  3. Checks User Quota/Workspace Plan (Mongo) -> Returns 402 if exceeded
  4. Creates a "Pending" Job in MongoDB
  5. Emits `video/repurpose` Event to Inngest
        │
        ▼
Inngest Background Worker (repurposeVideo)
  Step 1: Mark job "processing"
  Step 2: Download raw audio via `yt-dlp` (auto-fetching binary to `os.tmpdir()`)
  Step 3: Transcribe audio to text via Deepgram Nova-2 API
  Step 4: Cleanup temp OS audio files
  Step 5: Analyze transcript via Gemini 2.5 Flash -> Extract quotes & timestamps
  Step 6: Generate 6 platform-specific outputs via Gemini 2.5 Flash
  Step 7: Save raw Transcript & Outputs to MongoDB (status: "completed")
  Step 8: Fire user-defined Webhook callback (if requested)
        │
        ▼
Dashboard Poller
  Frontend UI polls `GET /api/jobs` every 5 seconds.
  Detects "completed" state -> Renders Confetti 🎉 and displays tabbed outputs.
```

---

## 📁 Project Folder Structure

```text
src/
├── app/
│   ├── (auth)/                 # Clerk Sign-in/Sign-up pages
│   ├── api/                    # Core REST API Endpoints
│   │   ├── developer/keys/     # Phase 3 - API key generation
│   │   ├── inngest/            # Webhook receiver for Inngest background workers
│   │   ├── oembed/             # YouTube thumbnail pre-fetching
│   │   ├── polar/              # Monetization Checkouts & Webhooks
│   │   ├── process/            # Primary Job Trigger endpoint
│   │   ├── v1/                 # Public Developer endpoints for Agency API Keys
│   │   └── workspaces/         # Team Invite & Branding management
│   ├── dashboard/              # Private user portal for job history
│   ├── invite/[token]/         # Public receiver for Team Workspace invites
│   ├── jobs/[id]/              # Authenticated single-job detailed view
│   ├── settings/               # User configurations
│   │   ├── billing/            # Polar current plan & usage tracking UI
│   │   ├── developer/          # API Key generator UI
│   │   └── team/               # Team Workspaces UI
│   └── share/[slug]/           # Public unauthenticated view for viral share-links
├── components/
│   ├── ui/                     # Reusable Shadcn/Radix atomic components
│   ├── InputForm.tsx           # Primary URL submission component
│   ├── JobCard.tsx             # Job preview item on the dashboard
│   ├── JobOutputTabs.tsx       # Complex multi-tab rendering & PDF Export component
│   ├── Navbar.tsx              # Global sticky site navigation
│   ├── UpgradePrompt.tsx       # Monetization CTA modal
│   └── UserDropdown.tsx        # Client component for Clerk UserButton menu items
├── inngest/
│   ├── client.ts               # Inngest system configuration
│   └── functions.ts            # Defines `repurpose-video` & `reset-monthly-quota` 
├── lib/
│   ├── db.ts                   # Cached MongoDB connection utility
│   ├── jobs.ts                 # Database helpers to orchestrate Job logic
│   ├── llm.ts                  # Raw Prompts and structured Google Gemini integrations
│   ├── quota.ts                # Evaluation engine for Free vs Pro vs Agency limits
│   ├── rate-limit.ts           # Upstash Redis initialization
│   └── schemas.ts              # Zod schema definitions for strict payload typing
└── models/
    ├── ApiKey.ts               # Mongoose schema for cryptographically hashed Developer keys
    ├── Job.ts                  # Mongoose schema for Core Application Jobs
    ├── Transcript.ts           # Mongoose schema for Raw Deepgram texts
    ├── User.ts                 # Mongoose schema for Billing tracking & Polar limits
    ├── Workspace.ts            # Mongoose schema for Teams & White-label branding
    └── WorkspaceInvite.ts      # Mongoose schema for secure time-limited tokenized invites
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Auth** | Clerk |
| **Database** | MongoDB (Mongoose) |
| **Monetization** | Polar.sh |
| **Background Jobs**| Inngest |
| **Transcription** | Deepgram (`nova-2` model) |
| **AI / LLM** | Google Gemini (`gemini-2.5-flash`) |
| **Audio Fetching** | yt-dlp-wrap |
| **UI** | shadcn/ui + Tailwind CSS v4 + Radix UI |
| **Caching/Limits** | Upstash Redis |

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root based on `.env.example`:

```env
# MongoDB Database
MONGODB_URI=mongodb+srv://...

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Deepgram (Transcription)
DEEPGRAM_API_KEY=...

# Google Gemini (LLM)
GEMINI_API_KEY=...

# Inngest (Background Worker & Cron)
INNGEST_APP_NAME=content-repurposer
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Polar (Monetization & Billing)
POLAR_ACCESS_TOKEN=polar_...
POLAR_WEBHOOK_SECRET=...
POLAR_FREE_PRODUCT_ID=...
POLAR_PRO_PRODUCT_ID=...
POLAR_AGENCY_PRODUCT_ID=...

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 🚀 Local Development

1. **Clone & Install**: `git clone ... && npm install`
2. **Environment**: Copy `.env.example` -> `.env.local` and provide the keys.
3. **Start Next.js**: `npm run dev` (Runs on `localhost:3000`)
4. **Start Inngest**: In a second terminal, run `npx inngest-cli@latest dev` (Runs on `localhost:8288`)

**To Test Webhooks Locally:**
Use Pinggy, Ngrok, or the Inngest local dev server to expose your localhost to Polar and other external webhook dispatchers so `subscription.created` events fire to `/api/polar/webhook`.
