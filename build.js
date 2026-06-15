import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync, rmSync } from 'fs';
import { resolve, dirname, join, basename, relative, sep } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { generateCSS } from './css.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const knowledgeDir = resolve(__dirname, 'knowledges');
const distDir = resolve(__dirname, 'dist');
const knowledgeDistDir = join(distDir, 'knowledge');

// ── Frontmatter parser (simple key: value, no new dependency) ────
function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { metadata: {}, body: raw };
  const frontmatterBlock = match[1];
  const body = raw.slice(match[0].length);
  const metadata = {};
  for (const line of frontmatterBlock.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    metadata[key] = value;
  }
  return { metadata, body };
}

// ── Extract metadata from markdown body ───────────────────────────
function extractMetadata(body, stat, slug) {
  const h1Match = body.match(/^#\s+(.+)$/m);
  const title = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').trim() : slug.replace(/-/g, ' ');

  const h3Match = body.match(/^###\s+(.+)$/m);
  const subtitle = h3Match ? h3Match[1].replace(/<[^>]*>/g, '').trim() : '';

  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 225));

  return { title, subtitle, wordCount, readMinutes, mtime: stat.mtime };
}

// ── Extract headings for TOC ──────────────────────────────────────
function extractHeadings(markdown) {
  const headings = [];
  const regex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].replace(/<[^>]*>/g, ''),
      id: match[2].toLowerCase()
        .replace(/<[^>]*>/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-'),
    });
  }
  return headings;
}

