import { useState, useEffect, useRef } from "react";
import { Camera, Sparkles, X, Loader2, Search, Pencil, List, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, dietMacroTargets } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";

interface FoodResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

const templateMeals = [
  { label: "South Indian Breakfast", cal: 450, p: 15, c: 60, f: 12, fi: 5 },
  { label: "Standard Post-Workout Shake", cal: 350, p: 40, c: 30, f: 5, fi: 3 },
  { label: "Mediterranean Bowl", cal: 550, p: 25, c: 55, f: 20, fi: 8 },
  { label: "Protein Smoothie", cal: 280, p: 35, c: 20, f: 4, fi: 2 },
];

const NutritionView = () => {
  const { toast } = useToast();
  const { profile, logMeal, deleteMeal } = useUser();
  const meals = profile.loggedMeals || [];
  const [showFoodsList, setShowFoodsList] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Editable confirmation card
  const [confirmMeal, setConfirmMeal] = useState<{ name: string; cal: number; p: number; c: number; f: number; fi: number } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editP, setEditP] = useState(0);
  const [editC, setEditC] = useState(0);
  const [editF, setEditF] = useState(0);
  const [editFi, setEditFi] = useState(0);
  const [editCal, setEditCal] = useState(0);

  const targets = dietMacroTargets[profile.cuisine] || dietMacroTargets.Standard;

  const macros = [
    { label: "Calories", current: profile.calories, target: targets.calories, unit: "kcal" },
    { label: "Protein", current: profile.protein, target: targets.protein, unit: "g" },
    { label: "Carbs", current: profile.carbs, target: targets.carbs, unit: "g" },
    { label: "Fat", current: profile.fats, target: targets.fats, unit: "g" },
    { label: "Fiber", current: profile.fiber, target: targets.fiber, unit: "g" },
  ];

  // Debounced USDA food search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase.functions.invoke("food-search", {
          body: { query: searchQuery.trim() },
        });
        if (error) throw error;
        setSearchResults(data?.foods || []);
      } catch (err) {
        console.error("Food search error:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const openConfirm = (name: string, cal: number, p: number, c: number, f: number, fi: number) => {
    setConfirmMeal({ name, cal, p, c, f, fi });
    setEditP(p); setEditC(c); setEditF(f); setEditFi(fi); setEditCal(cal);
    setEditMode(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSaveMeal = () => {
    logMeal(confirmMeal?.name || "Unknown", editP, editC, editF, editFi, editCal);
    toast({ title: "Meal Logged ✓", description: `${confirmMeal?.name} added to daily tracker.` });
    setConfirmMeal(null);
  };

  const handleSnap = () => {
    setScanning(true);
    setScanResult(false);
    setTimeout(() => {
      setScanning(false);
      setScanResult(true);
    }, 2000);
  };

  const handleLogScanned = () => {
    setShowCamera(false);
    openConfirm("Chicken Tikka Masala & Rice", 650, 40, 50, 15, 4);
  };

  return (
    <div className="px-5 pt-14 pb-24 max-w-lg mx-auto">
      <h1 className="text-nike-header text-2xl mb-6">NUTRITION</h1>

      {/* Horizontal Macro Bars */}
      <div className="space-y-3 mb-6">
        {macros.map((m) => {
          const pctFill = Math.min((m.current / m.target) * 100, 100);
          const isCalories = m.label === "Calories";
          return (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${isCalories ? "" : "text-primary"}`}>{m.label}</span>
                <span className="text-xs font-semibold text-muted-foreground">{m.current}{m.unit} / {m.target}{m.unit}</span>
              </div>
              <div className={`w-full ${isCalories ? "h-3" : "h-2"} bg-secondary rounded-full overflow-hidden`}>
                <div className={`h-full rounded-full transition-all duration-700 ${isCalories ? "bg-nike-volt" : "bg-foreground/70"}`} style={{ width: `${pctFill}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <h2 className="text-nike-header text-sm mb-3">LOG TODAY'S MEAL</h2>
      <div className="relative mb-4">
        <div className="flex items-center border border-border rounded-xl bg-secondary px-3">
          <Search size={16} className="text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food (e.g. chicken breast, banana)..."
            className="flex-1 bg-transparent px-3 py-3 text-sm font-semibold focus:outline-none"
           />
          {searchLoading && <Loader2 size={16} className="text-muted-foreground animate-spin" />}
          {searchQuery && !searchLoading && (
            <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="p-1">
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-background border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((food, i) => (
              <button
                key={`${food.name}-${i}`}
                onClick={() => openConfirm(food.name, food.calories, food.protein, food.carbs, food.fat, food.fiber)}
                className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-border last:border-b-0"
              >
                <p className="font-semibold text-sm truncate">{food.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {food.calories} kcal · {food.protein}g P · {food.carbs}g C · {food.fat}g F
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Added Foods List Button */}
      <button
        onClick={() => setShowFoodsList(true)}
        className="w-full flex items-center justify-center gap-2 border border-border rounded-xl py-3 mb-4 text-sm font-bold uppercase tracking-wider hover:bg-secondary active:scale-[0.98] transition-all"
      >
        <List size={16} />
        LOGGED FOODS
        {meals.length > 0 && (
          <span className="bg-foreground text-background text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
            {meals.length}
          </span>
        )}
      </button>

      {/* Quick Log Templates */}
      <h2 className="text-nike-header text-sm mb-3">QUICK LOG</h2>
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide mb-6">
        {templateMeals.map((t) => (
          <button
            key={t.label}
            onClick={() => openConfirm(t.label, t.cal, t.p, t.c, t.f, t.fi)}
            className="chip-filter whitespace-nowrap active:scale-95 transition-transform"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* AI Meal Scanner */}
      <button
        onClick={() => { setShowCamera(true); setScanResult(false); setScanning(false); }}
        className="card-premium w-full flex items-center gap-3 active:scale-[0.98] transition-transform mb-6"
      >
        <Camera size={24} className="text-nike-volt" />
        <div className="text-left">
          <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-nike-volt" />
            AI Meal Scanner
          </h3>
          <p className="text-primary-foreground/50 text-xs mt-0.5">Point your camera at any meal</p>
        </div>
      </button>

      {/* Editable Macro Confirmation Card */}
      {confirmMeal && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-background w-full max-w-lg rounded-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-nike-header text-base">{confirmMeal.name}</h2>
              <div className="flex gap-2">
                <button onClick={() => setEditMode(!editMode)} className="p-1.5 rounded-full bg-secondary">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setConfirmMeal(null)} className="p-1"><X size={22} /></button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-5">
              {[
                { label: "Cal", val: editCal, set: setEditCal, unit: "" },
                { label: "Protein", val: editP, set: setEditP, unit: "g" },
                { label: "Carbs", val: editC, set: setEditC, unit: "g" },
                { label: "Fat", val: editF, set: setEditF, unit: "g" },
                { label: "Fiber", val: editFi, set: setEditFi, unit: "g" },
              ].map((m) => (
                <div key={m.label} className="bg-secondary rounded-xl p-3 text-center">
                  {editMode ? (
                    <input
                      type="number"
                      value={m.val}
                      onChange={(e) => m.set(Number(e.target.value))}
                      className="w-full bg-transparent text-center font-black text-lg focus:outline-none"
                    />
                  ) : (
                    <p className="font-black text-lg">{m.val}{m.unit}</p>
                  )}
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase">{m.label}</p>
                </div>
              ))}
            </div>
            <button onClick={handleSaveMeal} className="btn-volt w-full text-center py-3">
              SAVE TO DAILY LOG
            </button>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-background w-full max-w-lg rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-nike-header text-lg">SCAN MEAL</h2>
              <button onClick={() => setShowCamera(false)} className="p-1"><X size={24} /></button>
            </div>
            {!scanResult ? (
              <>
                <div className="relative bg-nike-charcoal rounded-2xl aspect-[4/3] mb-5 flex items-center justify-center overflow-hidden">
                  {scanning ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={32} className="text-nike-volt animate-spin" />
                      <p className="text-primary-foreground/70 text-sm font-semibold">Analyzing macros...</p>
                    </div>
                  ) : (
                    <>
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary-foreground/50 rounded-tl-lg" />
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary-foreground/50 rounded-tr-lg" />
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary-foreground/50 rounded-bl-lg" />
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary-foreground/50 rounded-br-lg" />
                      <p className="text-primary-foreground/40 text-xs font-semibold uppercase tracking-widest">Point at meal</p>
                    </>
                  )}
                </div>
                {!scanning && (
                  <button onClick={handleSnap} className="btn-volt w-full text-center py-4">SNAP PHOTO</button>
                )}
              </>
            ) : (
              <div className="bg-secondary rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-nike-volt" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Detection</span>
                </div>
                <h3 className="font-black text-lg">Chicken Tikka Masala & 1 Cup Rice</h3>
                <div className="grid grid-cols-3 gap-3 mt-3 mb-4">
                  {[{ v: "650", l: "kcal" }, { v: "40g", l: "Protein" }, { v: "50g", l: "Carbs" }].map((x) => (
                    <div key={x.l} className="bg-background rounded-xl p-3 text-center">
                      <p className="font-black text-lg">{x.v}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">{x.l}</p>
                    </div>
                  ))}
                </div>
                <button onClick={handleLogScanned} className="btn-volt w-full text-center py-3">LOG MEAL</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Added Foods List Modal */}
      {showFoodsList && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background w-full max-w-lg rounded-3xl p-6 animate-in fade-in zoom-in-95 duration-300 max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-nike-header text-base">ADDED FOODS</h2>
              <button onClick={() => setShowFoodsList(false)} className="p-1"><X size={22} /></button>
            </div>
            {meals.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No foods logged yet today.</p>
            ) : (
              <div className="overflow-y-auto flex-1 space-y-2">
                {meals.map((meal) => (
                  <div key={meal.id} className="bg-secondary rounded-xl p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{meal.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {meal.calories}kcal · {meal.protein}g P · {meal.carbs}g C · {meal.fats}g F · {meal.fiber}g Fiber
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        deleteMeal(meal.id);
                        toast({ title: "Removed", description: `${meal.name} removed from log.` });
                      }}
                      className="ml-3 p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionView;
