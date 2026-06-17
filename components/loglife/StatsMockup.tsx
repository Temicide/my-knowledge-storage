"use client";

export function StatsMockup() {
  const demoData = {
    daysLogged: 127,
    daysElapsed: 167,
    consistency: 76,
    longestStreak: 12,
    avgMood: 72,
    monthlyActivity: [
      45, 62, 55, 71, 68, 80, 75, 70, 65, 78, 58, 52,
    ],
    moods: [
      { label: "Happy", pct: 52, color: "#0B7A42" },
      { label: "Neutral", pct: 32, color: "#2383E2" },
      { label: "Stressed", pct: 16, color: "#C75000" },
    ],
    topActivities: [
      { label: "Coding", pct: 45 },
      { label: "Reading", pct: 30 },
      { label: "Exercise", pct: 25 },
      { label: "Social", pct: 20 },
      { label: "Learning", pct: 18 },
    ],
    wordCloud: [
      { word: "coding", size: 28 },
      { word: "reading", size: 22 },
      { word: "running", size: 18 },
      { word: "friends", size: 16 },
      { word: "coffee", size: 14 },
      { word: "music", size: 12 },
      { word: "writing", size: 20 },
      { word: "sleep", size: 24 },
      { word: "cooking", size: 15 },
      { word: "nature", size: 13 },
      { word: "focus", size: 17 },
      { word: "peace", size: 11 },
    ],
  };

  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const maxActivity = Math.max(...demoData.monthlyActivity);

  return (
    <div className="loglife-stats-page">
      <div className="stats-page-header">
        <div>
          <p className="loglife-kicker">Preview</p>
          <h1>LogLife stats</h1>
          <p>Sample charts for future entry analysis.</p>
        </div>
        <a href="/loglife" className="loglife-header-link">
          Back
        </a>
      </div>

      <div className="stats-summary">
        <div>
          <div className="stats-summary-value">{demoData.daysLogged}</div>
          <div className="stats-summary-label">Days logged</div>
          <div className="stats-summary-note">of {demoData.daysElapsed} elapsed</div>
        </div>
        <div>
          <div className="stats-summary-value accent">{demoData.consistency}%</div>
          <div className="stats-summary-label">Consistency</div>
        </div>
        <div>
          <div className="stats-summary-value read">{demoData.longestStreak}</div>
          <div className="stats-summary-label">Longest streak</div>
        </div>
        <div>
          <div className="stats-summary-value warm">{demoData.avgMood}/100</div>
          <div className="stats-summary-label">Happiness</div>
        </div>
      </div>

      <div className="stats-grid">
        <section className="stats-panel">
          <h2>
            Monthly Activity
          </h2>
          <div className="flex items-end gap-1 h-32">
            {demoData.monthlyActivity.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm bg-[var(--color-accent)] transition-all"
                  style={{ height: `${(val / maxActivity) * 100}%` }}
                />
                <span className="text-[10px] text-[var(--color-text-tertiary)]">
                  {monthLabels[i]}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-panel">
          <h2>
            Mood Distribution
          </h2>
          <div className="space-y-3">
            {demoData.moods.map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
                  <span>{m.label}</span>
                  <span>{m.pct}%</span>
                </div>
                <div className="h-3 bg-[var(--color-border-light)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-panel">
          <h2>
            Top Activities
          </h2>
          <div className="space-y-2">
            {demoData.topActivities.map((a) => (
              <div key={a.label}>
                <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
                  <span>{a.label}</span>
                  <span>{a.pct}%</span>
                </div>
                <div className="h-2 bg-[var(--color-border-light)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-accent)] rounded-full transition-all"
                    style={{ width: `${a.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-panel">
          <h2>
            Common Themes
          </h2>
          <div className="flex flex-wrap items-center gap-2 leading-none">
            {demoData.wordCloud.map((wc) => (
              <span
                key={wc.word}
                className="text-[var(--color-accent)] opacity-80 hover:opacity-100 transition-opacity"
                style={{ fontSize: `${wc.size}px` }}
              >
                {wc.word}
              </span>
            ))}
          </div>
        </section>
      </div>

      <p className="stats-footnote">
        Preview uses sample data until analysis is connected to your logs.
      </p>
    </div>
  );
}
