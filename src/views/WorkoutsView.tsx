import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Clock, Loader2, Play, Pause, Square, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import WorkoutCard from "@/components/WorkoutCard";
import { defaultWorkout, type Workout } from "@/data/workoutData";
import { supabase } from "@/integrations/supabase/client";
import legsImg from "@/assets/workout-legs.jpg";
import metconImg from "@/assets/workout-dumbbell-metcon.jpg";
import yogaImg from "@/assets/workout-yoga.jpg";
import coreImg from "@/assets/workout-core.jpg";
import upperImg from "@/assets/workout-upper.jpg";
import cardioImg from "@/assets/workout-cardio.jpg";
import mobilityImg from "@/assets/workout-mobility.jpg";

const browseWorkouts = [
  { image: upperImg, title: "Upper Body Strength", subtitle: "30 min · High" },
  { image: coreImg, title: "Core Crusher", subtitle: "20 min · Medium" },
  { image: cardioImg, title: "HIIT Cardio Blast", subtitle: "15 min · Very High" },
  { image: yogaImg, title: "Yoga Flow", subtitle: "25 min · Low" },
  { image: mobilityImg, title: "Recovery Mobility", subtitle: "15 min · Low" },
];

const moodOptions = ["Full Send", "Take It Easy", "Something Different", "Technique Focus"];

