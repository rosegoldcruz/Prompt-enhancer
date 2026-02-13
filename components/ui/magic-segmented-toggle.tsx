"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Option<T extends string> = {
  label: string;
  value: T;
};

type SegmentedToggleProps<T extends string> = {
  label: string;
  value: T;
  onChange: (next: T) => void;
  options: Array<Option<T>>;
};

export function MagicSegmentedToggle<T extends string>({
  label,
  value,
  onChange,
  options
}: SegmentedToggleProps<T>) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-300">{label}</p>
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface p-1">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "relative min-h-11 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "text-zinc-100" : "text-zinc-400"
              )}
            >
              {active && (
                <motion.span
                  layoutId={`${label}-indicator`}
                  className="absolute inset-0 rounded-lg border border-gold/30 bg-gold/10"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
