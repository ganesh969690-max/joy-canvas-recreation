import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "@supabase/supabase-js/cors";

const USDA_API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("USDA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "USDA API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      `${USDA_API_URL}?api_key=${apiKey}&query=${encodeURIComponent(query.trim())}&pageSize=10&dataType=Survey (FNDDS)`,
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("USDA API error:", text);
      return new Response(
        JSON.stringify({ error: "Failed to fetch from USDA API" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    const foods = (data.foods || []).map((food: any) => {
      const getNutrient = (id: number): number => {
        const n = food.foodNutrients?.find((fn: any) => fn.nutrientId === id);
        return n ? Math.round(n.value) : 0;
      };

      return {
        name: food.description || "Unknown",
        calories: getNutrient(1008),
        protein: getNutrient(1003),
        carbs: getNutrient(1005),
        fat: getNutrient(1004),
        fiber: getNutrient(1079),
      };
    });

    return new Response(
      JSON.stringify({ foods }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("food-search error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
