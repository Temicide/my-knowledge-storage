import { readFileSync, writeFileSync } from 'fs';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Configure marked with syntax highlighting ──────────────────
marked.setOptions({
  gfm: true,        // GitHub Flavored Markdown
  breaks: false,    // Don't turn \n into <br>
  pedantic: false,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch {}
    }
    // Auto-detect language if none specified
    try {
      return hljs.highlightAuto(code).value;
    } catch {
      return code;
    }
  },
});

// Custom renderer for beautiful output
const renderer = new marked.Renderer();

// ── Pretty code blocks ─────────────────────────────────────────
renderer.code = function({ text, lang }) {
  let highlighted;
  if (lang && hljs.getLanguage(lang)) {
    highlighted = hljs.highlight(text, { language: lang }).value;
  } else {
    highlighted = hljs.highlightAuto(text).value;
  }
  const langLabel = lang ? `<span class="code-lang">${lang}</span>` : '';
  return `<div class="code-block-wrapper">
    <div class="code-block-header">${langLabel}<button class="copy-btn" onclick="copyCode(this)" title="Copy code"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button></div>
    <pre><code class="hljs language-${lang || ''}">${highlighted}</code></pre>
  </div>`;
};

// ── Beautiful headings ─────────────────────────────────────────
renderer.heading = function({ text, depth }) {
  const id = text.toLowerCase()
    .replace(/<[^>]*>/g, '')  // strip HTML
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  return `<h${depth} id="${id}">
    <a class="heading-anchor" href="#${id}" aria-hidden="true">#</a>
    ${text}
  </h${depth}>`;
};

// ── Styled blockquotes ─────────────────────────────────────────
renderer.blockquote = function({ tokens }) {
  const content = this.parser.parse(tokens);
  return `<blockquote>${content}</blockquote>`;
};

// ── Clean tables ───────────────────────────────────────────────
renderer.table = function({ header, rows }) {
  const headerHtml = header.map(cell => `<th>${cell.text}</th>`).join('');
  const bodyHtml = rows
    .map(row => `<tr>${row.map(cell => `<td>${cell.text}</td>`).join('')}</tr>`)
    .join('');
  return `<div class="table-wrapper"><table>
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody>
  </table></div>`;
};

// ── Inline code ────────────────────────────────────────────────
renderer.codespan = function({ text }) {
  return `<code class="inline-code">${text}</code>`;
};

// ── Images ─────────────────────────────────────────────────────
renderer.image = function({ href, title, text }) {
  return `<figure>
    <img src="${href}" alt="${text}" title="${title || ''}" loading="lazy" />
    ${text ? `<figcaption>${text}</figcaption>` : ''}
  </figure>`;
};

// ── Horizontal rules ───────────────────────────────────────────
renderer.hr = function() {
  return `<div class="hr-wrapper"><hr /></div>`;
};

// ── Links ──────────────────────────────────────────────────────
renderer.link = function({ href, title, text }) {
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener">${text}</a>`;
};

// ── Paragraphs ─────────────────────────────────────────────────
renderer.paragraph = function({ tokens }) {
  const text = this.parser.parseInline(tokens);
  // Wrap "Tip:" or "Note:" paragraphs in a callout box
  if (/^(?:> )?(?:💡 |🔑 |⚠️ |✅ )?(?:Tip:|Note:|Important:|Warning:|Key insight:)/i.test(text)) {
    return `<div class="callout">${text}</div>`;
  }
  return `<p>${text}</p>`;
};

marked.use({ renderer });

// ── Read and convert markdown ──────────────────────────────────
const mdPath = resolve(__dirname, 'ink-tutorial.md');
const markdown = readFileSync(mdPath, 'utf-8');

// Calculate reading time
const wordCount = markdown.split(/\s+/).length;
const readTime = Math.max(1, Math.ceil(wordCount / 200));

