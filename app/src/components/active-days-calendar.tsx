import { MesProducao } from "@/lib/data";
import { cn } from "@/lib/utils";

const WEEKDAY_ORDER = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function ActiveDaysCalendar({ mes }: { mes: MesProducao }) {
  // agrupa por semana, na ordem em que os dias aparecem na planilha
  const weeks: (typeof mes.days)[] = [];
  let current: typeof mes.days = [];
  let lastIdx = -1;

  for (const d of mes.days) {
    const idx = WEEKDAY_ORDER.indexOf(d.dia);
    if (idx <= lastIdx && current.length) {
      weeks.push(current);
      current = [];
    }
    current.push(d);
    lastIdx = idx;
  }
  if (current.length) weeks.push(current);

  return (
    <div>
      <div className="mb-3 grid grid-cols-7 gap-2 text-center text-[11px] font-medium text-ink-faint">
        {WEEKDAY_ORDER.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-2">
            {WEEKDAY_ORDER.map((wd) => {
              const day = week.find((d) => d.dia === wd);
              if (!day) return <div key={wd} className="aspect-square" />;
              const hasExtra = day.extraFlag || (day.valorExtraRaw ?? 0) > 0;
              return (
                <div
                  key={wd}
                  title={`${day.data} · ${day.arquivos} arquivos${hasExtra ? " · extra" : ""}`}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-lg border text-xs font-medium transition",
                    day.viajou
                      ? "border-indigo/30 bg-indigo-soft text-indigo"
                      : hasExtra
                      ? "border-accent/30 bg-accent-soft text-accent"
                      : day.trabalhou
                      ? "border-base-border bg-base-elevated text-ink-muted"
                      : "border-base-border/50 bg-transparent text-ink-faint"
                  )}
                >
                  {day.data.split("/")[0]}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-ink-faint">
        <LegendDot className="bg-accent" label="Serviço extra" />
        <LegendDot className="bg-indigo" label="Dia de viagem" />
        <LegendDot className="bg-base-elevated border border-base-border" label="Trabalhado" />
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      {label}
    </span>
  );
}
