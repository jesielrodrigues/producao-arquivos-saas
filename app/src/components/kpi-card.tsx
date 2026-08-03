import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  accent = "accent",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  trend?: { value: string; positive: boolean };
  accent?: "accent" | "indigo" | "amber";
}) {
  const accentClasses = {
    accent: "bg-accent-soft text-accent",
    indigo: "bg-indigo-soft text-indigo",
    amber: "bg-amber-soft text-amber",
  }[accent];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", accentClasses)}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-ink">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              trend.positive ? "text-accent" : "text-rose"
            )}
          >
            {trend.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend.value}
          </span>
        )}
        {hint && <span className="text-xs text-ink-faint">{hint}</span>}
      </div>
    </Card>
  );
}
