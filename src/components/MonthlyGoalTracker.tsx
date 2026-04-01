import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const generateGoalData = (year: number, month: number): Record<string, number> => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const data: Record<string, number> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${month}-${d}`;
    const seed = (d * 7 + month * 13 + year) % 10;
    data[key] = seed < 3 ? 0 : seed < 5 ? 1 : seed < 7 ? 3 : 5;
  }
  return data;
};

const getHeatColor = (count: number) => {
  if (count === 0) return "bg-secondary";
  if (count <= 2) return "bg-nike-volt/30";
  if (count <= 4) return "bg-nike-volt/60";
  return "bg-nike-volt";
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MonthlyGoalTracker = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const goalData = useMemo(() => generateGoalData(year, month), [year, month]);

  const { grid } = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const dim = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= dim; d++) cells.push(d);
    return { grid: cells, daysInMonth: dim };
  }, [year, month]);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const next = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-nike-header text-sm">ACTIVITY MAP</h2>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="p-1 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft size={16} className="text-muted-foreground" />
          </button>
          <span className="text-xs font-bold uppercase tracking-wider min-w-[120px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={next} className="p-1 rounded-lg hover:bg-secondary transition-colors">
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <TooltipProvider delayDuration={100}>
        <div className="bg-secondary rounded-2xl p-4">
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="text-[9px] font-semibold text-muted-foreground text-center uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {grid.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const count = goalData[`${year}-${month}-${day}`] || 0;
              const isToday =
                day === now.getDate() &&
                month === now.getMonth() &&
                year === now.getFullYear();
              return (
                <Tooltip key={day}>
                  <TooltipTrigger asChild>
                    <div
                      className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-colors cursor-default ${getHeatColor(count)} ${
                        isToday ? "ring-1 ring-foreground" : ""
                      }`}
                    >
                      {day}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {MONTH_NAMES[month].slice(0, 3)} {day}: {count} goal{count !== 1 ? "s" : ""} met
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[9px] text-muted-foreground font-semibold">Less</span>
            {[0, 1, 3, 5].map((l) => (
              <div key={l} className={`w-3 h-3 rounded-sm ${getHeatColor(l)}`} />
            ))}
            <span className="text-[9px] text-muted-foreground font-semibold">More</span>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default MonthlyGoalTracker;
