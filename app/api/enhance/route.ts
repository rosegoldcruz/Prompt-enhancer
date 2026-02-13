import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_PROMPT_LENGTH = 12_000;
const MAX_CONTEXT_LENGTH = 1_000;

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

const VALID_ENHANCEMENT_LEVELS: Array<EnhancementLevel> = ["quick", "smart", "comprehensive"];

function truncateText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

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

  const normalizedPrompt = prompt.trim();
  if (normalizedPrompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Prompt exceeds ${MAX_PROMPT_LENGTH} characters` },
      { status: 400 }
    );
  }

  const normalizedLevel = VALID_ENHANCEMENT_LEVELS.includes(enhancementLevel as EnhancementLevel)
    ? enhancementLevel
    : "smart";

  const normalizedContext = {
    projectType: truncateText(context?.projectType, MAX_CONTEXT_LENGTH),
    framework: truncateText(context?.framework, MAX_CONTEXT_LENGTH),
    teamConventions: truncateText(context?.teamConventions, MAX_CONTEXT_LENGTH)
  };

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

  try {
    const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      signal: abortController.signal,
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
            content: buildSystemPrompt(normalizedContext, normalizedLevel)
          },
          {
            role: "user",
            content: normalizedPrompt
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
      return NextResponse.json({ error: "Enhancement request timed out" }, { status: 504 });
    }

    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}
