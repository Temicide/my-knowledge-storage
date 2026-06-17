import { marked } from "marked";
import hljs from "highlight.js";

export function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { metadata: {} as Record<string, string>, body: raw };
  const frontmatterBlock = match[1];
  const body = raw.slice(match[0].length);
  const metadata: Record<string, string> = {};
  for (const line of frontmatterBlock.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    metadata[key] = value;
  }
  return { metadata, body };
}

export function extractMetadata(body: string, stat: { mtime: Date }, slug: string) {
  const h1Match = body.match(/^#\s+(.+)$/m);
  const title = h1Match
    ? h1Match[1].replace(/<[^>]*>/g, "").trim()
    : slug.replace(/-/g, " ");

  const h3Match = body.match(/^###\s+(.+)$/m);
  const subtitle = h3Match ? h3Match[1].replace(/<[^>]*>/g, "").trim() : "";

  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 225));

  return { title, subtitle, wordCount, readMinutes, mtime: stat.mtime };
}

export function extractHeadings(markdown: string) {
  const headings: { level: number; text: string; id: string }[] = [];
  const regex = /^(#{1,6})\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].replace(/<[^>]*>/g, ""),
      id: match[2]
        .toLowerCase()
        .replace(/<[^>]*>/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-"),
    });
  }
  return headings;
}

function createRenderer() {
  const renderer = new marked.Renderer();

  (renderer as any).code = function ({ text, lang }: { text: string; lang?: string }) {
    let highlighted: string;
    if (lang && hljs.getLanguage(lang)) {
      highlighted = hljs.highlight(text, { language: lang }).value;
    } else {
      highlighted = hljs.highlightAuto(text).value;
    }
    const langLabel = lang ? `<span class="code-lang">${lang}</span>` : "";
    return `<div class="code-block-wrapper">
      <div class="code-block-header">${langLabel}<button class="copy-btn" title="Copy code"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button></div>
      <pre><code class="hljs language-${lang || ""}">${highlighted}</code></pre>
    </div>`;
  };

  (renderer as any).heading = function ({ text, depth }: { text: string; depth: number }) {
    const id = text
      .toLowerCase()
      .replace(/<[^>]*>/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return `<h${depth} id="${id}">
      <a class="heading-anchor" href="#${id}" aria-hidden="true">#</a>
      ${text}
    </h${depth}>`;
  };

  (renderer as any).blockquote = function ({ tokens }: { tokens: any[] }) {
    const parser = (this as any).parser;
    const content = parser.parse(tokens);
    return `<blockquote>${content}</blockquote>`;
  };

  (renderer as any).table = function ({ header, rows }: { header: any[]; rows: any[][] }) {
    const headerHtml = header.map((cell) => `<th>${cell.text}</th>`).join("");
    const bodyHtml = rows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${cell.text}</td>`).join("")}</tr>`,
      )
      .join("");
    return `<div class="table-wrapper"><table>
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${bodyHtml}</tbody>
    </table></div>`;
  };

  (renderer as any).codespan = function ({ text }: { text: string }) {
    return `<code class="inline-code">${text}</code>`;
  };

  (renderer as any).image = function ({ href, title, text }: { href: string; title?: string; text: string }) {
    return `<figure>
      <img src="${href}" alt="${text}" title="${title || ""}" loading="lazy" />
      ${text ? `<figcaption>${text}</figcaption>` : ""}
    </figure>`;
  };

  (renderer as any).hr = function () {
    return `<div class="hr-wrapper"><hr /></div>`;
  };

  (renderer as any).link = function ({ href, title, text }: { href: string; title?: string; text: string }) {
    const titleAttr = title ? ` title="${title}"` : "";
    const isExternal = /^https?:\/\//.test(href);
    const targetAttr = isExternal ? ' target="_blank" rel="noopener"' : "";
    return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`;
  };

  (renderer as any).paragraph = function ({ tokens }: { tokens: any[] }) {
    const parser = (this as any).parser;
    const text = parser.parseInline(tokens);
    if (
      /^(?:> )?(?:\u{1F4A1} |\u{1F511} |\u{26A0}\u{FE0F} |\u{2705} )?(?:Tip:|Note:|Important:|Warning:|Key insight:)/iu.test(
        text,
      )
    ) {
      return `<div class="callout">${text}</div>`;
    }
    return `<p>${text}</p>`;
  };

  return renderer;
}

export function renderMarkdown(body: string) {
  marked.setOptions({ gfm: true, breaks: false, pedantic: false });
  marked.use({ renderer: createRenderer() });
  return { html: marked.parse(body) as string };
}
