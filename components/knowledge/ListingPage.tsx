"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { KnowledgeFile } from "@/lib/content";
import { getReadStatus } from "@/lib/read-status";

interface ListingPageProps {
  files: KnowledgeFile[];
}

const COLLAPSE_KEY = "knowledge-topic-collapse";

export function ListingPage({ files }: ListingPageProps) {
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = JSON.parse(localStorage.getItem(COLLAPSE_KEY) || "{}");
      setCollapsed(saved);
    } catch {
      setCollapsed({});
    }
    getReadStatus().then(setReadStatus).catch(() => {
      try {
        setReadStatus(JSON.parse(localStorage.getItem("knowledge-read-status") || "{}"));
      } catch {
        setReadStatus({});
      }
    });
  }, []);

  const topics = useMemo(() => {
    const map = new Map<string, KnowledgeFile[]>();
    for (const f of files) {
      if (!map.has(f.topic)) map.set(f.topic, []);
      map.get(f.topic)!.push(f);
    }
    return map;
  }, [files]);

  function toggleTopic(topic: string) {
    setCollapsed((prev) => {
      const next = { ...prev, [topic]: !prev[topic] };
      localStorage.setItem(COLLAPSE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const readCount = Object.keys(readStatus).filter((k) => readStatus[k]).length;
  const totalCount = files.length;
  const progressPercent = totalCount ? (readCount / totalCount) * 100 : 0;

  return (
    <main className="listing-container">
      <header className="listing-header">
        <span className="kicker">Knowledge Base</span>
        <h1>Temicide&apos;s knowledge base</h1>
        <p className="subtitle">
          Personal notes, tutorials, and references. Browse by topic, track your
          progress as you go.
        </p>
        <div className="progress-summary">
          <span className="progress-label">
            <span>{readCount}</span> of{" "}
            <span>{totalCount}</span> read
          </span>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <div className="topic-list">
        {files.length === 0 ? (
          <div className="empty-state">
            <p>No knowledge files yet.</p>
            <p className="hint">
              Add <code className="inline-code">.md</code> files to{" "}
              <code className="inline-code">knowledges/</code> directory or topic
              folders inside it.
            </p>
          </div>
        ) : (
          [...topics.entries()].map(([topic, topicFiles]) => (
            <section className="topic-section" key={topic} data-topic={topic}>
              <button
                className="topic-header"
                onClick={() => toggleTopic(topic)}
                aria-expanded={!collapsed[topic]}
              >
                <span className="topic-name">{topic}</span>
                <span className="topic-meta">
                  <span className="topic-count">
                    {topicFiles.length} file
                    {topicFiles.length !== 1 ? "s" : ""}
                  </span>
                  <span className="topic-toggle" aria-hidden="true">
                    &#9662;
                  </span>
                </span>
              </button>
              <div
                className={`topic-cards ${collapsed[topic] ? "collapsed" : ""}`}
              >
                {topicFiles.map((file) => {
                  const isRead = mounted && !!readStatus[file.slug];
                  return (
                    <Link
                      href={`/knowledge/${file.slug}`}
                      className="knowledge-card"
                      key={file.slug}
                    >
                      <div className="card-content">
                        <h2 className="card-title">{file.title}</h2>
                        {file.subtitle && (
                          <p className="card-subtitle">{file.subtitle}</p>
                        )}
                        <div className="card-meta">
                          <span>{file.wordCount.toLocaleString()} words</span>
                          <span className="meta-sep">·</span>
                          <span>{file.readMinutes} min read</span>
                          <span className="meta-sep">·</span>
                          <span
                            className={`read-indicator ${isRead ? "read" : "unread"}`}
                          >
                            <span className="indicator-dot" />
                            <span className="indicator-label">
                              {isRead ? "Read" : "Unread"}
                            </span>
                          </span>
                        </div>
                      </div>
                      <span className="card-arrow">→</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      <footer className="listing-footer">
        <p>
          Add <code className="inline-code">.md</code> files to{" "}
          <code className="inline-code">knowledges/</code> — organized in topic
          folders, they appear here automatically.
        </p>
      </footer>
    </main>
  );
}
