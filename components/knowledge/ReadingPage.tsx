"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { KnowledgeFile } from "@/lib/content";
import { markAsRead } from "@/lib/read-status";

interface ReadingPageProps {
  file: KnowledgeFile;
}

export function ReadingPage({ file }: ReadingPageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const backToTopRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const content = contentRef.current;
    const progressBar = progressRef.current;
    const backToTop = backToTopRef.current;
    let marked = false;

    // ── Copy code button ──────────────────────────────────────────
    const copyButtons = content.querySelectorAll<HTMLButtonElement>(".copy-btn");
    copyButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const codeEl = btn
          .closest(".code-block-wrapper")
          ?.querySelector("code");
        if (!codeEl) return;
        navigator.clipboard.writeText(codeEl.textContent || "").then(() => {
          btn.classList.add("copied");
          const original = btn.innerHTML;
          btn.innerHTML =
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
          setTimeout(() => {
            btn.classList.remove("copied");
            btn.innerHTML = original;
          }, 2000);
        });
      });
    });

    // ── Reading progress + auto-mark-read ────────────────────────
    function onScroll() {
      const scrollH =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollH > 0 ? window.scrollY / scrollH : 0;

      if (progressBar) {
        progressBar.style.background = `linear-gradient(to right, #2383E2 ${percent * 100}%, transparent ${percent * 100}%)`;
      }

      if (percent > 0.8 && !marked) {
        markAsRead(file.slug);
        marked = true;
      }

      if (backToTop) {
        if (window.scrollY > 400) {
          backToTop.classList.add("visible");
        } else {
          backToTop.classList.remove("visible");
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ── Back to top ──────────────────────────────────────────────
    backToTop?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ── TOC scroll spy ───────────────────────────────────────────
    const tocLinks = document.querySelectorAll<HTMLAnchorElement>(".toc-sidebar a");
    const headings = content.querySelectorAll<HTMLElement>("h1, h2, h3, h4");

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id;
              tocLinks.forEach((link) => {
                link.classList.toggle(
                  "active",
                  link.getAttribute("href") === "#" + id,
                );
              });
            }
          });
        },
        { rootMargin: "-80px 0px -70% 0px" },
      );
      headings.forEach((h) => observer!.observe(h));
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, [file.slug]);

  const formattedDate = file.mtime.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="reading-progress" ref={progressRef} />

      <nav className="top-nav">
        <Link href="/" className="nav-back">
          ← Knowledge Base
        </Link>
        <span className="nav-meta">{file.readMinutes} min read</span>
      </nav>

      <div className="page-wrapper">
        {/* Desktop TOC Sidebar */}
        <aside className="toc-sidebar">
          <div className="toc-sidebar-sticky">
            <nav>
              <ul>
                {file.headings.map((h) => (
                  <li key={h.id} className={`toc-level-${h.level}`}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <main className="reading-container">
          <article>
            <header className="article-hero">
              <span className="article-kicker">{file.topic}</span>
              <h1>{file.title}</h1>
              {file.subtitle && (
                <p className="article-subtitle">{file.subtitle}</p>
              )}
              <div className="article-meta">
                <span>{file.wordCount.toLocaleString()} words</span>
                <span className="meta-sep">·</span>
                <span>{file.readMinutes} min read</span>
                <span className="meta-sep">·</span>
                <span>{formattedDate}</span>
              </div>
            </header>

            {/* In-content TOC (mobile) */}
            <nav className="in-content-toc">
              <div className="in-content-toc-title">Contents</div>
              <ol>
                {file.headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>

            <div
              className="article-content"
              ref={contentRef}
              dangerouslySetInnerHTML={{ __html: file.html }}
            />

            <footer className="article-footer">
              <p>
                Part of <Link href="/">Knowledge Base</Link>
              </p>
            </footer>
          </article>
        </main>
      </div>

      <button
        className="back-to-top"
        ref={backToTopRef}
        title="Back to top"
        aria-label="Back to top"
      >
        &#8593;
      </button>
    </>
  );
}
