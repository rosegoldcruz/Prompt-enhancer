"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ShimmerButtonProps = {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
};

export function MagicShimmerButton({
  className,
  children,
  disabled,
  type = "button",
  onClick
}: ShimmerButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={cn(
        "group relative min-h-12 w-full overflow-hidden rounded-xl border border-gold/40 bg-zinc-900 px-4 py-3 text-sm font-semibold text-gold transition disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative">{children}</span>
    </motion.button>
  );
}
