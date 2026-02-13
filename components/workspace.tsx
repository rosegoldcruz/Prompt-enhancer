"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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

  const canEnhance = useMemo(() => prompt.trim().length > 0 && !isLoading, [prompt, isLoading]);

  async function onEnhance() {
    if (!canEnhance) return;

    setIsLoading(true);
    setError(null);

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
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Enhancement request failed");
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

  async function onCopy() {
    if (!enhancedPrompt) return;
    await navigator.clipboard.writeText(enhancedPrompt);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <AceternityGlowCard>
        <div className="mb-5 flex items-center gap-3">
          <Image
            src="/favicon_robofox/android-chrome-192x192.png"
            alt="Aeon Prompt Enhancer logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg"
            priority
          />
          <div>
            <h1 className="text-lg font-semibold text-zinc-100 sm:text-xl">Aeon Prompt Enhancer</h1>
            <p className="text-sm text-zinc-400">Easy prompt enhancement workspace</p>
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

      <AnimatePresence>
        {enhancedPrompt ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <AceternityGlowCard>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-zinc-100">Enhanced Prompt</h2>
                <button
                  type="button"
                  onClick={onCopy}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm text-zinc-300"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100">
                {enhancedPrompt}
              </pre>
            </AceternityGlowCard>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
