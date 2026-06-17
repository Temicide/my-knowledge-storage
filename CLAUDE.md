# CLAUDE.md

Next.js 16 + Tailwind v4 + Supabase. Personal knowledge base + daily-life logger.

## Commands

```bash
npm run dev      # Start Next.js dev server (Turbopack HMR)
npm run build    # Static build — knowledge pages SSG, listing static
npm run start    # Production server
npm run lint     # Next.js ESLint
```

No test suite. TypeScript strict mode enabled — `npx next build` runs type checks.

## Architecture

Next.js 16 App Router, TypeScript, Tailwind v4 (CSS-first `@theme` config in `app/globals.css`). Supabase for auth + data (existing project — no setup needed).

### Routes

| Route | Auth | Type | Source |
|---|---|---|---|
| `/` | Public | Static | `app/(knowledge)/page.tsx` + `components/knowledge/ListingPage.tsx` |
| `/knowledge/[...slug]` | Public | SSG | `app/(knowledge)/knowledge/[...slug]/page.tsx` + `components/knowledge/ReadingPage.tsx` |
| `/login` | Public | Dynamic | `app/(auth)/login/page.tsx` + `components/auth/LoginForm.tsx` |
| `/register` | Public | Dynamic | `app/(auth)/register/page.tsx` + `components/auth/RegisterForm.tsx` |
| `/callback` | Public | Route handler | `app/(auth)/callback/route.ts` |
| `/loglife` | Protected | Dynamic | `app/loglife/page.tsx` + `components/loglife/LogLifeClient.tsx` |
| `/loglife/stats` | Protected | Dynamic | `app/loglife/stats/page.tsx` + `components/loglife/StatsMockup.tsx` |

### Content layer (`lib/content.ts` + `lib/markdown.ts`)

- Markdown files live in `knowledges/` (topic folders, skip `_`-prefixed). Built at build time via `generateStaticParams`.
- Rendering: `marked` v14 with full custom `Renderer` (code blocks w/ header+copy, heading anchors, callout detection, styled tables/blockquotes/images/links). Syntax highlighting via `highlight.js` v11.
- Metadata: H1→title, H3→subtitle, word count, read time (225 wpm).
- Adding/changing `.md` files requires a new `next build` (SSG — same as old build.js).
- **Key constraint**: do not change `knowledges/` directory path or the `slug=relative path minus .md` convention.

### Design system (`app/globals.css`)

Tailwind v4 `@theme { … }` defines all design tokens as CSS variables — both Tailwind utilities AND `var(--color-*)` custom CSS. System fonts only (no Google Fonts). Warm Notion palette + Medium serif typography (Charter 21px, 1.75 line-height, 680px max-width). Desktop TOC sidebar at ≥1200px. hljs warm light theme. Tokens preserved from the original `css.js`.

### Supabase

- **Ref**: existing project. `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
- **Clients**: three-client pattern from `@supabase/ssr` — `lib/supabase/browser.ts` (Client Components), `lib/supabase/server.ts` (Server Components/Route Handlers), `lib/supabase/middleware.ts` + root `middleware.ts` (session refresh + route guard).
- **Auth**: Supabase Auth (email/password + magic link). Users stored in `auth.users`. No custom users table.
- **Tables** (RLS on both, own rows only):
  - `read_status(user_id uuid, slug text, read_at timestamptz, unique(user_id,slug))`
  - `daily_logs(user_id uuid, log_date date, what_done text, happiest_thing text, updated_at timestamptz, unique(user_id,log_date))`
- **Read-progress sync**: `lib/read-status.ts` — dual strategy. Authed → Supabase `read_status` table (with localStorage→Supabase migration on first authed visit). Anon → localStorage key `knowledge-read-status`.

### /loglife feature

Apple-Calendar year view (12 mini-month grids, Sunday start). Day states: logged=green, past-unlogged=gray, future=normal, today=blue ring, selected=blue fill. 3 percentage bars (week/month/year — denominator = days elapsed in period). 2-textarea logging form (Q1: "what have you done today?", Q2: "happiest thing?") with upsert to `daily_logs` on `user_id,log_date`. `/loglife/stats` = static mockup with placeholder charts (no real AI yet).

### Deployment

Vercel zero-config (Next.js auto-detected). Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Supabase redirect URLs: add `http://localhost:3000/callback` + prod `/callback`. No `vercel.json` needed.
