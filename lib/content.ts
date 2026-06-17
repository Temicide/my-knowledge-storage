import { readFileSync, readdirSync, statSync, type Stats } from "fs";
import path from "path";
import { parseFrontmatter, extractMetadata, extractHeadings, renderMarkdown } from "./markdown";

const knowledgeDir = path.resolve(process.cwd(), "knowledges");

export interface KnowledgeFile {
  slug: string;
  topic: string;
  title: string;
  subtitle: string;
  wordCount: number;
  readMinutes: number;
  mtime: Date;
  headings: { level: number; text: string; id: string }[];
  html: string;
}

interface RawFile {
  path: string;
  slug: string;
  topic: string;
  raw: string;
  metadata: Record<string, string>;
  body: string;
  stat: Stats;
}

function discoverFiles(dir: string, baseDir = dir): RawFile[] {
  try {
    readdirSync(dir);
  } catch {
    return [];
  }

  const entries = readdirSync(dir, { withFileTypes: true });
  const results: RawFile[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith("_")) continue;
    const fullPath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...discoverFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const raw = readFileSync(fullPath, "utf-8");
      const relPath = path.relative(baseDir, fullPath).split(path.sep).join("/");
      const slug = relPath.replace(/\.md$/, "");
      const slashIdx = slug.indexOf("/");
      const topic = slashIdx === -1 ? "General" : slug.slice(0, slashIdx);
      const stat = statSync(fullPath);
      const { metadata, body } = parseFrontmatter(raw);
      results.push({ path: fullPath, slug, topic, raw, metadata, body, stat });
    }
  }

  results.sort((a: RawFile, b: RawFile) => {
    if (a.topic === "General" && b.topic !== "General") return -1;
    if (b.topic === "General" && a.topic !== "General") return 1;
    if (a.topic !== b.topic) return a.topic.localeCompare(b.topic);
    return b.stat.mtimeMs - a.stat.mtimeMs;
  });

  return results;
}

export function getAllKnowledgeFiles(): KnowledgeFile[] {
  const rawFiles = discoverFiles(knowledgeDir);
  return rawFiles.map((f) => {
    const meta = extractMetadata(f.body, f.stat, f.slug);
    const merged = { ...meta, ...f.metadata };
    const { html } = renderMarkdown(f.body);
    const headings = extractHeadings(f.body).filter((h) => h.level <= 3);
    return {
      slug: f.slug,
      topic: f.topic,
      title: merged.title,
      subtitle: merged.subtitle,
      wordCount: merged.wordCount,
      readMinutes: merged.readMinutes,
      mtime: f.stat.mtime,
      headings,
      html,
    };
  });
}

export function getKnowledgeFileBySlug(slug: string): KnowledgeFile | null {
  const rawFiles = discoverFiles(knowledgeDir);
  const f = rawFiles.find((x) => x.slug === slug);
  if (!f) return null;
  const meta = extractMetadata(f.body, f.stat, f.slug);
  const merged = { ...meta, ...f.metadata };
  const { html } = renderMarkdown(f.body);
  const headings = extractHeadings(f.body).filter((h) => h.level <= 3);
  return {
    slug: f.slug,
    topic: f.topic,
    title: merged.title,
    subtitle: merged.subtitle,
    wordCount: merged.wordCount,
    readMinutes: merged.readMinutes,
    mtime: f.stat.mtime,
    headings,
    html,
  };
}

export function getAllSlugs(): string[] {
  return discoverFiles(knowledgeDir).map((f) => f.slug);
}
