

## Plan: Connect Workout AI Features to Lovable AI

### What we're building
Replace the hardcoded mock workout generation and adjustment with real AI calls via a `generate-workout` edge function that uses Lovable AI Gateway with structured output (tool calling).

### Step 1: Create `supabase/functions/generate-workout/index.ts`

- Accept POST with `{ type: "generate" | "adjust", time?, equipment?, constraints?, goals?, currentWorkout? }`
- Validate input
- Build a fitness-expert system prompt; for `"adjust"`, include the current workout context and the user's constraint
- Call Lovable AI Gateway (`google/gemini-3-flash-preview`) with tool-calling to extract structured output matching:
  ```json
  {
    "name": "generate_workout",
    "parameters": {
      "title": "string",
      "intensity": "Low|Medium|High|Max",
      "equipment": ["string"],
      "exercises": [{ "name": "string", "sets": "string", "reps": "string" }]
    }
  }
  ```
- Handle CORS, 429/402 errors, parse tool call response, return workout JSON
- `LOVABLE_API_KEY` is already configured — no new secrets needed

### Step 2: Update `WorkoutsView.tsx` — Generate Custom AI Routine

- Replace `handleGenerate()` mock `setTimeout` with `supabase.functions.invoke('generate-workout', { body: { type: "generate", time: genTime, equipment: genEquip, constraints: genConstraint, goals: genGoal } })`
- Store the AI-returned exercises in new state (`generatedWorkout`) instead of using the hardcoded `generatedExercises` array
- When user clicks "START WORKOUT" in the generator result, set `currentWorkout` to the AI-generated workout
- Show error toast on failure; keep loading spinner UX

### Step 3: Update `WorkoutsView.tsx` — Adjust Today's Workout

- Replace `handleAdapt()` mock `setTimeout` + static lookup with `supabase.functions.invoke('generate-workout', { body: { type: "adjust", prompt, currentWorkout } })`
- Set the returned workout as the new `currentWorkout`
- Keep the existing loading spinner UX during the AI call
- Show error toast on failure

### Technical Details

- No database changes needed
- No new secrets needed (`LOVABLE_API_KEY` already exists)
- Edge function uses non-streaming `invoke` pattern
- The `generatedExercises` constant and `modifications`/`promptToModKey` imports become unused and will be removed
- The generated result UI will adapt slightly: since AI returns `sets` and `reps` separately (not a combined string with a `note`), the display will show `sets × reps` format consistent with the active workout view

