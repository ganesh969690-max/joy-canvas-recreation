import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const workoutTool = {
  type: "function",
  function: {
    name: "generate_workout",
    description: "Generate a structured workout plan",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        intensity: { type: "string", enum: ["Low", "Medium", "High", "Max"] },
        equipment: { type: "array", items: { type: "string" } },
        exercises: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              sets: { type: "string" },
              reps: { type: "string" },
            },
            required: ["name", "sets", "reps"],
          },
        },
      },
      required: ["title", "intensity", "equipment", "exercises"],
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, time, equipment, constraints, goals, currentWorkout, prompt } = await req.json();

    if (!type || !["generate", "adjust"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "type must be 'generate' or 'adjust'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert certified personal trainer and exercise scientist. Create safe, effective workout plans. Always use the generate_workout tool to return your answer.`;

    let userPrompt: string;
    if (type === "generate") {
      userPrompt = `Create a ${time || "20"}-minute workout routine.
Equipment available: ${equipment || "bodyweight only"}.
${constraints ? `Constraints/injuries: ${constraints}.` : ""}
${goals ? `Goals: ${goals}.` : ""}
Include 4-6 exercises with appropriate sets and reps.`;
    } else {
      const wk = currentWorkout;
      const exerciseList = wk?.exercises?.map((e: any) => `${e.name}: ${e.sets} sets × ${e.reps}`).join("\n") || "none";
      userPrompt = `Adjust this workout based on the constraint: "${prompt}"

Current workout:
Title: ${wk?.title || "Unknown"}
Intensity: ${wk?.intensity || "Medium"}
Equipment: ${wk?.equipment?.join(", ") || "various"}
Exercises:
${exerciseList}

Modify the workout to accommodate the constraint while keeping it effective.`;
    }

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [workoutTool],
        tool_choice: { type: "function", function: { name: "generate_workout" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Failed to generate workout" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const workout = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ workout }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-workout error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