const WorkoutsView = ({ onPlayingChange }: { onPlayingChange?: (playing: boolean) => void }) => {
  const { toast } = useToast();
  const { profile } = useUser();
  const [currentWorkout, setCurrentWorkout] = useState<Workout>(defaultWorkout);

  const [showBuilder, setShowBuilder] = useState(false);
  const [builderLoading, setBuilderLoading] = useState(false);
  const [builderTime, setBuilderTime] = useState(profile.dailyTime + " mins");
  const [builderEquip, setBuilderEquip] = useState("Barbell, Plates, Squat Rack");
  const [builderConstraints, setBuilderConstraints] = useState("");
  const [builderGoals, setBuilderGoals] = useState("");
  const [builderMoods, setBuilderMoods] = useState<string[]>([]);

  const sleepPoor = true;
  const hrvLow = true;

  const autoConstraint =
    sleepPoor && hrvLow
      ? "Poor sleep (4h 20m), low HRV — reduce intensity, avoid heavy axial loading, keep it recovery-friendly."
      : sleepPoor
      ? "Poor sleep (4h 20m) — reduce volume by ~20%."
      : hrvLow
      ? "Low HRV — deload session, focus on technique."
      : "";

  const [playing, setPlayingState] = useState(false);
  const setPlaying = (v: boolean) => {
    setPlayingState(v);
    onPlayingChange?.(v);
  };
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [checkedExercises, setCheckedExercises] = useState<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isDefault = currentWorkout.title === defaultWorkout.title;
  const workoutImg = isDefault ? legsImg : metconImg;
  const workoutTitle = isDefault
    ? `${profile.dailyTime}-Min Heavy Lower Body`
    : currentWorkout.title;

  useEffect(() => {
    if (playing && !paused) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, paused]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleStartWorkout = () => {
    setPlaying(true);
    setPaused(false);
    setElapsed(0);
    setCheckedExercises(new Set());
  };

  const handleStopWorkout = () => {
    setPlaying(false);
    setPaused(false);
    setElapsed(0);
    toast({ title: "WORKOUT COMPLETE", description: `Great session! ${formatTime(elapsed)} logged.` });
  };

  const toggleExercise = (i: number) => {
    setCheckedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const handleAdapt = async (prompt: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: { type: "adjust", prompt, currentWorkout },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const workout = data.workout as Workout;
      setCurrentWorkout(workout);
      toast({ title: "Workout Adapted ✓", description: `Switched to: ${workout.title}` });
    } catch (err: any) {
      console.error("Adapt error:", err);
      toast({ title: "Error", description: err.message || "Failed to adapt workout", variant: "destructive" });
    }
  };

  const handleBuilderSubmit = async () => {
    setBuilderLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: {
          type: "generate",
          time: builderTime,
          equipment: builderEquip,
          constraints: builderConstraints,
          goals: [builderGoals, ...builderMoods].filter(Boolean).join(", "),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCurrentWorkout(data.workout as Workout);
      setShowBuilder(false);
      toast({ title: "Workout Ready 💪", description: (data.workout as Workout).title });
    } catch (err: any) {
      console.error("Generate error:", err);
      toast({ title: "Error", description: err.message || "Failed to generate workout", variant: "destructive" });
    } finally {
      setBuilderLoading(false);
    }
  };

  const toggleMood = (mood: string) => {
    setBuilderMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const openBuilder = () => {
    setBuilderTime(profile.dailyTime + " mins");
    setBuilderConstraints(autoConstraint);
    setBuilderGoals("");
    setBuilderMoods([]);
    setBuilderLoading(false);
    setShowBuilder(true);
  };

  if (playing) {
    const exercises = currentWorkout.exercises;
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 px-5 pt-14 pb-28 max-w-lg mx-auto w-full">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Active Session
          </p>
          <h1 className="text-nike-header text-xl mb-6">{workoutTitle}</h1>

          <div className="flex items-center justify-center mb-8">
            <div className="bg-primary rounded-3xl px-12 py-8">
              <p className="text-primary-foreground font-black text-5xl tracking-tight font-mono">
                {formatTime(elapsed)}
              </p>
            </div>
          </div>

          <h3 className="text-nike-header text-sm mb-3">EXERCISES</h3>
          <div className={`space-y-2 ${exercises.length > 3 ? "max-h-[280px] overflow-y-auto workout-scrollbar pr-1" : ""}`}>
            {exercises.map((ex, i) => (
              <button
                key={i}
                onClick={() => toggleExercise(i)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  checkedExercises.has(i)
                    ? "border-nike-volt bg-nike-volt/10"
                    : "border-border bg-secondary"
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  checkedExercises.has(i) ? "border-nike-volt bg-nike-volt" : "border-muted-foreground"
                }`}>
                  {checkedExercises.has(i) && <Check size={14} className="text-foreground" />}
                </div>
                <div className="text-left flex-1">
                  <p className={`font-bold text-sm ${checkedExercises.has(i) ? "line-through text-muted-foreground" : ""}`}>
                    {ex.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {typeof ex.sets === "number" ? `${ex.sets} sets` : ex.sets} × {ex.reps}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
          <div className="max-w-lg mx-auto flex gap-3">
            <button
              onClick={() => { setElapsed(0); setCheckedExercises(new Set()); }}
              className="flex items-center justify-center gap-2 rounded-full px-6 py-4 font-bold text-sm uppercase tracking-wider bg-lime-400 text-destructive-foreground"
            >
              <Clock size={16} />
              Reset
            </button>
            <button
              onClick={() => setPaused(!paused)}
              className="flex-1 flex items-center justify-center gap-2 bg-secondary rounded-full py-4 font-bold text-sm uppercase tracking-wider"
            >
              {paused ? <Play size={18} /> : <Pause size={18} />}
              {paused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={handleStopWorkout}
              className="flex items-center justify-center gap-2 bg-destructive text-destructive-foreground rounded-full px-8 py-4 font-bold text-sm uppercase tracking-wider"
            >
              <Square size={16} />
              Stop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-24 max-w-lg mx-auto">
      <h1 className="text-nike-header text-2xl mb-5">WORKOUTS</h1>

      <div className="relative rounded-2xl overflow-hidden mb-2">
        <img src={workoutImg} alt={workoutTitle} className="w-full aspect-[16/9] object-cover transition-all duration-500" width={800} height={512} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-primary-foreground/60 text-xs font-semibold uppercase tracking-widest mb-1">Today's Workout</p>
          <h2 className="text-primary-foreground font-black text-lg uppercase tracking-tight leading-tight">{workoutTitle}</h2>
          <div className="flex gap-4 mt-2 mb-3">
            <span className="text-primary-foreground/70 text-xs font-semibold">Intensity: {currentWorkout.intensity}</span>
            <span className="text-primary-foreground/70 text-xs font-semibold">Equipment: {currentWorkout.equipment.join(", ")}</span>
          </div>
          <button className="btn-volt text-xs" onClick={handleStartWorkout}>
            Start Workout
          </button>
        </div>
      </div>

      <button
        onClick={openBuilder}
        className="w-full card-premium flex items-center justify-center gap-2 mb-6 active:scale-[0.98] transition-transform"
      >
        <Sparkles size={16} className="text-nike-volt" />
        <span className="text-xs font-black uppercase tracking-wider">✨ AI Workout Assistant</span>
      </button>

      <h2 className="text-nike-header text-sm mb-3">BROWSE WORKOUTS</h2>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
        {browseWorkouts.map((w) => (
          <WorkoutCard key={w.title} image={w.image} title={w.title} subtitle={w.subtitle} />
        ))}
      </div>

      {showBuilder && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background w-full max-w-lg max-h-[90vh] rounded-3xl p-6 animate-in zoom-in-95 duration-300 overflow-y-auto workout-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-nike-header text-lg">BUILD MY WORKOUT</h2>
              <button onClick={() => setShowBuilder(false)} className="p-1"><X size={24} /></button>
            </div>

            {/* 1. Readiness Banner */}
            <div className="card-premium mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-primary-foreground/70">Sleep</span>
                    <span className="text-xs font-bold">4h 20m</span>
                    <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Poor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-primary-foreground/70">HRV</span>
                    <span className="text-xs font-bold">Low</span>
                    <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Low</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                  sleepPoor || hrvLow
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-green-500 text-white"
                }`}>
                  {sleepPoor || hrvLow ? "Low Readiness" : "Good Readiness"}
                </span>
              </div>
              <p className="text-muted-foreground text-xs mt-2">
                {sleepPoor && hrvLow
                  ? "Poor sleep & low HRV detected."
                  : sleepPoor
                  ? "Low sleep detected."
                  : "Low HRV detected."}
              </p>
              <p className="text-primary-foreground/50 text-[10px] mt-1">
                These have been factored into your constraints automatically.
              </p>
            </div>

            <div className="space-y-4">
              {/* 2. Time */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Time Available</label>
                <input
                  value={builderTime}
                  onChange={(e) => setBuilderTime(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold bg-secondary focus:outline-none focus:ring-2 focus:ring-foreground"
                />
              </div>

              {/* 3. Equipment */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Equipment</label>
                <input
                  value={builderEquip}
                  onChange={(e) => setBuilderEquip(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold bg-secondary focus:outline-none focus:ring-2 focus:ring-foreground"
                />
              </div>

              {/* 4. Constraints */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Constraints</label>
                <textarea
                  value={builderConstraints}
                  onChange={(e) => setBuilderConstraints(e.target.value)}
                  rows={3}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold bg-secondary focus:outline-none focus:ring-2 focus:ring-foreground resize-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Auto-filled from your Health readiness. Edit freely.</p>
              </div>

              {/* 5. Goals */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Goals / Focus</label>
                <textarea
                  value={builderGoals}
                  onChange={(e) => setBuilderGoals(e.target.value)}
                  rows={2}
                  placeholder="e.g. focus on glutes, avoid chest, hit upper body..."
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold bg-secondary focus:outline-none focus:ring-2 focus:ring-foreground resize-none"
                />
              </div>

              {/* 6. Mood */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Mood</label>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => toggleMood(mood)}
                      className={`${builderMoods.includes(mood) ? "chip-filter-active" : "chip-filter"} active:scale-95 transition-transform`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Submit */}
              <button
                onClick={handleBuilderSubmit}
                disabled={builderLoading}
                className="btn-volt w-full text-center flex items-center justify-center gap-2 py-4"
              >
                {builderLoading ? (
                  <><Loader2 size={18} className="animate-spin" /><span>Generating...</span></>
                ) : (
                  "GENERATE WORKOUT"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutsView;
