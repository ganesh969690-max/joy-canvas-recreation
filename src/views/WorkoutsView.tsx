import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Clock, Dumbbell, AlertCircle, Loader2, Play, Pause, Square, Check } from "lucide-react";
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

const quickPrompts = [
  "Too Sore",
  "No Equipment",
  "Less Time",
  "Different Muscle Group",
];

const browseWorkouts = [
  { image: upperImg, title: "Upper Body Strength", subtitle: "30 min · High" },
  { image: coreImg, title: "Core Crusher", subtitle: "20 min · Medium" },
  { image: cardioImg, title: "HIIT Cardio Blast", subtitle: "15 min · Very High" },
  { image: yogaImg, title: "Yoga Flow", subtitle: "25 min · Low" },
  { image: mobilityImg, title: "Recovery Mobility", subtitle: "15 min · Low" },
];

const WorkoutsView = ({ onPlayingChange }: { onPlayingChange?: (playing: boolean) => void }) => {
  const { toast } = useToast();
  const { profile } = useUser();
  const [currentWorkout, setCurrentWorkout] = useState<Workout>(defaultWorkout);
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<Workout | null>(null);
  const [genTime, setGenTime] = useState("20");
  const [genEquip, setGenEquip] = useState("5kg Dumbbells");
  const [genConstraint, setGenConstraint] = useState("");
  const [genGoal, setGenGoal] = useState("");

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
    setAdjusting(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: { type: "adjust", prompt, currentWorkout },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const workout = data.workout as Workout;
      setCurrentWorkout(workout);
      setShowAdjust(false);
      toast({ title: "Workout Adapted ✓", description: `Switched to: ${workout.title}` });
    } catch (err: any) {
      console.error("Adapt error:", err);
      toast({ title: "Error", description: err.message || "Failed to adapt workout", variant: "destructive" });
    } finally {
      setAdjusting(false);
    }
  };

  const handleGenerate = async () => {
    setGenLoading(true);
    setGenResult(false);
    setGeneratedWorkout(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: { type: "generate", time: genTime, equipment: genEquip, constraints: genConstraint, goals: genGoal },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setGeneratedWorkout(data.workout as Workout);
      setGenResult(true);
    } catch (err: any) {
      console.error("Generate error:", err);
      toast({ title: "Error", description: err.message || "Failed to generate workout", variant: "destructive" });
    } finally {
      setGenLoading(false);
    }
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
          <div className="space-y-2">
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
        onClick={() => { setShowAdjust(true); setAdjusting(false); }}
        className="w-full card-premium flex items-center justify-center gap-2 mb-3 active:scale-[0.98] transition-transform"
      >
        <Sparkles size={16} className="text-nike-volt" />
        <span className="text-xs font-black uppercase tracking-wider">✨ Adjust Today's Workout</span>
      </button>

      <button
        onClick={() => { setShowGenerator(true); setGenResult(false); setGenLoading(false); setGeneratedWorkout(null); }}
        className="w-full flex items-center justify-center gap-2 border border-border rounded-2xl py-3 mb-6 active:scale-[0.98] transition-transform"
      >
        <Sparkles size={16} className="text-nike-volt" />
        <span className="text-xs font-black uppercase tracking-wider">✨ Generate Custom AI Routine</span>
      </button>

      <h2 className="text-nike-header text-sm mb-3">BROWSE WORKOUTS</h2>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
        {browseWorkouts.map((w) => (
          <WorkoutCard key={w.title} image={w.image} title={w.title} subtitle={w.subtitle} />
        ))}
      </div>

      {showAdjust && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-background w-full max-w-lg rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300 rounded-3xl">
            {adjusting ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="bg-primary rounded-full p-6">
                  <Loader2 size={32} className="text-nike-volt animate-spin" />
                </div>
                <p className="text-sm font-bold text-center">Generating...</p>
                <p className="text-xs text-muted-foreground text-center">AI is rebuilding your workout...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-nike-header text-lg">ADJUST WORKOUT</h2>
                  <button onClick={() => setShowAdjust(false)} className="p-1"><X size={24} /></button>
                </div>
                <div className="card-premium mb-5">
                  <div className="flex items-start gap-2">
                    <Sparkles size={16} className="text-nike-volt mt-0.5 flex-shrink-0" />
                    <p className="text-primary-foreground/80 text-xs leading-relaxed">
                      Your readiness is low today. We suggest you swap your {profile.dailyTime}-min Heavy Squat session for a 15-min Recovery Mobility flow.
                    </p>
                  </div>
                </div>
                <div className="flex-wrap gap-2 mb-4 flex-row flex items-center justify-center">
                  {quickPrompts.map((p) => (
                    <button key={p} onClick={() => handleAdapt(p)} className="chip-filter active:scale-95 transition-transform">{p}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showGenerator && (
        <div className="fixed inset-0 z-[60] bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4 py-[16px]">
           <div className="bg-background w-full max-w-lg max-h-[85vh] rounded-3xl p-6 pb-8 animate-in zoom-in-95 duration-300 text-xs font-thin overflow-y-auto my-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-nike-header text-lg">CUSTOM AI ROUTINE</h2>
              <button onClick={() => setShowGenerator(false)} className="p-1"><X size={24} /></button>
            </div>
            {!genResult ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Time Available</label>
                  <input value={genTime} onChange={(e) => setGenTime(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold bg-secondary focus:outline-none focus:ring-2 focus:ring-foreground" placeholder="e.g., 20 mins" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Equipment</label>
                  <input value={genEquip} onChange={(e) => setGenEquip(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold bg-secondary focus:outline-none focus:ring-2 focus:ring-foreground" placeholder="e.g., 5kg Dumbbells" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Constraints</label>
                  <input value={genConstraint} onChange={(e) => setGenConstraint(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold bg-secondary focus:outline-none focus:ring-2 focus:ring-foreground" placeholder="e.g., Bad right knee" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Specific Goals</label>
                  <textarea value={genGoal} onChange={(e) => setGenGoal(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold bg-secondary focus:outline-none focus:ring-2 focus:ring-foreground resize-none" rows={2} placeholder="e.g., Focus on glutes and hamstrings" />
                </div>
                <button onClick={handleGenerate} disabled={genLoading} className="btn-volt w-full text-center flex items-center justify-center gap-2 py-4">
                  {genLoading ? (<><Loader2 size={18} className="animate-spin" /><span>Generating...</span></>) : "Generate"}
                </button>
              </div>
            ) : generatedWorkout ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-nike-volt" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{generatedWorkout.title}</span>
                </div>
                <div className="flex gap-3 mb-2">
                  <span className="text-xs text-muted-foreground font-semibold">Intensity: {generatedWorkout.intensity}</span>
                  <span className="text-xs text-muted-foreground font-semibold">Equipment: {generatedWorkout.equipment.join(", ")}</span>
                </div>
                <div className="max-h-[280px] overflow-y-auto space-y-3 pr-1 workout-scrollbar">
                  {generatedWorkout.exercises.map((ex, i) => (
                    <div key={i} className="bg-secondary rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-black text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                          <h4 className="font-bold text-sm mt-0.5">{ex.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{ex.sets} sets × {ex.reps}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setCurrentWorkout(generatedWorkout); handleStartWorkout(); setShowGenerator(false); }} className="btn-volt w-full text-center py-4">START WORKOUT</button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutsView;
