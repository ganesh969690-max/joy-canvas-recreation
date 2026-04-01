import { useState } from "react";
import { Sparkles, ShoppingBag } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const PremiumAIView = () => {
  const { toast } = useToast();
  const [toggles, setToggles] = useState({
    dynamicWorkout: true,
    appleHealth: true,
    groceryCart: false,
  });

  const currentPoints = 450;
  const targetPoints = 1000;
  const pointsPct = (currentPoints / targetPoints) * 100;

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({ title: "Setting Updated", description: `Feature ${toggles[key] ? "disabled" : "enabled"}.` });
  };

  return (
    <div className="px-5 pt-14 pb-24 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={20} className="text-nike-volt" />
        <h1 className="text-nike-header text-2xl">NTC PREMIUM</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
        Your training, supercharged with artificial intelligence.
      </p>

      <h2 className="text-nike-header text-sm mb-4">AI FEATURES</h2>
      <div className="space-y-0 mb-8">
        {[
          { key: "dynamicWorkout" as const, title: "Dynamic Workout Adjustments", desc: "AI adapts your workout based on readiness and constraints." },
          { key: "appleHealth" as const, title: "Auto-Sync Apple Health", desc: "Automatically pulls HRV, sleep, and activity data." },
          { key: "groceryCart" as const, title: "Smart Grocery Cart", desc: "AI generates a weekly grocery list from your meal plan." },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-4 border-b border-border last:border-0">
            <div className="flex-1 pr-4">
              <p className="font-bold text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <Switch checked={toggles[item.key]} onCheckedChange={() => handleToggle(item.key)} />
          </div>
        ))}
      </div>

      <h2 className="text-nike-header text-sm mb-4">SUBSCRIPTION</h2>
      <div className="card-premium mb-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/50 mb-2">Standard</p>
        <h3 className="font-black text-2xl text-primary-foreground mb-2">₹999 <span className="text-sm font-semibold text-primary-foreground/60">/ Month</span></h3>
        <p className="text-primary-foreground/60 text-xs leading-relaxed mb-4">
          Unlock full GenAI routing and AI Food Scanning. Personalized workout adaptation and macro tracking powered by AI.
        </p>
        <button className="btn-volt w-full text-center py-3 text-sm">
          SUBSCRIBE
        </button>
      </div>

      <div className="bg-secondary rounded-2xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Nike Ecosystem</p>
        <h3 className="font-black text-lg mb-2">Unlock via Nike Purchases</h3>
        <p className="text-muted-foreground text-xs leading-relaxed mb-4">
          Earn 1 point per ₹1 spent on Nike products. 1000 points = 1 Free Month of Premium.
        </p>

        <div className="mb-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-bold">Current Points</span>
            <span className="text-xs font-semibold text-muted-foreground">{currentPoints} / {targetPoints}</span>
          </div>
          <div className="w-full h-2.5 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-nike-volt rounded-full transition-all duration-500" style={{ width: `${pointsPct}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 font-semibold">
            {targetPoints - currentPoints} points to unlock a free month
          </p>
        </div>

        <button
          onClick={() => toast({ title: "Redirecting...", description: "Opening Nike Store." })}
          className="w-full flex items-center justify-center gap-2 bg-foreground text-background rounded-full py-3.5 font-bold text-sm uppercase tracking-wider active:scale-95 transition-transform"
        >
          <ShoppingBag size={16} />
          SHOP NIKE PRODUCTS
        </button>
      </div>
    </div>
  );
};

export default PremiumAIView;
