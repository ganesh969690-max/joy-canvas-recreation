

## Plan: Add USDA Food Search via Edge Function

### What we're building
A backend edge function that proxies requests to the USDA FoodData Central API, and frontend integration so users can search real foods from the search bar in the Nutrition tab.

### Step 1: Get USDA API Key
- The USDA FoodData Central API requires an API key (free from https://fdc.nal.usda.gov/api-key-signup)
- Use the `add_secret` tool to request the user provide their `USDA_API_KEY`

### Step 2: Create Edge Function `food-search`
- `supabase/functions/food-search/index.ts`
- Accepts `POST` with `{ query: string }` body
- Validates input with Zod
- Calls `https://api.nal.usda.gov/fdc/v1/foods/search` with the stored API key
- Returns simplified results: `{ foods: [{ name, calories, protein, carbs, fat, fiber }] }`
- Includes CORS headers and error handling

### Step 3: Update NutritionView search UI
- Add state for search results and loading
- On typing in the search bar (debounced ~400ms), call the edge function via `supabase.functions.invoke('food-search', { body: { query } })`
- Display a dropdown list of matching foods below the search input
- Clicking a food item opens the existing confirmation/edit card with that food's macros pre-filled

### Technical Details
- Edge function uses `Deno.env.get('USDA_API_KEY')` for the key
- USDA API returns nutrients by ID: energy (1008), protein (1003), carbs (1005), fat (1004), fiber (1079)
- Frontend debounce via `setTimeout`/`clearTimeout` pattern
- Search results dropdown styled consistently with existing card/secondary design tokens

