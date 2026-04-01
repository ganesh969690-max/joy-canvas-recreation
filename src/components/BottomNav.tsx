import { Home, Dumbbell, Apple, Sparkles, User } from "lucide-react";

type Tab = "home" | "workouts" | "nutrition" | "premium" | "profile";

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "nutrition", label: "Nutrition", icon: Apple },
  { id: "premium", label: "Premium AI", icon: Sparkles },
  { id: "profile", label: "Profile", icon: User },
];

const BottomNav = ({ active, onChange }: BottomNavProps) => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
    <div className="max-w-lg mx-auto flex justify-around items-center h-16">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;