// Generate TOC from headings
const headings = [];
const tocRegex = /^(#{1,6})\s+(.+)$/gm;
let match;
while ((match = tocRegex.exec(markdown)) !== null) {
  headings.push({
    level: match[1].length,
    text: match[2].replace(/<[^>]*>/g, ''),
    id: match[2].toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-'),
  });
}

const bodyHtml = marked.parse(markdown);

// ── Build TOC HTML ─────────────────────────────────────────────
const tocHtml = headings
  .filter(h => h.level <= 3)
  .map(h => `
    <li class="toc-item toc-level-${h.level}">
      <a href="#${h.id}">${h.text}</a>
    </li>`)
  .join('');

// ── Full HTML page ─────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ink + React: Zero to Hero — Build Interactive Terminal Apps with React</title>
  <meta name="description" content="A comprehensive tutorial on building interactive terminal apps with React and Ink. From React fundamentals to a real file browser project.">
  <meta property="og:title" content="Ink + React: Zero to Hero">
  <meta property="og:description" content="Build Interactive Terminal Apps with React — from fundamentals to a real project.">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400..700;1,14..32,400..700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    /* ══════════════════════════════════════════════════════════════
       CSS RESET & BASE
       ══════════════════════════════════════════════════════════════ */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --bg: #ffffff;
      --bg-secondary: #f9fafb;
      --bg-tertiary: #f3f4f6;
      --text: #111827;
      --text-secondary: #4b5563;
      --text-tertiary: #9ca3af;
      --border: #e5e7eb;
      --border-light: #f3f4f6;
      --accent: #6366f1;
      --accent-light: #eef2ff;
      --accent-hover: #4f46e5;
      --code-bg: #1e293b;
      --code-text: #e2e8f0;
      --inline-code-bg: #f1f5f9;
      --inline-code-text: #e11d48;
      --callout-bg: #f0fdf4;
      --callout-border: #86efac;
      --callout-text: #166534;
      --toc-bg: #f8fafc;
      --toc-border: #e2e8f0;
      --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
      --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 15px -3px rgba(0,0,0,0.05);
      --radius: 8px;
      --radius-lg: 12px;
      --max-width: 740px;
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-serif: 'Merriweather', Georgia, 'Times New Roman', serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
    }

    html {
      scroll-behavior: smooth;
      scroll-padding-top: 100px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      font-family: var(--font-sans);
      background: var(--bg);
      color: var(--text);
      line-height: 1.75;
      font-size: 17px;
      letter-spacing: -0.003em;
    }

    /* ══════════════════════════════════════════════════════════════
       ARTICLE LAYOUT
       ══════════════════════════════════════════════════════════════ */

    /* ── Sidebar TOC (desktop) ──────────────────────────────── */
    .page-wrapper {
      display: flex;
      justify-content: center;
      min-height: 100vh;
    }

    .toc-sidebar {
      position: fixed;
      left: max(20px, calc((100vw - var(--max-width) - 300px) / 2 - 280px));
      top: 100px;
      width: 240px;
      max-height: calc(100vh - 140px);
      overflow-y: auto;
      display: none;
    }

    @media (min-width: 1400px) {
      .toc-sidebar {
        display: block;
      }
    }

    .toc-sidebar-sticky {
      background: var(--toc-bg);
      border: 1px solid var(--toc-border);
      border-radius: var(--radius-lg);
      padding: 20px;
    }

    .toc-sidebar-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-tertiary);
      margin-bottom: 12px;
    }

    .toc-sidebar nav ul {
      list-style: none;
      padding: 0;
    }

    .toc-sidebar nav ul li {
      margin-bottom: 4px;
    }

    .toc-sidebar nav ul li a {
      display: block;
      padding: 4px 8px;
      font-size: 13px;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.15s ease;
      border-left: 2px solid transparent;
    }

    .toc-sidebar nav ul li a:hover {
      background: var(--accent-light);
      color: var(--accent);
    }

    .toc-sidebar nav ul li a.active {
      background: var(--accent-light);
      color: var(--accent);
      font-weight: 600;
      border-left-color: var(--accent);
    }

    .toc-sidebar nav ul li.toc-level-3 a { padding-left: 24px; font-size: 12px; }

    /* ── Main content ───────────────────────────────────────── */
    .article-container {
      width: 100%;
      max-width: var(--max-width);
      padding: 60px 24px 120px;
    }

    /* ── Cover / Hero ───────────────────────────────────────── */
    .article-cover {
      margin-bottom: 48px;
      padding-bottom: 40px;
      border-bottom: 1px solid var(--border);
    }

    .article-cover-overline {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin-bottom: 16px;
    }

    .article-cover h1 {
      font-family: var(--font-serif);
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 16px;
      color: var(--text);
    }

    .article-cover-subtitle {
      font-size: 1.2rem;
      color: var(--text-secondary);
      line-height: 1.6;
      max-width: 600px;
    }

    .article-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 28px;
      color: var(--text-tertiary);
      font-size: 14px;
    }

    .article-meta-dot {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--text-tertiary);
    }

    .article-meta strong {
      color: var(--text-secondary);
      font-weight: 600;
    }

    /* ══════════════════════════════════════════════════════════════
       CONTENT STYLES
       ══════════════════════════════════════════════════════════════ */

    .article-content h1,
    .article-content h2,
    .article-content h3,
    .article-content h4,
    .article-content h5,
    .article-content h6 {
      font-family: var(--font-sans);
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text);
      position: relative;
      line-height: 1.3;
    }

    .article-content h1 { font-size: 1.75rem; margin: 56px 0 20px; }
    .article-content h2 { font-size: 1.5rem; margin: 48px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border-light); }
    .article-content h3 { font-size: 1.25rem; margin: 40px 0 12px; }
    .article-content h4 { font-size: 1.1rem; margin: 32px 0 10px; }

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

    .article-content p {
      margin-bottom: 1.35em;
      color: var(--text);
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
      color: #0f172a;
    }

    .article-content ul,
    .article-content ol {
      margin: 0.8em 0 1.5em;
      padding-left: 1.6em;
      color: var(--text);
    }

    .article-content li {
      margin-bottom: 0.35em;
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

    /* ══════════════════════════════════════════════════════════════
       CODE BLOCKS
       ══════════════════════════════════════════════════════════════ */

    .code-block-wrapper {
      margin: 1.8em 0;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--code-bg);
      box-shadow: var(--shadow-md);
      border: 1px solid #334155;
    }

    .code-block-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: #0f172a;
      border-bottom: 1px solid #334155;
    }

    .code-lang {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .copy-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: 1px solid #475569;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-family: var(--font-sans);
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .copy-btn:hover {
      background: #1e293b;
      color: #e2e8f0;
      border-color: #64748b;
    }

    .copy-btn.copied {
      background: #065f46;
      border-color: #059669;
      color: #6ee7b7;
    }

    .code-block-wrapper pre {
      margin: 0;
      padding: 20px 16px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .code-block-wrapper code {
      font-family: var(--font-mono);
      font-size: 13.5px;
      line-height: 1.65;
      letter-spacing: -0.01em;
    }

    /* Highlight.js theme overrides — Night Owl inspired */
    .hljs {
      color: #d6deeb;
      background: transparent;
    }
    .hljs-keyword  { color: #c792ea; font-style: italic; }
    .hljs-string   { color: #ecc48d; }
    .hljs-comment  { color: #637777; font-style: italic; }
    .hljs-function { color: #82aaff; }
    .hljs-title    { color: #82aaff; }
    .hljs-title.function_ { color: #82aaff; }
    .hljs-number   { color: #f78c6c; }
    .hljs-attr     { color: #ffcb8b; }
    .hljs-built_in { color: #ff5874; }
    .hljs-literal  { color: #ff5874; }
    .hljs-type     { color: #ffcb8b; }
    .hljs-variable { color: #d6deeb; }
    .hljs-params   { color: #d6deeb; }
    .hljs-meta     { color: #82aaff; }
    .hljs-tag      { color: #ff5874; }
    .hljs-name     { color: #ff5874; }
    .hljs-attribute { color: #ffcb8b; }
    .hljs-selector-class { color: #ffcb8b; }
    .hljs-selector-tag   { color: #ff5874; }
    .hljs-punctuation    { color: #637777; }
    .hljs-property { color: #80cbc4; }
    .hljs-addition { color: #addb67; }
    .hljs-deletion { color: #ef5350; }

    /* ══════════════════════════════════════════════════════════════
       INLINE CODE
       ══════════════════════════════════════════════════════════════ */

    .inline-code {
      font-family: var(--font-mono);
      font-size: 0.875em;
      padding: 0.15em 0.45em;
      background: var(--inline-code-bg);
      color: var(--inline-code-text);
      border-radius: 4px;
      font-weight: 500;
      white-space: nowrap;
      border: 1px solid #e2e8f0;
    }

    /* ══════════════════════════════════════════════════════════════
       BLOCKQUOTES
       ══════════════════════════════════════════════════════════════ */

    .article-content blockquote {
      margin: 1.8em 0;
      padding: 16px 20px;
      border-left: 4px solid var(--accent);
      background: var(--accent-light);
      border-radius: 0 var(--radius) var(--radius) 0;
      color: #4338ca;
    }

    .article-content blockquote p {
      margin-bottom: 0.5em;
    }

    .article-content blockquote p:last-child {
      margin-bottom: 0;
    }

    /* ══════════════════════════════════════════════════════════════
       CALLOUTS
       ══════════════════════════════════════════════════════════════ */

    .callout {
      margin: 1.8em 0;
      padding: 18px 22px;
      background: var(--callout-bg);
      border: 1px solid var(--callout-border);
      border-radius: var(--radius-lg);
      color: var(--callout-text);
      font-size: 0.95em;
      position: relative;
    }

    .callout p {
      margin-bottom: 0.4em;
    }

    .callout p:last-child {
      margin-bottom: 0;
    }

    .callout strong {
      color: #15803d;
    }

    /* ══════════════════════════════════════════════════════════════
       TABLES
       ══════════════════════════════════════════════════════════════ */

    .table-wrapper {
      margin: 1.8em 0;
      overflow-x: auto;
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }

    .article-content table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9em;
    }

    .article-content thead {
      background: var(--bg-secondary);
    }

    .article-content th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 650;
      color: var(--text-secondary);
      font-size: 0.8em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid var(--border);
    }

    .article-content td {
      padding: 10px 16px;
      border-bottom: 1px solid var(--border-light);
      color: var(--text);
    }

    .article-content tr:last-child td {
      border-bottom: none;
    }

    .article-content tbody tr:hover {
      background: var(--bg-secondary);
    }

    /* ══════════════════════════════════════════════════════════════
       HORIZONTAL RULES
       ══════════════════════════════════════════════════════════════ */

    .hr-wrapper {
      margin: 48px 0;
      text-align: center;
    }

    hr {
      border: none;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--border), transparent);
    }

    /* ══════════════════════════════════════════════════════════════
       IMAGES / FIGURES
       ══════════════════════════════════════════════════════════════ */

    .article-content figure {
      margin: 2em 0;
      text-align: center;
    }

    .article-content figure img {
      max-width: 100%;
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
    }

    .article-content figcaption {
      margin-top: 8px;
      font-size: 0.85em;
      color: var(--text-tertiary);
      font-style: italic;
    }

    /* ══════════════════════════════════════════════════════════════
       MOBILE TOC (in-content)
       ══════════════════════════════════════════════════════════════ */

    .in-content-toc {
      display: block;
      background: var(--toc-bg);
      border: 1px solid var(--toc-border);
      border-radius: var(--radius-lg);
      padding: 24px;
      margin: 0 0 48px;
    }

    @media (min-width: 1400px) {
      .in-content-toc {
        display: none;
      }
    }

    .in-content-toc-title {
      font-size: 13px;
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
      border-radius: 6px;
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

    /* ══════════════════════════════════════════════════════════════
       BACK TO TOP
       ══════════════════════════════════════════════════════════════ */

    .back-to-top {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--text);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-md);
      z-index: 100;
      font-size: 18px;
    }

    .back-to-top.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .back-to-top:hover {
      background: var(--accent);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
    }

    /* ══════════════════════════════════════════════════════════════
       FOOTER
       ══════════════════════════════════════════════════════════════ */

    .article-footer {
      margin-top: 80px;
      padding-top: 32px;
      border-top: 1px solid var(--border);
      text-align: center;
      color: var(--text-tertiary);
      font-size: 14px;
    }

    .article-footer p {
      margin-bottom: 4px;
    }

    /* ══════════════════════════════════════════════════════════════
       SCROLLBAR
       ══════════════════════════════════════════════════════════════ */

    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

    /* ══════════════════════════════════════════════════════════════
       SELECTION
       ══════════════════════════════════════════════════════════════ */

    ::selection {
      background: #d9d5ff;
      color: var(--text);
    }

    /* ══════════════════════════════════════════════════════════════
       RESPONSIVE
       ══════════════════════════════════════════════════════════════ */

    @media (max-width: 768px) {
      .article-container {
        padding: 32px 16px 80px;
      }
      .article-content {
        font-size: 16px;
      }
      .code-block-wrapper pre {
        padding: 16px 12px;
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
    }
  </style>
</head>
<body>
  <div class="page-wrapper">
    <!-- Desktop TOC Sidebar -->
    <aside class="toc-sidebar">
      <div class="toc-sidebar-sticky">
        <div class="toc-sidebar-title">Contents</div>
        <nav>
          <ul>${tocHtml}</ul>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="article-container">
      <article>
        <!-- Hero Section -->
        <header class="article-cover">
          <div class="article-cover-overline">Tutorial</div>
          <h1>Ink + React:<br>Zero to Hero</h1>
          <p class="article-cover-subtitle">Build Interactive Terminal Apps with React — from fundamentals to a real file browser project.</p>
          <div class="article-meta">
            <span><strong>Temicide</strong></span>
            <span class="article-meta-dot"></span>
            <span>${readTime} min read</span>
            <span class="article-meta-dot"></span>
            <span>~${wordCount.toLocaleString()} words</span>
          </div>
        </header>

        <!-- In-content TOC (mobile) -->
        <nav class="in-content-toc">
          <div class="in-content-toc-title">Table of Contents</div>
          <ol>${headings.filter(h => h.level <= 3).map(h => `<li><a href="#${h.id}">${h.text}</a></li>`).join('')}</ol>
        </nav>

        <!-- Rendered Content -->
        <div class="article-content">
          ${bodyHtml}
        </div>

        <!-- Footer -->
        <footer class="article-footer">
          <p><strong>Happy hacking, Temicide. Build something cool.</strong> 🌈</p>
          <p>Generated with ♥ from ink-tutorial.md</p>
        </footer>
      </article>
    </main>
  </div>

  <!-- Back to Top Button -->
  <button class="back-to-top" id="backToTop" title="Back to top" aria-label="Back to top">↑</button>

  <script>
    // ── Copy code button ────────────────────────────────────────
    window.copyCode = function(btn) {
      const code = btn.closest('.code-block-wrapper').querySelector('code').innerText;
      navigator.clipboard.writeText(code).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        }, 2000);
      });
    };

    // ── Back to top button ──────────────────────────────────────
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ── Active TOC link highlighting ────────────────────────────
    const tocLinks = document.querySelectorAll('.toc-sidebar a');
    const headings = document.querySelectorAll('.article-content h1, .article-content h2, .article-content h3, .article-content h4');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px' });

    headings.forEach(h => observer.observe(h));
  </script>
</body>
</html>`;

// ── Write output ────────────────────────────────────────────────
const outPath = resolve(__dirname, 'index.html');
writeFileSync(outPath, html, 'utf-8');
console.log(`✅ Built: ${outPath}`);
console.log(`   ${Math.round(Buffer.byteLength(html, 'utf-8') / 1024)} KB — ${wordCount.toLocaleString()} words — ~${readTime} min read`);
