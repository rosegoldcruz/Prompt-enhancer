"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Sparkles } from "lucide-react";
import { AceternityGlowCard } from "@/components/ui/aceternity-glow-card";
import { MagicSegmentedToggle } from "@/components/ui/magic-segmented-toggle";
import { MagicShimmerButton } from "@/components/ui/magic-shimmer-button";

type EnhancementLevel = "quick" | "smart" | "comprehensive";
type ProjectType = "general" | "react" | "nodejs" | "python" | "mobile" | "web" | "ai";
type Framework = "none" | "nextjs" | "vite" | "express" | "django" | "fastapi" | "react-native";

const LEVEL_OPTIONS: Array<{ label: string; value: EnhancementLevel }> = [
  { label: "Quick", value: "quick" },
  { label: "Smart", value: "smart" },
  { label: "Comprehensive", value: "comprehensive" }
];

const PROJECT_OPTIONS: Array<{ label: string; value: ProjectType }> = [
  { label: "General", value: "general" },
  { label: "React", value: "react" },
  { label: "Node", value: "nodejs" },
  { label: "Python", value: "python" },
  { label: "Mobile", value: "mobile" },
  { label: "Web", value: "web" },
  { label: "AI", value: "ai" }
];

const FRAMEWORK_OPTIONS: Array<{ label: string; value: Framework }> = [
  { label: "None", value: "none" },
  { label: "Next.js", value: "nextjs" },
  { label: "Vite", value: "vite" },
  { label: "Express", value: "express" },
  { label: "Django", value: "django" },
  { label: "FastAPI", value: "fastapi" },
  { label: "React Native", value: "react-native" }
];

export function Workspace() {
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("react");
  const [framework, setFramework] = useState<Framework>("nextjs");
  const [enhancementLevel, setEnhancementLevel] = useState<EnhancementLevel>("smart");
  const [teamConventions, setTeamConventions] = useState("");
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
          enhancementLevel,
          context: {
            projectType,
            framework,
            teamConventions
          }
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
          <div className="rounded-lg border border-gold/40 bg-gold/10 p-2 text-gold">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100 sm:text-xl">Aeon Prompt Enhancer</h1>
            <p className="text-sm text-zinc-400">Mobile-first workspace with contextual controls</p>
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
            <p className="text-sm font-medium text-zinc-300">Project Context</p>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {PROJECT_OPTIONS.map((option) => {
                const active = option.value === projectType;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setProjectType(option.value)}
                    className={`min-h-11 whitespace-nowrap rounded-full border px-4 text-sm transition ${
                      active
                        ? "border-gold/60 bg-gold/15 text-zinc-100"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="framework" className="text-sm font-medium text-zinc-300">
              Framework
            </label>
            <select
              id="framework"
              value={framework}
              onChange={(event) => setFramework(event.target.value as Framework)}
              className="min-h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-sm text-zinc-100 outline-none focus:border-gold/60"
            >
              {FRAMEWORK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="teamConventions" className="text-sm font-medium text-zinc-300">
              Team Conventions
            </label>
            <textarea
              id="teamConventions"
              value={teamConventions}
              onChange={(event) => setTeamConventions(event.target.value)}
              placeholder="Naming rules, testing style, architecture constraints"
              className="min-h-24 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-gold/60"
            />
          </div>

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
