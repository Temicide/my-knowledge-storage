# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build    # Discovers .md files in knowledges/, renders to dist/ via marked + highlight.js
npm run serve    # Starts dev server on port 3456 with live reload via WebSocket
```

No test suite exists. There is no lint/type-check step.

## Architecture

Personal knowledge base — a multi-file markdown → static HTML renderer. Source files live in `knowledges/`; everything else is tooling to convert them into styled, deployable pages.

**Build pipeline** (`build.js`):
- Discovers all `.md` files in `knowledges/` (skips `_`-prefixed files).
- Parses optional YAML frontmatter (simple `key: value` parser, no new dependency).
- Extracts metadata from content (H1→title, H3→subtitle, word count, reading time).
- Configures `marked` with GFM mode and a fully custom `marked.Renderer` — every block-level and inline element gets custom HTML (code blocks with headers/copy buttons, heading anchors, styled blockquotes/callouts/tables, linked TOC).
- Syntax highlighting via `highlight.js` with a warm light theme (Notion-inspired palette).
- **Listing page** (`dist/index.html`): card grid with title, subtitle, word count, read time, read/unread indicator (hydrated client-side from `localStorage`), progress bar ("X of Y read").
- **Reading pages** (`dist/knowledge/<slug>.html`): Medium-inspired typography (Charter serif 21px, 1.75 line-height, 680px max-width), Notion warm color palette, desktop TOC sidebar (≥1200px), in-content TOC for mobile, reading progress bar, auto-mark-read at 80% scroll.
- Stale HTML files from removed `.md` sources are cleaned up on each build.
- One page per file + one listing page.

**CSS** (`css.js`):
- Exports `generateCSS({ page })` returning the full `<style>` string.
- Shared design tokens (CSS custom properties on `:root`) — Notion warm palette + Medium typography.
- Page-specific selectors for `listing` vs `reading` pages.
- No external stylesheets — all CSS is inline in the generated HTML.
- No Google Fonts dependency — uses system fonts (Charter/Georgia for serif, system sans-serif for UI, JetBrains Mono for code).

**Dev server** (`server.js`):
- Builds once on startup, then serves static files from `dist/`.
- Routes: `/` → `dist/index.html`, `/knowledge/:slug` → `dist/knowledge/:slug.html`.
- Injects a WebSocket client script into served HTML for live reload.
- Watches `knowledges/` recursively with a 300ms debounce; on any `.md` file add/change/delete, rebuilds and pushes a reload message to all connected WebSocket clients.

**Deployment** (`vercel.json`):
- Vercel runs `npm run build`, serves static files from `dist/`.
- `cleanUrls: true` for extensionless URLs (e.g. `/knowledge/ink-tutorial` resolves to `dist/knowledge/ink-tutorial.html`).
- Fully static site — no SSR, no API routes.

**Key constraint**: `build.js` writes to `dist/` (not project root). Vercel serves from `dist/`. Do not change the output path without updating `vercel.json`.
