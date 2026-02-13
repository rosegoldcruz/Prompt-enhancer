import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

type EnhancementLevel = "quick" | "smart" | "comprehensive";

type EnhanceBody = {
  prompt?: string;
  context?: {
    projectType?: string;
    framework?: string;
    teamConventions?: string;
  };
  enhancementLevel?: EnhancementLevel;
};

function buildSystemPrompt(
  context: EnhanceBody["context"],
  enhancementLevel: EnhancementLevel | undefined
) {
  const projectType = context?.projectType || "general";
  const framework = context?.framework && context.framework !== "none" ? context.framework : "unspecified";
  const teamConventions = (context?.teamConventions || "").trim();
  const level = enhancementLevel || "smart";

  return [
    "You are an expert prompt enhancement assistant.",
    "Your job is to rewrite a user prompt into a clearer, more actionable prompt while preserving user intent.",
    "Return only the final enhanced prompt text with no markdown fences and no extra commentary.",
    `Enhancement level: ${level}.`,
    `Project type: ${projectType}.`,
    `Framework: ${framework}.`,
    teamConventions ? `Team conventions: ${teamConventions}.` : "Team conventions: none provided.",
    "Focus on structure, specificity, constraints, acceptance criteria, and expected output format when relevant."
  ].join(" ");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing DEEPSEEK_API_KEY in server environment" },
      { status: 500 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as EnhanceBody;
  const { prompt, context, enhancementLevel } = body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(context, enhancementLevel)
          },
          {
            role: "user",
            content: prompt.trim()
          }
        ]
      })
    });

    const payload = await deepseekResponse.json().catch(() => ({}));

    if (!deepseekResponse.ok) {
      const errorField = (payload as { error?: string | { message?: string } }).error;
      const deepseekMessage =
        typeof errorField === "string"
          ? errorField
          : errorField?.message || "DeepSeek request failed";

      return NextResponse.json({ error: deepseekMessage }, { status: deepseekResponse.status });
    }

    const enhancedPrompt = (payload as { choices?: Array<{ message?: { content?: string } }> })
      ?.choices?.[0]?.message?.content
      ?.trim();

    if (!enhancedPrompt) {
      return NextResponse.json({ error: "DeepSeek returned an empty response" }, { status: 502 });
    }

    return NextResponse.json({ enhancedPrompt }, { status: 200 });
  } catch (error) {
    if ((error as { name?: string })?.name === "AbortError") {
      return NextResponse.json({ error: "Request cancelled" }, { status: 499 });
    }

    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 });
  }
}
