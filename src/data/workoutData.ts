export interface Exercise {
  name: string;
  sets: number | string;
  reps: string;
}

export interface Workout {
  title: string;
  intensity: string;
  equipment: string[];
  toast_message?: string;
  exercises: Exercise[];
}

export const defaultWorkout: Workout = {
  title: "45-Min Heavy Lower Body",
  intensity: "High",
  equipment: ["Barbell", "Plates", "Squat Rack"],
  exercises: [
    { name: "Barbell Back Squat", sets: 4, reps: "8-10" },
    { name: "Romanian Deadlift", sets: 4, reps: "10-12" },
    { name: "Weighted Walking Lunges", sets: 3, reps: "20 steps" },
  ],
};

export const modifications: Record<string, Workout> = {
  hotel_gym: {
    title: "30-Min Dumbbell Metcon",
    intensity: "High",
    equipment: ["Dumbbells", "Bench"],
    toast_message: "Workout adapted for Hotel Gym equipment.",
    exercises: [
      { name: "Dumbbell Goblet Squat", sets: 4, reps: "15" },
      { name: "Dumbbell Bulgarian Split Squat", sets: 3, reps: "12 per leg" },
      { name: "Dumbbell RDL to Shrug", sets: 3, reps: "15" },
    ],
  },
  bad_knee: {
    title: "40-Min Low-Impact Glutes & Core",
    intensity: "Medium",
    equipment: ["Mat", "Resistance Band"],
    toast_message: "High-impact axial loading removed for knee safety.",
    exercises: [
      { name: "Banded Glute Bridges", sets: 4, reps: "20" },
      { name: "Lying Clamshells", sets: 3, reps: "15 per leg" },
      { name: "Deadbugs", sets: 3, reps: "20" },
    ],
  },
  only_15_mins: {
    title: "15-Min Lower Body AMRAP",
    intensity: "Max",
    equipment: ["Bodyweight"],
    toast_message: "Condensed into a 15-minute high-intensity circuit.",
    exercises: [
      { name: "Jump Squats", sets: "AMRAP", reps: "15" },
      { name: "Alternating Reverse Lunges", sets: "AMRAP", reps: "20" },
      { name: "Plank Jacks", sets: "AMRAP", reps: "30" },
    ],
  },
};

export const promptToModKey: Record<string, string> = {
  "Hotel gym (Dumbbells only)": "hotel_gym",
  "I slept poorly": "bad_knee",
  "Only have 20 mins": "only_15_mins",
  "Too Sore": "bad_knee",
  "No Equipment": "only_15_mins",
  "Less Time": "only_15_mins",
  "Different Muscle Group": "hotel_gym",
};
