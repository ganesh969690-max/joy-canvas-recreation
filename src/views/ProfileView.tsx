import { useState } from "react";
import { Award, Flame, Sun, Target, Trophy, Zap, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

const stats = [
  { label: "Workouts", value: "142" },
  { label: "Total Minutes", value: "4,520" },
  { label: "Streak", value: "12 Days" },
  { label: "AVG WORKOUTS / WEEK", value: "4.2" },
];

const badges = [
  { icon: Flame, label: "3-Week Streak", unlocked: true },
  { icon: Sun, label: "Early Bird", unlocked: true },
  { icon: Trophy, label: "Century Club", unlocked: true },
  { icon: Target, label: "Goal Crusher", unlocked: true },
  { icon: Zap, label: "Speed Demon", unlocked: false },
  { icon: Award, label: "Iron Will", unlocked: false },
];

const goalOptions = ["Weight Loss", "Hypertrophy", "Longevity"];
const cuisineOptions = ["Standard", "Keto", "Vegan", "Mediterranean", "Paleo"];

const settings = ["Account", "Notifications", "Health Data Permissions", "Subscription", "Help & Support"];

const ProfileView = () => {
  const { profile, resetProgram } = useUser();
  const { toast } = useToast();
  const [showRecalibrate, setShowRecalibrate] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const [editGoal, setEditGoal] = useState(profile.goal);
  const [editTime, setEditTime] = useState(profile.dailyTime);
  const [editCuisine, setEditCuisine] = useState(profile.cuisine);
  const [editWeight, setEditWeight] = useState(profile.weight);

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      resetProgram({ goal: editGoal, dailyTime: editTime, cuisine: editCuisine, weight: editWeight });
      setRegenerating(false);
      setShowRecalibrate(false);
      toast({ title: "Program Regenerated ✓", description: "Your 12-week plan starts fresh from Week 1." });
    }, 3000);
  };

  const displayName = profile.name || "Rohan";
  const weightUnit = profile.units === "imperial" ? "lbs" : "kg";
  const heightUnit = profile.units === "imperial" ? "in" : "cm";

  const profileData = [
    { label: "Age", value: profile.age || "28" },
    { label: "Weight", value: `${profile.weight || "78"} ${weightUnit}` },
    { label: "Height", value: `${profile.height || "175"} ${heightUnit}` },
    { label: "Goal", value: profile.goal },
    { label: "Time Available", value: `${profile.dailyTime}m / day` },
    { label: "Diet", value: profile.cuisine },
  ];

  return (
    <div className="px-5 pt-14 pb-24 max-w-lg mx-auto">
      <h1 className="text-nike-header text-2xl mb-2">PROFILE</h1>
      <p className="text-muted-foreground text-sm mb-6">{displayName} K. · Premium Member</p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-secondary rounded-2xl p-4 text-center">
            <p className="font-black text-2xl">{s.value}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-nike-header text-sm mb-3">YOUR TRAINING PROFILE</h2>
      <div className="card-premium mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-nike-volt" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/60">
            AI Personalization Active
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {profileData.map((p) => (
            <div key={p.label}>
              <p className="text-primary-foreground/50 text-[10px] uppercase tracking-wider font-semibold">{p.label}</p>
              <p className="text-primary-foreground font-bold text-sm mt-0.5">{p.value}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-nike-header text-sm mb-3">AI PROGRAM SETTINGS</h2>
      <button
        onClick={() => {
          setShowRecalibrate(true);
          setEditGoal(profile.goal);
          setEditTime(profile.dailyTime);
          setEditCuisine(profile.cuisine);
          setEditWeight(profile.weight);
        }}
        className="w-full flex items-center justify-center gap-2 border border-border rounded-2xl py-3 mb-8 active:scale-[0.98] transition-transform"
      >
        <Sparkles size={16} className="text-nike-volt" />
        <span className="text-xs font-black uppercase tracking-wider">Re-calibrate Entire Program</span>
      </button>

      <h2 className="text-nike-header text-sm mb-4">BADGES</h2>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.label} className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${b.unlocked ? "bg-secondary" : "bg-secondary/50 opacity-40"}`}>
              <div className={`rounded-full p-3 ${b.unlocked ? "bg-foreground" : "bg-muted-foreground/30"}`}>
                <Icon size={20} className={b.unlocked ? "text-nike-volt" : "text-muted-foreground"} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">{b.label}</span>
            </div>
          );
        })}
      </div>

      <h2 className="text-nike-header text-sm mb-3">SETTINGS</h2>
      <div className="space-y-0">
        {settings.map((s) => (
          <button key={s} className="w-full flex items-center justify-between py-4 border-b border-border last:border-0 active:bg-secondary transition-colors">
            <span className="text-sm font-semibold">{s}</span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      {showRecalibrate && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-background w-full max-w-lg rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300">
            {regenerating ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="bg-primary rounded-full p-6">
                  <Loader2 size={32} className="text-nike-volt animate-spin" />
                </div>
                <p className="text-nike-header text-sm text-center">Rebuilding your timeline...</p>
                <p className="text-xs text-muted-foreground text-center">Regenerating 12-week macrocycle...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-nike-header text-lg">RE-CALIBRATE</h2>
                  <button onClick={() => setShowRecalibrate(false)} className="p-1 text-foreground">✕</button>
                </div>
                <p className="text-sm text-muted-foreground mb-5">Update your preferences and we'll rebuild your program from Week 1.</p>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Weight ({profile.units === "imperial" ? "lbs" : "kg"})</label>
                    <input value={editWeight} onChange={(e) => setEditWeight(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold bg-secondary focus:outline-none focus:ring-2 focus:ring-foreground" type="number" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Goal</label>
                    <div className="flex gap-2">
                      {goalOptions.map((g) => (
                        <button key={g} onClick={() => setEditGoal(g)} className={`chip-filter flex-1 text-center text-xs ${editGoal === g ? "chip-filter-active" : ""}`}>{g}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Daily Time: {editTime}m</label>
                    <Slider value={[editTime]} onValueChange={([v]) => setEditTime(v)} min={15} max={90} step={5} className="py-2" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Cuisine</label>
                    <div className="flex flex-wrap gap-2">
                      {cuisineOptions.map((c) => (
                        <button key={c} onClick={() => setEditCuisine(c)} className={`chip-filter text-xs ${editCuisine === c ? "chip-filter-active" : ""}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={handleRegenerate} className="btn-volt w-full text-center py-4">SAVE & REGENERATE</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
