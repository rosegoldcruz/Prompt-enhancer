import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
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

function buildEnhancementPrompt(
  enhancementLevel: EnhancementLevel | undefined
) {
  const level = enhancementLevel || "smart";

  const quickFramework = `QUICK enhancement rules:
- Add missing role context only where truly needed
- Clarify the output format (e.g. "respond with a JSON object", "output as bullet points")
- Remove filler language and vague wording
- Keep the result at most 20% longer than the original
- Do NOT add generic expert personas, "as an AI language model", or unnecessary flattery`;

  const smartFramework = `SMART enhancement rules:
- Structure the prompt as: Role → Task → Output Format
- Inject relevant constraints based on the detected task type (e.g. language/stack for CODE, audience for CREATIVE, depth for ANALYSIS)
- For reasoning or multi-step tasks, append "Think step by step before answering"
- Add a clear output spec: what does a complete answer look like?
- Do NOT add generic expert personas or "as an AI language model"`;

  const comprehensiveFramework = `COMPREHENSIVE enhancement rules:
- Add Chain of Thought scaffolding: "Before answering, break this problem into steps and work through each one"
- If the task is pattern-based (e.g. generating multiple items of the same kind), include 1-2 concrete examples
- Add edge case handling instructions relevant to the task type
- Add validation criteria at the end: "After completing your answer, self-check: does it meet all the constraints above?"
- Do NOT add generic expert personas or "as an AI language model"`;

  const levelFramework =
    level === "quick" ? quickFramework :
    level === "comprehensive" ? comprehensiveFramework :
    smartFramework;

  return `You are a prompt enhancement engine. Do NOT output commentary, explanations, or meta-text. Output ONLY a single JSON object.

STEP 1 — Classify the user's raw prompt into exactly ONE type:
- CODE: building, fixing, debugging, implementing code or software
- ANALYSIS: comparing, evaluating, researching, explaining concepts
- CREATIVE: writing, designing, branding, storytelling, content creation
- STRUCTURED_OUTPUT: generating lists, tables, schemas, plans, structured data
- AMBIGUOUS: unclear goal, missing context, too vague to act on

STEP 2A — If AMBIGUOUS, output EXACTLY this JSON and nothing else:
{"type":"ambiguous","questions":["question 1","question 2","question 3"]}

Generate 2-3 specific clarifying questions that would resolve the ambiguity. Target:
- What is the end goal or output format?
- Who is the audience or system receiving this?
- What constraints exist (stack, tone, length, role)?

STEP 2B — If the prompt is clear (CODE, ANALYSIS, CREATIVE, or STRUCTURED_OUTPUT), enhance it using the framework below, then output EXACTLY this JSON and nothing else:
{"type":"enhanced","prompt":"the full enhanced prompt text here"}

${levelFramework}

CRITICAL OUTPUT RULES:
- Never include "as an AI language model" or similar self-referential disclaimers
- Never use generic expert personas ("world-class expert", "renowned professional", "seasoned veteran")
- Do not make the prompt longer just to look enhanced — every addition must add functional precision
- Output ONLY the JSON object — no markdown fences, no preamble, no "here is your prompt"`;
}

type EnhancerResponse =
  | { type: "ambiguous"; questions: string[] }
  | { type: "enhanced"; prompt: string }
  | { type: "unparseable" };

function parseEnhancerResponse(raw: string): EnhancerResponse {
  // Try to extract a JSON object from the response
  // The model may wrap it in markdown fences or add surrounding text
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { type: "unparseable" };

  try {
    const obj = JSON.parse(jsonMatch[0]);

    if (obj.type === "ambiguous" && Array.isArray(obj.questions)) {
      const questions = obj.questions.filter(
        (q: unknown): q is string => typeof q === "string" && q.trim().length > 0
      );
      if (questions.length > 0) {
        return { type: "ambiguous", questions };
      }
    }

    if (obj.type === "enhanced" && typeof obj.prompt === "string" && obj.prompt.trim().length > 0) {
      return { type: "enhanced", prompt: obj.prompt.trim() };
    }
  } catch {
    // JSON parse failed
  }

  return { type: "unparseable" };
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

  // Build user message with optional context injected
  const contextParts: string[] = [];
  if (normalizedContext.projectType) contextParts.push(`Project type: ${normalizedContext.projectType}`);
  if (normalizedContext.framework) contextParts.push(`Framework: ${normalizedContext.framework}`);
  if (normalizedContext.teamConventions) contextParts.push(`Conventions: ${normalizedContext.teamConventions}`);

  const userMessage = contextParts.length > 0
    ? `${normalizedPrompt}\n\nAdditional context:\n${contextParts.join("\n")}`
    : normalizedPrompt;

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
            content: buildEnhancementPrompt(normalizedLevel)
          },
          {
            role: "user",
            content: userMessage
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

    const rawContent = (payload as { choices?: Array<{ message?: { content?: string } }> })
      ?.choices?.[0]?.message?.content
      ?.trim();

    if (!rawContent) {
      return NextResponse.json({ error: "DeepSeek returned an empty response" }, { status: 502 });
    }

    // Parse the structured JSON response from the enhancer
    const parsed = parseEnhancerResponse(rawContent);

    if (parsed.type === "ambiguous") {
      return NextResponse.json({ clarifyingQuestions: parsed.questions }, { status: 200 });
    }

    if (parsed.type === "enhanced") {
      return NextResponse.json({ enhancedPrompt: parsed.prompt }, { status: 200 });
    }

    // Fallback: treat the raw content as the enhanced prompt
    return NextResponse.json({ enhancedPrompt: rawContent }, { status: 200 });
  } catch (error) {
    if ((error as { name?: string })?.name === "AbortError") {
      return NextResponse.json({ error: "Enhancement request timed out" }, { status: 504 });
    }

    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}
