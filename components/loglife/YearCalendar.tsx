"use client";

interface YearCalendarProps {
  year: number;
  selectedDate: Date;
  loggedDates: Set<string>; // "YYYY-MM-DD"
  onSelectDate: (d: Date) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = [
  { id: "sun", label: "S" },
  { id: "mon", label: "M" },
  { id: "tue", label: "T" },
  { id: "wed", label: "W" },
  { id: "thu", label: "T" },
  { id: "fri", label: "F" },
  { id: "sat", label: "S" },
];

function generateMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDay.getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function fmtYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function YearCalendar({
  year,
  selectedDate,
  loggedDates,
  onSelectDate,
}: YearCalendarProps) {
  const today = new Date();
  const todayYMD = fmtYMD(today);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {MONTHS.map((monthName, monthIdx) => {
        const cells = generateMonthGrid(year, monthIdx);
        return (
          <div key={monthIdx} className="calendar-month">
            <div className="calendar-month-title">{monthName}</div>
            <div className="calendar-grid">
              {DAY_HEADERS.map((day) => (
                <div key={day.id} className="calendar-day-header">
                  {day.label}
                </div>
              ))}
              {cells.map((cell, i) => {
                if (!cell) {
                  return <div key={`empty-${i}`} className="calendar-day empty" />;
                }
                const ymd = fmtYMD(cell);
                const isLogged = loggedDates.has(ymd);
                const isToday = ymd === todayYMD;
                const isSelected = sameDay(cell, selectedDate);
                const isPast = cell < todayStart;

                const classes = ["calendar-day"];
                if (isSelected) classes.push("selected");
                else if (isLogged) classes.push("logged");
                else if (isPast) classes.push("past");
                if (isToday) classes.push("today");

                return (
                  <button
                    key={ymd}
                    type="button"
                    onClick={() => onSelectDate(cell)}
                    className={classes.join(" ")}
                    aria-label={cell.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    aria-pressed={isSelected}
                  >
                    {cell.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
