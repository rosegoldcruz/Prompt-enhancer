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
  const level = enhancementLevel || "smart";

  if (level === "quick") {
    return "You are a prompt editor. Take the user's raw input and return one clean, improved version. Fix grammar, cut filler, add specificity where obvious. Do not add length for its own sake. Output only the improved prompt — no explanations, no preamble, no quotes.";
  }

  if (level === "comprehensive") {
    return "You are a senior prompt engineer specializing in AI systems and agentic workflows. Transform the user's raw input into a fully engineered prompt with this structure: Role, Context, Objective, Requirements (bulleted), Constraints, Output format. The result must be deployable in a production AI pipeline with zero ambiguity. Output only the final engineered prompt — nothing else.";
  }

  return "You are a prompt engineer. Rewrite the user's input into a structured, high-performance prompt. Rules: (1) Add a clear role or context frame if missing. (2) Make the goal explicit and measurable. (3) Surface implied constraints and requirements. (4) Specify the desired output format. (5) Eliminate all vagueness. Output only the rewritten prompt — no commentary, no wrapper text, no explanation of changes.";
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
