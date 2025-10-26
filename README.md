# Octavia – AI Music Generator

Octavia is a full‑stack AI music generation app. Users can create songs from a description or lyrics, manage their account, and top up credits via checkout – all wrapped in a clean, modern UI.

Octavia is available and free to use at:
https://octavia-music-gen.vercel.app/

## Highlights

- AI song generation via ACE-Step and deployed via Modal functions (description, lyrics, described‑lyrics)
- Async orchestration with Inngest (status updates, generation, DB updates, credit deduction)
- Authentication and account UI with Better Auth + Better Auth UI
- Billing via Polar (checkout, customer portal, webhooks) to credit users
- PostgreSQL (Neon) + Prisma ORM
- AWS S3 for audio and cover storage with presigned playback URLs
- Next.js App Router + React Server Components + shadcn/ui + Tailwind CSS
- Clean component architecture, server actions, and type‑safe data access

## Architecture

Monorepo structure:

```
.
├── backend/                 # Python services (Modal)
│   ├── main.py              # Generation endpoints (deployed on Modal)
│   └── requirements.txt
└── frontend/                # Next.js app (App Router)
		├── prisma/schema.prisma # Prisma schema
		├── src/
		│   ├── app/             # Routes (RSC)
		│   ├── actions/         # Server actions
		│   ├── components/      # UI components (shadcn/ui)
		│   ├── inngest/         # Inngest client and functions
		│   ├── lib/             # Auth, utils
		│   └── server/          # DB bootstrap
		└── public/              # Static assets
```

Data flow (happy path):

1. User submits a generation request from the Create panel
2. An Inngest function runs with per‑user concurrency
3. The function calls Modal (absolute URLs) to generate audio + cover
4. Files are written to S3; DB rows updated; optional categories created
5. Credits are deducted; UI shows processing → processed
6. Playback uses short‑lived presigned S3 URLs

## Core features

- Song generation
  - From description
  - From lyrics
  - From “described lyrics”
- Account & auth
  - Sign‑in/up via Better Auth + built‑in UI
  - Account pages under `(account)/account/[pathname]`
  - Back button to previous page (client safe‑fallback)
- Payments & credits
  - Polar checkout with price IDs
  - Customer portal redirect
  - Webhooks add credits to user
- Library & discovery
  - Likes, trending, categories, thumbnails
  - Presigned streaming

## Tech stack

- Frontend: Next.js 14+ (App Router, RSC), TypeScript, shadcn/ui, Tailwind CSS, lucide‑react
- State: small stores with Zustand where needed
- Auth: Better Auth + Better Auth UI
- Jobs: Inngest
- AI runtime: Modal (Python) for generation
- DB: Postgres (Neon) + Prisma
- Storage: AWS S3 (+ @aws-sdk v3 presigner)
- Payments: Polar (checkout, portal, webhooks)
- Deployment: Vercel (frontend), Modal (backend), Neon (DB)

## License

This project is based on Andreas Trolle's tutorial available here:
https://www.youtube.com/watch?v=fC3_Luf7wVA&t=18503s
and thus falls under the MIT License.

MIT License

Copyright (c) [2025] [Andreas Trolle]

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
