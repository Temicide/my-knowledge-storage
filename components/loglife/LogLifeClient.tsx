"use client";

import { useState, useMemo } from "react";
import { YearCalendar } from "./YearCalendar";
import { StatsBars } from "./StatsBars";
import { LogForm } from "./LogForm";

interface LogEntry {
  log_date: string;
  what_done: string | null;
  happiest_thing: string | null;
}

interface LogLifeClientProps {
  userId: string;
  initialLogs: LogEntry[];
  year: number;
}

export function LogLifeClient({
  userId,
  initialLogs,
  year,
}: LogLifeClientProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);

  const loggedDates = useMemo(() => {
    const s = new Set<string>();
    for (const log of logs) {
      if (log.what_done || log.happiest_thing) {
        s.add(log.log_date);
      }
    }
    return s;
  }, [logs]);

  const selectedKey =
    `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  const existingLog = logs.find((l) => l.log_date === selectedKey) ?? null;

  function handleSaved() {
    setLogs((prev) => {
      const updated = prev.filter((l) => l.log_date !== selectedKey);
      return [
        ...updated,
        { log_date: selectedKey, what_done: "updated", happiest_thing: "updated" },
      ];
    });
    import("@/lib/supabase/browser").then(({ createClient }) => {
      const supabase = createClient();
      supabase
        .from("daily_logs")
        .select("log_date, what_done, happiest_thing")
        .eq("user_id", userId)
        .gte("log_date", `${year}-01-01`)
        .lte("log_date", `${year}-12-31`)
        .then(({ data }) => {
          if (data) setLogs(data);
        });
    });
  }

  return (
    <main className="loglife-container">
      <header className="loglife-header">
        <div>
          <p className="loglife-kicker">{year}</p>
          <h1>LogLife</h1>
          <p>Log each day and keep the year in view.</p>
        </div>
        <a href="/loglife/stats" className="loglife-header-link">
          Stats
        </a>
      </header>

      <StatsBars loggedDates={loggedDates} today={today} />

      <section className="calendar-card" aria-labelledby="year-overview">
        <div className="loglife-section-head">
          <h2 id="year-overview">Year overview</h2>
          <div className="loglife-legend" aria-label="Calendar legend">
            <span><i className="legend-dot logged" />Logged</span>
            <span><i className="legend-dot past" />Past</span>
            <span><i className="legend-dot selected" />Selected</span>
          </div>
        </div>
        <YearCalendar
          year={year}
          selectedDate={selectedDate}
          loggedDates={loggedDates}
          onSelectDate={setSelectedDate}
        />
      </section>

      <section className="logform-card" aria-label="Daily entry">
        <LogForm
          userId={userId}
          selectedDate={selectedDate}
          existingLog={existingLog}
          onSaved={handleSaved}
        />
      </section>
    </main>
  );
}
