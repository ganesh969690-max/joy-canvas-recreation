import { createContext, useContext, useState, type ReactNode } from "react";

export interface LoggedMeal {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  calories: number;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  age: string;
  weight: string;
  height: string;
  gender: string;
  goal: string;
  dailyTime: number;
  daysPerWeek: number;
  cuisine: string;
  units: "metric" | "imperial";
  onboarded: boolean;
  currentWeek: number;
  totalWeeks: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  calories: number;
  loggedMeals: LoggedMeal[];
}

const defaultProfile: UserProfile = {
  name: "",
  age: "",
  weight: "",
  height: "",
  gender: "",
  goal: "Hypertrophy",
  dailyTime: 45,
  daysPerWeek: 5,
  cuisine: "Standard",
  units: "metric",
  onboarded: false,
  currentWeek: 4,
  totalWeeks: 12,
  protein: 60,
  carbs: 95,
  fats: 28,
  fiber: 8,
  calories: 1200,
  loggedMeals: [],
};

export const dietMacroTargets: Record<string, { calories: number; protein: number; carbs: number; fats: number; fiber: number }> = {
  Standard: { calories: 2200, protein: 150, carbs: 250, fats: 65, fiber: 30 },
  Keto: { calories: 2000, protein: 130, carbs: 30, fats: 150, fiber: 20 },
  Vegan: { calories: 2100, protein: 120, carbs: 300, fats: 55, fiber: 40 },
  Mediterranean: { calories: 2200, protein: 140, carbs: 240, fats: 75, fiber: 35 },
  Paleo: { calories: 2100, protein: 160, carbs: 100, fats: 100, fiber: 25 },
};

interface UserContextValue {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  resetProgram: (updates: Partial<UserProfile>) => void;
  logMeal: (name: string, p: number, c: number, f: number, fi: number, cal: number) => void;
  deleteMeal: (id: string) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const resetProgram = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates, currentWeek: 1 }));
  };

  const logMeal = (name: string, p: number, c: number, f: number, fi: number, cal: number) => {
    const meal: LoggedMeal = { id: crypto.randomUUID(), name, protein: p, carbs: c, fats: f, fiber: fi, calories: cal, timestamp: Date.now() };
    setProfile((prev) => ({
      ...prev,
      protein: prev.protein + p,
      carbs: prev.carbs + c,
      fats: prev.fats + f,
      fiber: prev.fiber + fi,
      calories: prev.calories + cal,
      loggedMeals: [...prev.loggedMeals, meal],
    }));
  };

  const deleteMeal = (id: string) => {
    setProfile((prev) => {
      const meal = prev.loggedMeals.find((m) => m.id === id);
      if (!meal) return prev;
      return {
        ...prev,
        protein: Math.max(0, prev.protein - meal.protein),
        carbs: Math.max(0, prev.carbs - meal.carbs),
        fats: Math.max(0, prev.fats - meal.fats),
        fiber: Math.max(0, prev.fiber - meal.fiber),
        calories: Math.max(0, prev.calories - meal.calories),
        loggedMeals: prev.loggedMeals.filter((m) => m.id !== id),
      };
    });
  };

  return (
    <UserContext.Provider value={{ profile, setProfile, resetProgram, logMeal, deleteMeal }}>
      {children}
    </UserContext.Provider>
  );
};
