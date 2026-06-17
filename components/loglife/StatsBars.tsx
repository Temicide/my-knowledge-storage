interface StatsBarsProps {
  loggedDates: Set<string>;
  today: Date;
}

function getStartOfWeek(d: Date): Date {
  const day = d.getDay();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
}

function daysElapsedInWeek(d: Date): number {
  return d.getDay() + 1;
}

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff =
    d.getTime() -
    start.getTime() +
    (start.getTimezoneOffset() - d.getTimezoneOffset()) * 60000;
  return Math.floor(diff / 86400000);
}

function fmtYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function StatsBars({ loggedDates, today }: StatsBarsProps) {
  const todayYMD = fmtYMD(today);

  const weekStart = getStartOfWeek(today);
  const weekElapsed = daysElapsedInWeek(today);
  let weekLogged = 0;
  for (let i = 0; i < weekElapsed; i++) {
    const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
    if (loggedDates.has(fmtYMD(d))) weekLogged++;
  }
  const weekPct = weekElapsed ? Math.round((weekLogged / weekElapsed) * 100) : 0;

  const monthElapsed = today.getDate();
  let monthLogged = 0;
  for (let i = 1; i <= monthElapsed; i++) {
    const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    if (loggedDates.has(ymd)) monthLogged++;
  }
  const monthPct = monthElapsed ? Math.round((monthLogged / monthElapsed) * 100) : 0;

  const yearElapsed = dayOfYear(today);
  let yearLogged = 0;
  for (let m = 0; m < today.getMonth(); m++) {
    const dim = new Date(today.getFullYear(), m + 1, 0).getDate();
    for (let d = 1; d <= dim; d++) {
      const ymd = `${today.getFullYear()}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (loggedDates.has(ymd)) yearLogged++;
    }
  }
  for (let d = 1; d <= today.getDate(); d++) {
    const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (loggedDates.has(ymd)) yearLogged++;
  }
  const yearPct = yearElapsed ? Math.round((yearLogged / yearElapsed) * 100) : 0;

  const bars = [
    { label: "Week", pct: weekPct, detail: `${weekLogged}/${weekElapsed}` },
    { label: "Month", pct: monthPct, detail: `${monthLogged}/${monthElapsed}` },
    { label: "Year", pct: yearPct, detail: `${yearLogged}/${yearElapsed}` },
  ];

  return (
    <div className="loglife-stats" aria-label="Logging progress">
      {bars.map((bar) => (
        <div key={bar.label} className="loglife-stat">
          <div className="loglife-stat-top">
            <span className="loglife-stat-label">
              {bar.label}
            </span>
            <span className="loglife-stat-value">
              {bar.pct}%
            </span>
          </div>
          <div className="stats-bar-track">
            <div
              className="stats-bar-fill"
              style={{ width: `${bar.pct}%` }}
            />
          </div>
          <div className="loglife-stat-detail">
            {bar.detail} logged
          </div>
        </div>
      ))}
    </div>
  );
}
