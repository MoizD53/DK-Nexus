import { ReactNode } from "react";

type BadgeVariant = "green" | "amber" | "red" | "stone";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  red: "bg-red-500/15 text-red-400 border-red-500/20",
  stone: "bg-stone-800 text-stone-400 border-stone-700",
};

export function Badge({ children, variant = "stone" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
