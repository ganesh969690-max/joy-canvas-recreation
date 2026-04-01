import { Activity, Sparkles } from "lucide-react";
import { useUser, dietMacroTargets } from "@/contexts/UserContext";
import MonthlyGoalTracker from "@/components/MonthlyGoalTracker";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "GOOD MORNING";
  if (h < 17) return "GOOD AFTERNOON";
  return "GOOD EVENING";
};

const HomeView = () => {
  const { profile } = useUser();
  const pct = Math.round((profile.currentWeek / profile.totalWeeks) * 100);
  const displayName = profile.name || "ROHAN";
  const targets = dietMacroTargets[profile.cuisine] || dietMacroTargets.Standard;

  const macros = [
    { label: "Calories", current: profile.calories, target: targets.calories, unit: "kcal" },
    { label: "Protein", current: profile.protein, target: targets.protein, unit: "g" },
    { label: "Carbs", current: profile.carbs, target: targets.carbs, unit: "g" },
    { label: "Fat", current: profile.fats, target: targets.fats, unit: "g" },
    { label: "Fiber", current: profile.fiber, target: targets.fiber, unit: "g" },
  ];

  return (
    <div className="px-5 pt-14 pb-24 max-w-lg mx-auto">
      <h1 className="text-nike-header text-2xl mb-5">
        {getGreeting()}, {displayName.toUpperCase()}
      </h1>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {profile.goal} Block
          </span>
          <span className="text-[10px] font-bold text-muted-foreground">
            Week {profile.currentWeek} of {profile.totalWeeks}
          </span>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-nike-volt rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 font-semibold">{pct}% Complete</p>
      </div>

      <div className="mb-6">
        <MonthlyGoalTracker />
      </div>

      <div className="card-premium mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={18} className="text-nike-volt" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary-foreground/60">
            Apple Health Sync Active
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-primary-foreground/50 text-[10px] uppercase tracking-wider font-semibold">Sleep</p>
            <p className="text-primary-foreground font-black text-lg">4h 20m</p>
            <span className="text-xs text-destructive font-semibold">Poor</span>
          </div>
          <div>
            <p className="text-primary-foreground/50 text-[10px] uppercase tracking-wider font-semibold">HRV</p>
            <p className="text-primary-foreground font-black text-lg">Low</p>
          </div>
        </div>
        <div className="border border-dashed border-primary-foreground/20 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-nike-volt mt-0.5 flex-shrink-0" />
            <p className="text-primary-foreground/80 text-xs leading-relaxed">
              <span className="font-bold text-primary-foreground">AI Insight:</span>{" "}
              {displayName}, based on your {profile.goal} goal and low readiness, we suggest prioritizing mobility today. Head to the Workouts tab to swap your session.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-nike-header text-sm mb-3">FITNESS STATS</h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Workouts", value: "12" },
          { label: "Active Minutes", value: "340" },
          { label: "Current Streak", value: "4 Days" },
        ].map((s) => (
          <div key={s.label} className="bg-secondary rounded-2xl p-3 text-center">
            <p className="font-black text-lg">{s.value}</p>
            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-nike-header text-sm mb-3">TODAY'S MACROS</h2>
      <div className="space-y-3 mb-6">
        {macros.map((m) => {
          const pctFill = Math.min((m.current / m.target) * 100, 100);
          const isCalories = m.label === "Calories";
          return (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {m.label}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {m.current}{m.unit} / {m.target}{m.unit}
                </span>
              </div>
              <div className={`w-full ${isCalories ? "h-3" : "h-2"} bg-secondary rounded-full overflow-hidden`}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isCalories ? "bg-nike-volt" : "bg-foreground/70"}`}
                  style={{ width: `${pctFill}%` }}
                />
              </div>
            </div>
          );
        })}
        <p className="text-[10px] text-muted-foreground font-semibold">
          Targets based on your {profile.cuisine} diet preference
        </p>
      </div>
    </div>
  );
};

export default HomeView;
