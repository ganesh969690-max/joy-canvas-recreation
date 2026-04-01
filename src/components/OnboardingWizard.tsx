import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Slider } from "@/components/ui/slider";

const goals = ["Weight Loss", "Hypertrophy", "Longevity"];
const genders = ["Male", "Female", "Other"];
const cuisines = ["Standard", "Keto", "Vegan", "Mediterranean", "Paleo"];

const OnboardingWizard = () => {
  const { setProfile } = useUser();
  const [step, setStep] = useState(1);
  const [units, setUnits] = useState<"metric" | "imperial">("metric");

  const [name, setName] = useState("");
  const [age, setAge] = useState("28");
  const [weight, setWeight] = useState("78");
  const [height, setHeight] = useState("175");
  const [gender, setGender] = useState("Male");

  const [goal, setGoal] = useState("Hypertrophy");
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const [cuisine, setCuisine] = useState("Standard");

  const next = () => {
    if (step < 4) {
      setStep(step + 1);
      if (step === 3) {
        setTimeout(() => {
          setProfile({
            name,
            age,
            weight,
            height,
            gender,
            goal,
            dailyTime: 45,
            daysPerWeek,
            cuisine,
            units,
            onboarded: true,
            currentWeek: 4,
            totalWeeks: 12,
            protein: 60,
            carbs: 95,
            fats: 28,
            fiber: 8,
            calories: 1200,
            loggedMeals: [],
          });
        }, 3000);
      }
    }
  };

  const canProceed =
    (step === 1 && name && age && weight && height && gender) ||
    (step === 2 && goal) ||
    (step === 3 && cuisine);

  const inputClass =
    "w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold bg-secondary focus:outline-none focus:ring-2 focus:ring-foreground";

  const weightLabel = units === "metric" ? "Weight (kg)" : "Weight (lbs)";
  const heightLabel = units === "metric" ? "Height (cm)" : "Height (in)";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Step {step} of 4
          </span>
          <div className="flex items-center gap-2">
            <div className="flex bg-secondary rounded-full p-0.5">
              <button
                onClick={() => setUnits("metric")}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  units === "metric" ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                Metric
              </button>
              <button
                onClick={() => setUnits("imperial")}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  units === "imperial" ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                Imperial
              </button>
            </div>
            <Sparkles size={14} className="text-nike-volt" />
          </div>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-nike-volt rounded-full transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
        {step < 4 && (
          <h1 className="text-nike-header text-xl mt-6">CALIBRATING YOUR AI ENGINE</h1>
        )}
      </div>

      <div className="flex-1 px-5 pb-24 overflow-y-auto">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="text-sm text-muted-foreground mb-4">Tell us about yourself</p>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">First Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Rohan" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Age</label>
              <input value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} placeholder="28" type="number" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">{weightLabel}</label>
              <input value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} placeholder={units === "metric" ? "78" : "172"} type="number" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">{heightLabel}</label>
              <input value={height} onChange={(e) => setHeight(e.target.value)} className={inputClass} placeholder={units === "metric" ? "175" : "69"} type="number" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Gender</label>
              <div className="flex gap-2">
                {genders.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`chip-filter flex-1 text-center ${gender === g ? "chip-filter-active" : ""}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <p className="text-sm text-muted-foreground mb-2">How committed are you?</p>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                Days Per Week: {daysPerWeek}
              </label>
              <Slider
                value={[daysPerWeek]}
                onValueChange={([v]) => setDaysPerWeek(v)}
                min={1}
                max={7}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold mt-1">
                <span>1 day</span>
                <span>7 days</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                Primary Goal
              </label>
              <div className="space-y-3">
                {goals.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`w-full text-left rounded-2xl p-5 border-2 transition-all ${
                      goal === g
                        ? "border-foreground bg-primary text-primary-foreground"
                        : "border-border bg-secondary"
                    }`}
                  >
                    <span className="font-black text-sm uppercase tracking-wider">{g}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in duration-300">
            <p className="text-sm text-muted-foreground mb-5">Choose your dietary preference</p>
            <div className="flex flex-wrap gap-2">
              {cuisines.map((c) => (
                <button
                  key={c}
                  onClick={() => setCuisine(c)}
                  className={`chip-filter ${cuisine === c ? "chip-filter-active" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-24 gap-5 animate-in fade-in duration-300">
            <div className="bg-primary rounded-full p-8">
              <Loader2 size={40} className="text-nike-volt animate-spin" />
            </div>
            <p className="text-nike-header text-base text-center">Synthesizing your biometrics...</p>
            <p className="text-sm text-muted-foreground text-center">
              Generating your 12-week macrocycle...
            </p>
          </div>
        )}
      </div>

      {step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-background border-t border-border">
          <button
            onClick={next}
            disabled={!canProceed}
            className="btn-volt w-full text-center py-4 disabled:opacity-40"
          >
            {step === 3 ? "COMPLETE SETUP" : "CONTINUE"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OnboardingWizard;
