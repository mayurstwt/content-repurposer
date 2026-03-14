# Content Repurposer

AI SaaS for turning a single YouTube video into structured, publish-ready content across TikTok, Instagram Reels, YouTube Shorts, LinkedIn, Twitter/X, and newsletters.

## What the app does

- Accepts one or more YouTube URLs from the dashboard.
- Queues jobs for background processing with Inngest.
- Transcribes source media, analyzes the transcript, and generates platform-specific outputs with Gemini.
- Stores job history, supports retry/share/pin flows, and exposes billing, team, and developer settings.
- Uses Polar for subscription checkout and plan provisioning.

## Current product surface

### Public pages

- `/` marketing landing page
- `/pricing` dedicated pricing page
- `/sign-in`
- `/sign-up`
- `/share/[slug]`
- `/invite/[token]`

### Authenticated pages

- `/dashboard`
- `/settings/billing`
- `/settings/team`
- `/settings/developer`
- `/jobs/[id]`

### Navigation

Signed-out navigation includes:

- Home
- Pricing
- Sign in
- Start free

Signed-in navigation includes:

- Dashboard
- Pricing
- Billing
- Team
- Developer

## Tech stack

- Next.js 16 App Router
- React 19
- Clerk authentication
- MongoDB + Mongoose
- Inngest background jobs
- Google Gemini
- Deepgram
- Polar
- Upstash Redis
- Tailwind CSS v4 + shadcn/ui

## UI notes

- Shared site shell with sticky navbar and footer
- Dedicated pricing experience
- Refined landing-page hero, workflow preview, and CTA sections
- Improved dashboard framing and visual hierarchy
- Google Fonts via `next/font/google`

## Testing

This repo currently uses Jest for route, integration, and UI-flow testing.

### Covered flows

- Polar webhook behavior
- `/api/process` request validation and success path
- Dashboard submission flow
- Quota exceeded upgrade prompt
- Dashboard search, sort, and pagination controls
- Job share and retry actions
- Signed-in and signed-out navbar states
- Pricing section and pricing page rendering

### Run tests

```bash
npm test -- --runInBand
```

## Environment variables

Create `.env.local` in the project root.

```env
MONGODB_URI=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

DEEPGRAM_API_KEY=
GEMINI_API_KEY=

INNGEST_APP_NAME=content-repurposer
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_FREE_PRODUCT_ID=
POLAR_PRO_PRODUCT_ID=
POLAR_AGENCY_PRODUCT_ID=
NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID=
NEXT_PUBLIC_POLAR_AGENCY_PRODUCT_ID=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start Next.js:

```bash
npm run dev
```

3. Start Inngest locally in a second terminal:

```bash
npx inngest-cli@latest dev
```

## Project structure

```text
src/
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── pricing/
│   ├── settings/
│   ├── share/
│   ├── sign-in/
│   └── sign-up/
├── components/
│   ├── ui/
│   ├── SiteHeader.tsx
│   ├── SiteFooter.tsx
│   ├── PricingSection.tsx
│   ├── InputForm.tsx
│   ├── JobCard.tsx
│   └── JobOutputTabs.tsx
├── inngest/
├── lib/
└── models/
```

## Notes

- Billing, team, and developer surfaces are plan-sensitive.
- Public API and job creation are both guarded by validation and rate-limiting.
- The test suite is currently integration-heavy rather than browser-automation-based.
