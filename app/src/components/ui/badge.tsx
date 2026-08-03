import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "accent" | "indigo" | "amber" | "rose" | "neutral";

const variants: Record<Variant, string> = {
  accent: "bg-accent-soft text-accent border-accent/20",
  indigo: "bg-indigo-soft text-indigo border-indigo/20",
  amber: "bg-amber-soft text-amber border-amber/20",
  rose: "bg-rose-soft text-rose border-rose/20",
  neutral: "bg-white/5 text-ink-muted border-white/10",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
