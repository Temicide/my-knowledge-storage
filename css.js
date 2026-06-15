// ── Shared CSS module — Notion + Medium blended design system ───
// Exports generateCSS({ page: 'listing' | 'reading' }) → <style> string

export function generateCSS({ page = 'reading' } = {}) {
  return `<style>
    /* ═══════════════════════════════════════════════════════════════
       DESIGN TOKENS — Notion warm palette + Medium typography
       ═══════════════════════════════════════════════════════════════ */
    :root {
      /* Warm neutral palette (Notion-inspired) */
      --text-primary: #37352F;
      --text-secondary: #6B6966;
      --text-tertiary: #9B9A97;
      --bg-primary: #FFFFFF;
      --bg-secondary: #FBFBFB;
      --bg-hover: #F7F6F3;
      --bg-code: #F6F5F3;
      --bg-code-header: #EDECE9;
      --border-primary: #E8E7E4;
      --border-light: #F0EFEC;

      /* Accent (muted blue, Notion-style) */
      --accent: #2383E2;
      --accent-hover: #1A6BC4;
      --accent-light: #E8F2FB;

      /* Callout */
      --callout-bg: #F9FAF8;
      --callout-border: #E8E7E4;
      --callout-text: #37352F;

      /* Typography */
      --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      --font-serif: Charter, 'Bitstream Charter', 'Sitka Text', Georgia, 'Times New Roman', serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;

      /* Reading page (Medium-inspired) */
      --reading-font-size: 21px;
      --reading-line-height: 1.75;
      --reading-max-width: 680px;
      --paragraph-spacing: 1.3em;

      /* Layout */
      --listing-max-width: 900px;
      --content-padding-x: 24px;
      --radius-sm: 3px;
      --radius-md: 6px;
      --radius-lg: 8px;

      /* Shadows */
      --shadow-card: 0 1px 3px rgba(0,0,0,0.04);
      --shadow-card-hover: 0 1px 3px rgba(0,0,0,0.08);
    }

    /* ═══════════════════════════════════════════════════════════════
       CSS RESET & BASE
       ═══════════════════════════════════════════════════════════════ */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      font-family: var(--font-sans);
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      font-size: 16px;
    }

    a {
      color: var(--accent);
      text-decoration: none;
    }

    a:hover {
      color: var(--accent-hover);
    }

    /* ═══════════════════════════════════════════════════════════════
       SCROLLBAR
       ═══════════════════════════════════════════════════════════════ */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

    /* ═══════════════════════════════════════════════════════════════
       SELECTION
       ═══════════════════════════════════════════════════════════════ */
    ::selection {
      background: #D6E9FA;
      color: var(--text-primary);
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PROGRESS BAR (top of viewport)
       ═══════════════════════════════════════════════════════════════ */
    .reading-progress {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: transparent;
      z-index: 1000;
      pointer-events: none;
      transition: background 0.1s linear;
    }

    /* ═══════════════════════════════════════════════════════════════
       LISTING PAGE
       ═══════════════════════════════════════════════════════════════ */
    .listing-container {
      max-width: var(--listing-max-width);
      margin: 0 auto;
      padding: 80px var(--content-padding-x) 120px;
    }

    .listing-header {
      margin-bottom: 48px;
    }

    .listing-header h1 {
      font-family: var(--font-serif);
      font-size: clamp(2.2rem, 4vw, 3rem);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.03em;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .listing-header .subtitle {
      font-size: 1.1rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* Progress summary */
    .progress-summary {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 24px;
      font-size: 14px;
      color: var(--text-tertiary);
    }

    .progress-bar-track {
      flex: 1;
      height: 4px;
      background: var(--border-light);
      border-radius: 2px;
      overflow: hidden;
      max-width: 200px;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 2px;
      transition: width 0.4s ease;
      width: 0%;
    }

    .progress-label {
      font-weight: 500;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    /* Card grid */
    .card-grid {
      display: flex;
      flex-direction: column;
      gap: 1px;
      background: var(--border-primary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .knowledge-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      background: var(--bg-primary);
      text-decoration: none;
      color: var(--text-primary);
      transition: background 0.15s ease;
      gap: 16px;
    }

    .knowledge-card:hover {
      background: var(--bg-hover);
    }

    .card-content {
      flex: 1;
      min-width: 0;
    }

    .card-title {
      font-size: 17px;
      font-weight: 600;
      line-height: 1.4;
      color: var(--text-primary);
      margin-bottom: 2px;
    }

    .card-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.4;
      margin-bottom: 6px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-tertiary);
      flex-wrap: wrap;
    }

    .card-meta .meta-sep {
      color: var(--border-primary);
    }

    .card-arrow {
      font-size: 18px;
      color: var(--text-tertiary);
      transition: transform 0.2s ease, color 0.15s ease;
      flex-shrink: 0;
    }

    .knowledge-card:hover .card-arrow {
      transform: translateX(4px);
      color: var(--accent);
    }

    /* Read status indicator */
    .read-indicator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .read-indicator.read {
      color: #0B7A42;
    }

    .read-indicator.unread {
      color: var(--text-tertiary);
    }

    .read-indicator .indicator-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .read-indicator.read .indicator-dot {
      background: #0B7A42;
    }

    .read-indicator.unread .indicator-dot {
      background: var(--border-primary);
      border: 1px solid var(--text-tertiary);
    }

    /* Topic sections */
    .topic-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .topic-section {
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--bg-primary);
    }

    .topic-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 16px 24px;
      background: var(--bg-secondary);
      border: none;
      border-bottom: 1px solid var(--border-primary);
      cursor: pointer;
      font-family: var(--font-sans);
      font-size: inherit;
      color: var(--text-primary);
      transition: background 0.15s ease;
      user-select: none;
      -webkit-user-select: none;
    }

    .topic-header:hover {
      background: var(--bg-hover);
    }

    .topic-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .topic-meta {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .topic-count {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-tertiary);
      background: var(--bg-primary);
      padding: 2px 10px;
      border-radius: 10px;
      border: 1px solid var(--border-primary);
    }

    .topic-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: var(--text-tertiary);
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      line-height: 1;
    }

    .topic-header[aria-expanded="true"] .topic-toggle {
      /* stays as ▾ — no rotation: expanded is default */
    }

    .topic-header[aria-expanded="false"] .topic-toggle {
      transform: rotate(-90deg);
    }

    /* Topic cards wrapper */
    .topic-cards {
      display: flex;
      flex-direction: column;
      gap: 1px;
      background: var(--border-primary);
    }

    .topic-cards.collapsed {
      display: none;
    }

    /* Cards inside topic sections — no outer border, section provides border */
    .topic-cards .knowledge-card:first-child {
      /* flush with header */
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 80px 24px;
      color: var(--text-tertiary);
    }

    .empty-state p {
      font-size: 16px;
      margin-bottom: 8px;
    }

    .empty-state .hint {
      font-size: 14px;
      color: var(--text-tertiary);
    }

    /* Listing footer */
    .listing-footer {
      margin-top: 48px;
      text-align: center;
      font-size: 13px;
      color: var(--text-tertiary);
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — Top Nav
       ═══════════════════════════════════════════════════════════════ */
    .top-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: var(--reading-max-width);
      margin: 0 auto;
      padding: 20px var(--content-padding-x);
      font-size: 14px;
    }

    .nav-back {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--text-secondary);
      font-weight: 500;
      transition: color 0.15s ease;
    }

    .nav-back:hover {
      color: var(--accent);
    }

    .nav-meta {
      color: var(--text-tertiary);
      font-size: 13px;
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — Article Layout
       ═══════════════════════════════════════════════════════════════ */
    .reading-container {
      width: 100%;
      max-width: var(--reading-max-width);
      margin: 0 auto;
      padding: 0 var(--content-padding-x) 120px;
    }

    /* Hero / Article header */
    .article-hero {
      margin-bottom: 48px;
      padding-bottom: 32px;
      border-bottom: 1px solid var(--border-primary);
    }

    .article-hero h1 {
      font-family: var(--font-serif);
      font-size: clamp(2rem, 5vw, 2.8rem);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.03em;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .article-subtitle {
      font-size: 1.15rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .article-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 20px;
      color: var(--text-tertiary);
      font-size: 14px;
      flex-wrap: wrap;
    }

    .article-meta .meta-sep {
      color: var(--border-primary);
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — Content Typography (Medium-inspired)
       ═══════════════════════════════════════════════════════════════ */
    .article-content {
      font-family: var(--font-serif);
      font-size: var(--reading-font-size);
      line-height: var(--reading-line-height);
      color: var(--text-primary);
    }

    .article-content p {
      margin-bottom: var(--paragraph-spacing);
    }

    .article-content h1,
    .article-content h2,
    .article-content h3,
    .article-content h4,
    .article-content h5,
    .article-content h6 {
      font-family: var(--font-sans);
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      position: relative;
      line-height: 1.3;
    }

    .article-content h1 { font-size: 1.6rem; margin: 56px 0 16px; }
    .article-content h2 { font-size: 1.35rem; margin: 48px 0 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-light); }
    .article-content h3 { font-size: 1.15rem; margin: 40px 0 10px; }
    .article-content h4 { font-size: 1.05rem; margin: 32px 0 8px; }

    .heading-anchor {
      position: absolute;
      left: -28px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0;
      color: var(--text-tertiary);
      font-size: 0.9em;
      font-weight: 400;
      text-decoration: none;
      transition: opacity 0.2s ease;
    }

    h1:hover .heading-anchor,
    h2:hover .heading-anchor,
    h3:hover .heading-anchor,
    h4:hover .heading-anchor {
      opacity: 1;
    }

    .article-content a {
      color: var(--accent);
      text-decoration: none;
      border-bottom: 1px solid var(--accent-light);
      transition: border-color 0.2s ease;
    }

    .article-content a:hover {
      border-bottom-color: var(--accent);
    }

    .article-content strong {
      font-weight: 650;
      color: #2B2822;
    }

    .article-content ul,
    .article-content ol {
      margin: 0.8em 0 1.5em;
      padding-left: 1.6em;
      color: var(--text-primary);
    }

    .article-content li {
      margin-bottom: 0.3em;
      padding-left: 0.2em;
    }

    .article-content li::marker {
      color: var(--text-tertiary);
    }

    .article-content ol > li::marker {
      color: var(--accent);
      font-weight: 600;
      font-size: 0.85em;
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — Blockquotes (Medium-style: italic serif, larger)
       ═══════════════════════════════════════════════════════════════ */
    .article-content blockquote {
      margin: 2em 0;
      padding: 8px 0 8px 24px;
      border-left: 3px solid var(--border-primary);
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 1.1em;
      line-height: 1.6;
      color: var(--text-secondary);
      background: none;
      border-radius: 0;
    }

    .article-content blockquote p {
      margin-bottom: 0.5em;
    }

    .article-content blockquote p:last-child {
      margin-bottom: 0;
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — Callouts (Notion-inspired)
       ═══════════════════════════════════════════════════════════════ */
    .callout {
      margin: 1.8em 0;
      padding: 16px 20px;
      background: var(--callout-bg);
      border: 1px solid var(--callout-border);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: 0.9em;
      line-height: 1.6;
    }

    .callout p {
      margin-bottom: 0.4em;
    }

    .callout p:last-child {
      margin-bottom: 0;
    }

    .callout strong {
      color: var(--text-primary);
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — Code Blocks (warm light theme)
       ═══════════════════════════════════════════════════════════════ */
    .code-block-wrapper {
      margin: 1.8em 0;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--bg-code);
      border: 1px solid var(--border-primary);
    }

    .code-block-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: var(--bg-code-header);
      border-bottom: 1px solid var(--border-primary);
    }

    .code-lang {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .copy-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: 1px solid var(--border-primary);
      color: var(--text-tertiary);
      cursor: pointer;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      font-size: 11px;
      font-family: var(--font-sans);
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .copy-btn:hover {
      background: var(--bg-hover);
      color: var(--text-secondary);
      border-color: var(--text-tertiary);
    }

    .copy-btn.copied {
      background: #E8F5EE;
      border-color: #0B7A42;
      color: #0B7A42;
    }

    .code-block-wrapper pre {
      margin: 0;
      padding: 18px 16px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .code-block-wrapper code {
      font-family: var(--font-mono);
      font-size: 13.5px;
      line-height: 1.65;
      letter-spacing: -0.01em;
    }

    /* Highlight.js — Warm light syntax theme */
    .hljs {
      color: var(--text-primary);
      background: transparent;
    }
    .hljs-keyword  { color: #8B4ECF; }
    .hljs-string   { color: #0B7A42; }
    .hljs-comment  { color: #9B9A97; font-style: italic; }
    .hljs-function { color: #1A6BC4; }
    .hljs-title    { color: #1A6BC4; }
    .hljs-title.function_ { color: #1A6BC4; }
    .hljs-number   { color: #C75000; }
    .hljs-attr     { color: #C75000; }
    .hljs-built_in { color: #C7254E; }
    .hljs-literal  { color: #C7254E; }
    .hljs-type     { color: #C75000; }
    .hljs-variable { color: var(--text-primary); }
    .hljs-params   { color: var(--text-primary); }
    .hljs-meta     { color: #1A6BC4; }
    .hljs-tag      { color: #C7254E; }
    .hljs-name     { color: #C7254E; }
    .hljs-attribute { color: #C75000; }
    .hljs-selector-class { color: #C75000; }
    .hljs-selector-tag   { color: #C7254E; }
    .hljs-punctuation    { color: #9B9A97; }
    .hljs-property { color: #1A6BC4; }
    .hljs-addition { color: #0B7A42; }
    .hljs-deletion { color: #C7254E; }
    .hljs-regexp   { color: #8B4ECF; }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — Inline Code
       ═══════════════════════════════════════════════════════════════ */
    .inline-code {
      font-family: var(--font-mono);
      font-size: 0.85em;
      padding: 0.15em 0.45em;
      background: var(--bg-code);
      color: #C7254E;
      border-radius: var(--radius-sm);
      font-weight: 500;
      white-space: nowrap;
      border: 1px solid var(--border-primary);
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — Tables
       ═══════════════════════════════════════════════════════════════ */
    .table-wrapper {
      margin: 1.8em 0;
      overflow-x: auto;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-primary);
    }

    .article-content table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-sans);
      font-size: 0.85em;
      line-height: 1.5;
    }

    .article-content thead {
      background: var(--bg-secondary);
    }

    .article-content th {
      padding: 10px 14px;
      text-align: left;
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.8em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid var(--border-primary);
    }

    .article-content td {
      padding: 9px 14px;
      border-bottom: 1px solid var(--border-light);
      color: var(--text-primary);
    }

    .article-content tr:last-child td {
      border-bottom: none;
    }

    .article-content tbody tr:hover {
      background: var(--bg-hover);
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — Horizontal Rules
       ═══════════════════════════════════════════════════════════════ */
    .hr-wrapper {
      margin: 48px 0;
      text-align: center;
    }

    hr {
      border: none;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--border-primary), transparent);
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — Images / Figures
       ═══════════════════════════════════════════════════════════════ */
    .article-content figure {
      margin: 2em 0;
      text-align: center;
    }

    .article-content figure img {
      max-width: 100%;
      border-radius: var(--radius-sm);
    }

    .article-content figcaption {
      margin-top: 8px;
      font-size: 0.8em;
      font-family: var(--font-sans);
      color: var(--text-tertiary);
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — In-content TOC (mobile)
       ═══════════════════════════════════════════════════════════════ */
    .in-content-toc {
      display: block;
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-md);
      padding: 24px;
      margin: 0 0 40px;
      font-family: var(--font-sans);
    }

    @media (min-width: 1200px) {
      .in-content-toc {
        display: none;
      }
    }

    .in-content-toc-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-tertiary);
      margin-bottom: 14px;
    }

    .in-content-toc ol {
      list-style: none;
      counter-reset: toc-counter;
      padding: 0;
      margin: 0;
    }

    .in-content-toc li {
      counter-increment: toc-counter;
      margin-bottom: 6px;
      padding: 0;
    }

    .in-content-toc li::marker {
      content: none;
    }

    .in-content-toc a {
      display: flex;
      align-items: baseline;
      gap: 10px;
      padding: 6px 10px;
      font-size: 14px;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;
      border: none;
      font-weight: 500;
    }

    .in-content-toc a::before {
      content: counter(toc-counter);
      font-size: 11px;
      font-weight: 700;
      color: var(--accent);
      min-width: 20px;
      text-align: right;
      flex-shrink: 0;
    }

    .in-content-toc a:hover {
      background: var(--accent-light);
      color: var(--accent);
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — Desktop TOC Sidebar
       ═══════════════════════════════════════════════════════════════ */
    .page-wrapper {
      display: flex;
      justify-content: center;
      position: relative;
    }

    .toc-sidebar {
      display: none;
      position: fixed;
      left: max(20px, calc((100vw - var(--reading-max-width)) / 2 - 260px));
      top: 80px;
      width: 220px;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
    }

    @media (min-width: 1200px) {
      .toc-sidebar {
        display: block;
      }
    }

    .toc-sidebar-sticky nav ul {
      list-style: none;
      padding: 0;
    }

    .toc-sidebar-sticky nav ul li {
      margin-bottom: 2px;
    }

    .toc-sidebar-sticky nav ul li a {
      display: block;
      padding: 4px 10px;
      font-size: 13px;
      font-family: var(--font-sans);
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;
      border-left: 2px solid transparent;
    }

    .toc-sidebar-sticky nav ul li a:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .toc-sidebar-sticky nav ul li a.active {
      background: var(--accent-light);
      color: var(--accent);
      font-weight: 600;
      border-left-color: var(--accent);
    }

    .toc-sidebar-sticky nav ul li.toc-level-3 a {
      padding-left: 24px;
      font-size: 12px;
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — Back to Top
       ═══════════════════════════════════════════════════════════════ */
    .back-to-top {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--text-primary);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 100;
      font-size: 16px;
    }

    .back-to-top.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .back-to-top:hover {
      background: var(--accent);
      transform: translateY(-2px);
    }

    /* ═══════════════════════════════════════════════════════════════
       READING PAGE — Article Footer
       ═══════════════════════════════════════════════════════════════ */
    .article-footer {
      margin-top: 80px;
      padding-top: 32px;
      border-top: 1px solid var(--border-primary);
      text-align: center;
      color: var(--text-tertiary);
      font-family: var(--font-sans);
      font-size: 14px;
    }

    .article-footer p {
      margin-bottom: 4px;
    }

    /* ═══════════════════════════════════════════════════════════════
       RESPONSIVE
       ═══════════════════════════════════════════════════════════════ */
    @media (max-width: 768px) {
      .listing-container {
        padding: 48px 16px 80px;
      }

      .knowledge-card {
        padding: 16px 18px;
      }

      .topic-header {
        padding: 14px 18px;
      }

      .topic-name {
        font-size: 15px;
      }

      .reading-container {
        padding: 0 16px 80px;
      }

      .article-content {
        font-size: 18px;
      }

      .article-hero h1 {
        font-size: 1.8rem;
      }

      .code-block-wrapper pre {
        padding: 14px 10px;
      }

      .code-block-wrapper code {
        font-size: 12.5px;
      }

      .heading-anchor {
        display: none;
      }

      .back-to-top {
        bottom: 20px;
        right: 16px;
      }

      .top-nav {
        padding: 16px;
      }
    }
  </style>`;
}