// ── Configure marked ──────────────────────────────────────────────
function createRenderer() {
  const renderer = new marked.Renderer();

  // Code blocks — warm light style
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

  // Headings with anchor links
  renderer.heading = function({ text, depth }) {
    const id = text.toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    return `<h${depth} id="${id}">
      <a class="heading-anchor" href="#${id}" aria-hidden="true">#</a>
      ${text}
    </h${depth}>`;
  };

  // Blockquotes
  renderer.blockquote = function({ tokens }) {
    const content = this.parser.parse(tokens);
    return `<blockquote>${content}</blockquote>`;
  };

  // Tables
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

  // Inline code
  renderer.codespan = function({ text }) {
    return `<code class="inline-code">${text}</code>`;
  };

  // Images
  renderer.image = function({ href, title, text }) {
    return `<figure>
      <img src="${href}" alt="${text}" title="${title || ''}" loading="lazy" />
      ${text ? `<figcaption>${text}</figcaption>` : ''}
    </figure>`;
  };

  // Horizontal rules
  renderer.hr = function() {
    return `<div class="hr-wrapper"><hr /></div>`;
  };

  // Links — external links open in new tab
  renderer.link = function({ href, title, text }) {
    const titleAttr = title ? ` title="${title}"` : '';
    const isExternal = /^https?:\/\//.test(href);
    const targetAttr = isExternal ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`;
  };

  // Paragraphs with callout detection
  renderer.paragraph = function({ tokens }) {
    const text = this.parser.parseInline(tokens);
    if (/^(?:> )?(?:💡 |🔑 |⚠️ |✅ )?(?:Tip:|Note:|Important:|Warning:|Key insight:)/i.test(text)) {
      return `<div class="callout">${text}</div>`;
    }
    return `<p>${text}</p>`;
  };

  return renderer;
}

// ── File discovery (recursive) ─────────────────────────────────────
function discoverFiles(dir, baseDir = dir) {
  if (!existsSync(dir)) return [];

  const entries = readdirSync(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue;

    const fullPath = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...discoverFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const raw = readFileSync(fullPath, 'utf-8');
      const relPath = relative(baseDir, fullPath).split(sep).join('/');
      const slug = relPath.replace(/\.md$/, '');
      // Topic = first directory component, or "General" for root files
      const slashIdx = slug.indexOf('/');
      const topic = slashIdx === -1 ? 'General' : slug.slice(0, slashIdx);
      const stat = statSync(fullPath);
      const { metadata, body } = parseFrontmatter(raw);
      results.push({ path: fullPath, slug, topic, raw, metadata, body, stat });
    }
  }

  // Sort: "General" first, then alpha by topic, within topic by mtime desc
  results.sort((a, b) => {
    if (a.topic === 'General' && b.topic !== 'General') return -1;
    if (b.topic === 'General' && a.topic !== 'General') return 1;
    if (a.topic !== b.topic) return a.topic.localeCompare(b.topic);
    return b.stat.mtimeMs - a.stat.mtimeMs;
  });

  return results;
}

// ── Render a single knowledge card ─────────────────────────────────
function renderCard(file) {
  const meta = extractMetadata(file.body, file.stat, file.slug);
  const merged = { ...meta, ...file.metadata };
  return `
    <a href="/knowledge/${file.slug}" class="knowledge-card">
      <div class="card-content">
        <h2 class="card-title">${esc(merged.title)}</h2>
        ${merged.subtitle ? `<p class="card-subtitle">${esc(merged.subtitle)}</p>` : ''}
        <div class="card-meta">
          <span>${merged.wordCount.toLocaleString()} words</span>
          <span class="meta-sep">·</span>
          <span>${merged.readMinutes} min read</span>
          <span class="meta-sep">·</span>
          <span class="read-indicator unread" data-slug="${file.slug}">
            <span class="indicator-dot"></span>
            <span class="indicator-label">Unread</span>
          </span>
        </div>
      </div>
      <span class="card-arrow">→</span>
    </a>`;
}

// ── Generate listing page with topic sections ──────────────────────
function generateListingPage(files) {
  // Group files by topic (files already sorted: General first, alpha, mtime desc)
  const topics = new Map();
  for (const f of files) {
    if (!topics.has(f.topic)) topics.set(f.topic, []);
    topics.get(f.topic).push(f);
  }

  const bodyHtml = files.length === 0
    ? `<div class="empty-state">
        <p>No knowledge files yet.</p>
        <p class="hint">Add <code>.md</code> files to <code>knowledges/</code> directory or topic folders inside it.</p>
      </div>`
    : [...topics.entries()].map(([topic, topicFiles]) => `
      <section class="topic-section" data-topic="${esc(topic)}">
        <button class="topic-header" onclick="toggleTopic(this)" aria-expanded="true">
          <span class="topic-name">${esc(topic)}</span>
          <span class="topic-meta">
            <span class="topic-count">${topicFiles.length} file${topicFiles.length !== 1 ? 's' : ''}</span>
            <span class="topic-toggle" aria-hidden="true">▾</span>
          </span>
        </button>
        <div class="topic-cards">
          ${topicFiles.map(renderCard).join('\n')}
        </div>
      </section>`).join('\n');

  const css = generateCSS({ page: 'listing' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Knowledge Base</title>
  <meta name="description" content="Personal knowledge base — notes, tutorials, and references.">
  ${css}
</head>
<body>
  <main class="listing-container">
    <header class="listing-header">
      <h1>Knowledge Base</h1>
      <p class="subtitle">Personal notes, tutorials, and references. Browse by topic, track your progress as you go.</p>
      <div class="progress-summary">
        <span class="progress-label"><span id="readCount">0</span> of <span id="totalCount">${files.length}</span> read</span>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="progressFill"></div>
        </div>
      </div>
    </header>

    <div class="topic-list">
      ${bodyHtml}
    </div>

    <footer class="listing-footer">
      <p>Add <code>.md</code> files to <code>knowledges/</code> — organized in topic folders, they appear here automatically.</p>
    </footer>
  </main>

  <script>
    (function() {
      const READ_KEY = 'knowledge-read-status';
      const COLLAPSE_KEY = 'knowledge-topic-collapse';

      // ── Toggle topic collapse ────────────────────────────────────
      window.toggleTopic = function(header) {
        var section = header.closest('.topic-section');
        var cards = section.querySelector('.topic-cards');
        var isCollapsed = cards.classList.toggle('collapsed');
        header.setAttribute('aria-expanded', String(!isCollapsed));

        var collapsed = {};
        try { collapsed = JSON.parse(localStorage.getItem(COLLAPSE_KEY)) || {}; } catch(e) {}
        if (isCollapsed) collapsed[section.dataset.topic] = true;
        else delete collapsed[section.dataset.topic];
        localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed));
      };

      // ── Restore collapsed state ──────────────────────────────────
      var collapsed = {};
      try { collapsed = JSON.parse(localStorage.getItem(COLLAPSE_KEY)) || {}; } catch(e) {}
      document.querySelectorAll('.topic-section').forEach(function(section) {
        if (collapsed[section.dataset.topic]) {
          section.querySelector('.topic-cards').classList.add('collapsed');
          section.querySelector('.topic-header').setAttribute('aria-expanded', 'false');
        }
      });

      // ── Read status tracking ─────────────────────────────────────
      function getReadStatus() {
        try { return JSON.parse(localStorage.getItem(READ_KEY)) || {}; }
        catch { return {}; }
      }

      function updateUI() {
        var status = getReadStatus();
        var indicators = document.querySelectorAll('.read-indicator');
        var readCount = 0;

        indicators.forEach(function(el) {
          var slug = el.dataset.slug;
          var isRead = !!status[slug];
          if (isRead) readCount++;

          el.classList.toggle('read', isRead);
          el.classList.toggle('unread', !isRead);
          var label = el.querySelector('.indicator-label');
          if (label) label.textContent = isRead ? 'Read' : 'Unread';
        });

        var total = indicators.length;
        document.getElementById('readCount').textContent = readCount;
        document.getElementById('totalCount').textContent = total;
        document.getElementById('progressFill').style.width = total ? (readCount / total) * 100 + '%' : '0%';
      }

      updateUI();
    })();
  </script>
</body>
</html>`;
}

// ── Generate reading page ─────────────────────────────────────────
function generateReadingPage(file, allFiles) {
  const { body, slug } = file;
  const meta = extractMetadata(body, file.stat, file.slug);
  const merged = { ...meta, ...file.metadata };

  // Parse markdown
  marked.setOptions({ gfm: true, breaks: false, pedantic: false });
  marked.use({ renderer: createRenderer() });
  const bodyHtml = marked.parse(body);

  // TOC from headings
  const headings = extractHeadings(body).filter(h => h.level <= 3);
  const tocHtml = headings
    .map(h => `<li class="toc-item toc-level-${h.level}"><a href="#${h.id}">${esc(h.text)}</a></li>`)
    .join('\n');

  const formattedDate = merged.mtime.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const css = generateCSS({ page: 'reading' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(merged.title)} — Knowledge Base</title>
  <meta name="description" content="${esc(merged.subtitle || merged.title)}">
  <meta property="og:title" content="${esc(merged.title)}">
  <meta property="og:description" content="${esc(merged.subtitle || merged.title)}">
  <meta property="og:type" content="article">
  ${css}
</head>
<body>
  <div class="reading-progress" id="readingProgress"></div>

  <nav class="top-nav">
    <a href="/" class="nav-back">← Knowledge Base</a>
    <span class="nav-meta">${merged.readMinutes} min read</span>
  </nav>

  <div class="page-wrapper">
    <!-- Desktop TOC Sidebar -->
    <aside class="toc-sidebar">
      <div class="toc-sidebar-sticky">
        <nav>
          <ul>${tocHtml}</ul>
        </nav>
      </div>
    </aside>

    <main class="reading-container">
      <article>
        <header class="article-hero">
          <h1>${esc(merged.title)}</h1>
          ${merged.subtitle ? `<p class="article-subtitle">${esc(merged.subtitle)}</p>` : ''}
          <div class="article-meta">
            <span>${merged.wordCount.toLocaleString()} words</span>
            <span class="meta-sep">·</span>
            <span>${merged.readMinutes} min read</span>
            <span class="meta-sep">·</span>
            <span>${formattedDate}</span>
          </div>
        </header>

        <!-- In-content TOC (mobile) -->
        <nav class="in-content-toc">
          <div class="in-content-toc-title">Contents</div>
          <ol>${headings.map(h => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('\n')}</ol>
        </nav>

        <!-- Rendered Content -->
        <div class="article-content">
          ${bodyHtml}
        </div>

        <footer class="article-footer">
          <p>Part of <a href="/">Knowledge Base</a></p>
        </footer>
      </article>
    </main>
  </div>

  <button class="back-to-top" id="backToTop" title="Back to top" aria-label="Back to top">↑</button>

  <script>
    var PAGE_SLUG = '${slug}';

    // ── Copy code button ──────────────────────────────────────────
    window.copyCode = function(btn) {
      var code = btn.closest('.code-block-wrapper').querySelector('code').innerText;
      navigator.clipboard.writeText(code).then(function() {
        btn.classList.add('copied');
        var original = btn.innerHTML;
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        setTimeout(function() {
          btn.classList.remove('copied');
          btn.innerHTML = original;
        }, 2000);
      });
    };

    // ── Reading progress bar ──────────────────────────────────────
    var progressBar = document.getElementById('readingProgress');
    var marked = false;

    window.addEventListener('scroll', function() {
      var scrollH = document.documentElement.scrollHeight - window.innerHeight;
      var percent = scrollH > 0 ? window.scrollY / scrollH : 0;
      progressBar.style.setProperty('--progress', Math.min(percent, 1));
      progressBar.querySelector('::after') || progressBar;

      // Update the pseudo-element scale via inline style
      var after = progressBar.style;
      // Use CSS custom property fallback approach
      progressBar.style.background = 'linear-gradient(to right, var(--accent, #2383E2) ' + (percent * 100) + '%, transparent ' + (percent * 100) + '%)';

      // Auto-mark as read at 80% scroll
      if (percent > 0.8 && !marked) {
        markAsRead(PAGE_SLUG);
        marked = true;
      }
    });

    // ── Read tracking ─────────────────────────────────────────────
    function markAsRead(slug) {
      var status = {};
      try { status = JSON.parse(localStorage.getItem('knowledge-read-status')) || {}; } catch(e) {}
      status[slug] = true;
      localStorage.setItem('knowledge-read-status', JSON.stringify(status));
    }

    // ── Back to top ───────────────────────────────────────────────
    var backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ── TOC scroll spy ────────────────────────────────────────────
    var tocLinks = document.querySelectorAll('.toc-sidebar a');
    var contentHeadings = document.querySelectorAll('.article-content h1, .article-content h2, .article-content h3, .article-content h4');

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            tocLinks.forEach(function(link) {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      }, { rootMargin: '-80px 0px -70% 0px' });

      contentHeadings.forEach(function(h) { observer.observe(h); });
    }
  </script>
</body>
</html>`;
}

// ── HTML escape utility ───────────────────────────────────────────
function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Clean stale HTML files (recursive) ────────────────────────────
function cleanStale(dir, existingSlugs, baseDir) {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      cleanStale(fullPath, existingSlugs, baseDir);
      // Remove empty directories left behind
      try {
        if (readdirSync(fullPath).length === 0) rmSync(fullPath);
      } catch {}
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const relPath = relative(baseDir, fullPath).split(sep).join('/');
      const slug = relPath.replace(/\.html$/, '');
      if (!existingSlugs.has(slug)) {
        rmSync(fullPath);
        console.log(`🧹 Removed stale: knowledge/${slug}.html`);
      }
    }
  }
}

// ── Main build ────────────────────────────────────────────────────
function build() {
  const files = discoverFiles(knowledgeDir);
  console.log(`📂 Found ${files.length} knowledge file(s)`);

  // Ensure output directories exist
  if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });
  if (!existsSync(knowledgeDistDir)) mkdirSync(knowledgeDistDir, { recursive: true });

  // Clean stale HTML files from previous builds (recursive)
  const existingSlugs = new Set(files.map(f => f.slug));
  cleanStale(knowledgeDistDir, existingSlugs, knowledgeDistDir);

  // Generate listing page
  const listingHtml = generateListingPage(files);
  const listingPath = join(distDir, 'index.html');
  writeFileSync(listingPath, listingHtml, 'utf-8');
  const listingSize = Math.round(Buffer.byteLength(listingHtml, 'utf-8') / 1024);
  console.log(`✅ ${listingPath} (${listingSize} KB)`);

  // Generate reading pages
  for (const file of files) {
    const readingHtml = generateReadingPage(file, files);
    const outPath = join(knowledgeDistDir, `${file.slug}.html`);
    // Ensure parent directories exist for nested slugs
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, readingHtml, 'utf-8');
    const size = Math.round(Buffer.byteLength(readingHtml, 'utf-8') / 1024);
    const meta = extractMetadata(file.body, file.stat, file.slug);
    console.log(`✅ ${outPath} (${size} KB — ${meta.wordCount.toLocaleString()} words, ${meta.readMinutes} min read)`);
  }

  console.log(`\n🏗️  Build complete — ${files.length + 1} page(s) in dist/`);
}

build();
