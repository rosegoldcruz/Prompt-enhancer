"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy } from "lucide-react";
import { AceternityGlowCard } from "@/components/ui/aceternity-glow-card";
import { MagicSegmentedToggle } from "@/components/ui/magic-segmented-toggle";
import { MagicShimmerButton } from "@/components/ui/magic-shimmer-button";

type EnhancementLevel = "quick" | "smart" | "comprehensive";

const LEVEL_OPTIONS: Array<{ label: string; value: EnhancementLevel }> = [
  { label: "Quick", value: "quick" },
  { label: "Smart", value: "smart" },
  { label: "Comprehensive", value: "comprehensive" }
];

export function Workspace() {
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [enhancementLevel, setEnhancementLevel] = useState<EnhancementLevel>("smart");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clarification mode state
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[] | null>(null);
  const [clarificationAnswers, setClarificationAnswers] = useState<string[]>([]);
  const lastPromptRef = useRef("");

  const canEnhance = useMemo(() => prompt.trim().length > 0 && !isLoading, [prompt, isLoading]);

  async function onEnhance() {
    if (!canEnhance) return;

    setIsLoading(true);
    setError(null);
    setEnhancedPrompt("");
    setClarifyingQuestions(null);

    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          enhancementLevel
        })
      });

      const payload = (await response.json().catch(() => ({}))) as {
        enhancedPrompt?: string;
        clarifyingQuestions?: string[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Enhancement request failed");
      }

      if (payload.clarifyingQuestions && payload.clarifyingQuestions.length > 0) {
        setClarifyingQuestions(payload.clarifyingQuestions);
        setClarificationAnswers(payload.clarifyingQuestions.map(() => ""));
        lastPromptRef.current = prompt;
        return;
      }

      if (!payload.enhancedPrompt) {
        throw new Error("Enhancement service returned an empty response");
      }

      setEnhancedPrompt(payload.enhancedPrompt);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Failed to enhance prompt";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmitClarification() {
    const answers = clarificationAnswers.map(a => a.trim()).filter(Boolean);
    if (answers.length === 0 || !clarifyingQuestions) return;

    // Combine the original prompt with the user's clarification answers
    const qaPairs = clarifyingQuestions
      .map((q, i) => `Q: ${q}\nA: ${clarificationAnswers[i] || ""}`)
      .join("\n\n");

    const combinedPrompt = `${lastPromptRef.current}\n\nAdditional clarification:\n${qaPairs}`;

    setIsLoading(true);
    setError(null);
    setClarifyingQuestions(null);

    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: combinedPrompt,
          enhancementLevel
        })
      });

      const payload = (await response.json().catch(() => ({}))) as {
        enhancedPrompt?: string;
        clarifyingQuestions?: string[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Enhancement request failed");
      }

      if (payload.clarifyingQuestions && payload.clarifyingQuestions.length > 0) {
        // Still ambiguous — show the new questions
        setClarifyingQuestions(payload.clarifyingQuestions);
        setClarificationAnswers(payload.clarifyingQuestions.map(() => ""));
        return;
      }

      if (!payload.enhancedPrompt) {
        throw new Error("Enhancement service returned an empty response");
      }

      setEnhancedPrompt(payload.enhancedPrompt);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Failed to enhance prompt";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const canSubmitClarification = useMemo(
    () => clarificationAnswers.some(a => a.trim().length > 0) && !isLoading,
    [clarificationAnswers, isLoading]
  );

  async function onCopy() {
    if (!enhancedPrompt) return;
    await navigator.clipboard.writeText(enhancedPrompt);
  }

  function onDismissClarification() {
    setClarifyingQuestions(null);
    setClarificationAnswers([]);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <AceternityGlowCard>
        <div className="mb-4 flex items-start gap-3 sm:items-center">
          <Image
            src="/favicon_robofox/android-chrome-192x192.png"
            alt="Aeon Prompt Enhancer logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg"
            priority
          />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-tight text-zinc-100 sm:text-xl">Aeon Prompt Enhancer</h1>
          </div>
        </div>

        <div className="space-y-4">
          <MagicSegmentedToggle
            label="Enhancement Level"
            value={enhancementLevel}
            onChange={setEnhancementLevel}
            options={LEVEL_OPTIONS}
          />

          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium text-zinc-300">
              Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              readOnly={false}
              disabled={false}
              placeholder="Describe what you want to build or fix"
              className="min-h-36 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-gold/60"
            />
          </div>

          <MagicShimmerButton onClick={onEnhance} disabled={!canEnhance}>
            {isLoading ? "Enhancing..." : "Enhance Prompt"}
          </MagicShimmerButton>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        </div>
      </AceternityGlowCard>

      {/* Clarification questions card */}
      <AnimatePresence>
        {clarifyingQuestions ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <AceternityGlowCard>
              <div className="mb-3">
                <h2 className="text-base font-semibold text-zinc-100">Clarification Needed</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Your prompt needs more detail before it can be enhanced. Answer the questions below:
                </p>
              </div>
              <div className="space-y-3">
                {clarifyingQuestions.map((question, index) => (
                  <div key={index} className="space-y-1">
                    <label className="text-sm font-medium text-zinc-300">{question}</label>
                    <textarea
                      value={clarificationAnswers[index] || ""}
                      onChange={(event) => {
                        const next = [...clarificationAnswers];
                        next[index] = event.target.value;
                        setClarificationAnswers(next);
                      }}
                      placeholder="Your answer..."
                      className="min-h-20 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-gold/60"
                    />
                  </div>
                ))}
                <div className="flex gap-3">
                  <MagicShimmerButton onClick={onSubmitClarification} disabled={!canSubmitClarification}>
                    {isLoading ? "Enhancing..." : "Enhance with Context"}
                  </MagicShimmerButton>
                  <button
                    type="button"
                    onClick={onDismissClarification}
                    disabled={isLoading}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-700 px-4 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </AceternityGlowCard>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {enhancedPrompt ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <AceternityGlowCard>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-zinc-100">Enhanced Prompt</h2>
                <button
                  type="button"
                  onClick={onCopy}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm text-zinc-300 sm:w-auto"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
              <textarea
                value={enhancedPrompt}
                onChange={(event) => setEnhancedPrompt(event.target.value)}
                className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100 outline-none w-full"
              />
            </AceternityGlowCard>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
