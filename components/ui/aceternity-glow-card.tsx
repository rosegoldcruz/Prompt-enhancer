import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GlowCardProps = {
  className?: string;
  children: React.ReactNode;
};

export function AceternityGlowCard({ className, children }: GlowCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-card/90 p-4 shadow-luxury backdrop-blur-xl sm:p-6",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,162,55,0.18),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(192,132,151,0.12),transparent_45%)]" />
      <div className="relative">{children}</div>
    </motion.section>
  );
}
