"use client";

import { cn } from "@/lib/utils";

export function ToggleSimNao({
  value,
  onToggle,
  labelSim = "Sim",
  labelNao = "Não",
  colorSim = "accent",
}: {
  value: boolean;
  onToggle: (value: boolean) => void;
  labelSim?: string;
  labelNao?: string;
  colorSim?: "accent" | "indigo";
}) {
  const activeClasses =
    colorSim === "accent"
      ? "border-accent/40 bg-accent-soft text-accent"
      : "border-indigo/40 bg-indigo-soft text-indigo";

  return (
    <button
      type="button"
      onClick={() => onToggle(!value)}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition",
        value ? activeClasses : "border-base-border bg-transparent text-ink-faint hover:bg-white/5"
      )}
      title="Clique para alternar"
    >
      {value ? labelSim : labelNao}
    </button>
  );
}
