"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/browser";

interface LogEntry {
  log_date: string;
  what_done: string | null;
  happiest_thing: string | null;
}

interface LogFormProps {
  userId: string;
  selectedDate: Date;
  existingLog: LogEntry | null;
  onSaved: () => void;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function fmtYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function LogForm({ userId, selectedDate, existingLog, onSaved }: LogFormProps) {
  const [whatDone, setWhatDone] = useState("");
  const [happiest, setHappiest] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setWhatDone(existingLog?.what_done ?? "");
    setHappiest(existingLog?.happiest_thing ?? "");
    setSaved(false);
  }, [existingLog, selectedDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    await supabase.from("daily_logs").upsert(
      {
        user_id: userId,
        log_date: fmtYMD(selectedDate),
        what_done: whatDone,
        happiest_thing: happiest,
      },
      { onConflict: "user_id,log_date" },
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved();
  }

  const isExisting = !!existingLog;

  return (
    <div className="logform-inner">
      <div className="logform-head">
        <div>
          <p className="logform-label">Daily entry</p>
          <h2>{fmtDate(selectedDate)}</h2>
        </div>
        <span className={isExisting ? "logform-status saved" : "logform-status"}>
          {isExisting ? "Logged" : "Draft"}
        </span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="logform-prompt" htmlFor="what-done">
            What did you do today?
          </label>
          <p className="logform-hint">
            Tasks, events, decisions, or anything worth remembering.
          </p>
          <textarea
            id="what-done"
            value={whatDone}
            onChange={(e) => setWhatDone(e.target.value)}
            rows={4}
            placeholder="Write about your day..."
            className="textarea"
          />
        </div>
        <div>
          <label className="logform-prompt" htmlFor="happiest">
            Happiest moment
          </label>
          <p className="logform-hint">
            The best moment can be small.
          </p>
          <textarea
            id="happiest"
            value={happiest}
            onChange={(e) => setHappiest(e.target.value)}
            rows={4}
            placeholder="The highlight of your day..."
            className="textarea"
          />
        </div>
        <div className="logform-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : isExisting ? "Update entry" : "Save entry"}
          </button>
          {saved && (
            <span className="logform-saved">Saved</span>
          )}
        </div>
      </form>
    </div>
  );
}
