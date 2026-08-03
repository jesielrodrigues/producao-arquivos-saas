"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Sparkles } from "lucide-react";
import { MesProducao, DiaProducao } from "@/lib/data";
import { ganhoDoDia, ganhoLiquidoDoDia, valorExtraDoDia } from "@/lib/calculations";
import { formatBRL } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EditableNumber } from "@/components/ui/editable-number";
import { EditableText } from "@/components/ui/editable-text";
import { ToggleSimNao } from "@/components/ui/toggle-sim-nao";
import { cn } from "@/lib/utils";

type SortKey = "num" | "arquivos" | "ganhoDia" | "ganhoLiquido";
type Filter = "todos" | "extra" | "viagem" | "desconto";

export function DailyLedgerTable({
  mes,
  onPatchDia,
}: {
  mes: MesProducao;
  onPatchDia: (num: number, patch: Partial<DiaProducao>) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [sortKey, setSortKey] = useState<SortKey>("num");
  const [sortAsc, setSortAsc] = useState(true);

  const maxGanho = useMemo(
    () => Math.max(...mes.days.map((d) => ganhoDoDia(mes, d)), 1),
    [mes]
  );

  const rows = useMemo(() => {
    let list = mes.days.map((d) => ({
      d,
      ganho: ganhoDoDia(mes, d),
      liquido: ganhoLiquidoDoDia(mes, d),
      extra: valorExtraDoDia(mes, d),
    }));

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.d.data.toLowerCase().includes(q) ||
          r.d.dia.toLowerCase().includes(q) ||
          (r.d.obs ?? "").toLowerCase().includes(q)
      );
    }

    if (filter === "extra") list = list.filter((r) => r.extra > 0);
    if (filter === "viagem") list = list.filter((r) => r.d.viajou);
    if (filter === "desconto") list = list.filter((r) => r.d.desconto > 0);

    list.sort((a, b) => {
      const av = sortKey === "num" ? a.d.num : sortKey === "arquivos" ? a.d.arquivos : sortKey === "ganhoDia" ? a.ganho : a.liquido;
      const bv = sortKey === "num" ? b.d.num : sortKey === "arquivos" ? b.d.arquivos : sortKey === "ganhoDia" ? b.ganho : b.liquido;
      return sortAsc ? av - bv : bv - av;
    });

    return list;
  }, [mes, query, filter, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <Input placeholder="Buscar por data, dia ou observação..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["todos", "Todos"],
              ["extra", "Com extra"],
              ["viagem", "Viagem"],
              ["desconto", "Com desconto"],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                filter === key
                  ? "border-accent/30 bg-accent-soft text-accent"
                  : "border-base-border text-ink-muted hover:bg-white/5"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-xs text-ink-faint">
        Clique em qualquer valor para editar — igual preencher uma célula na planilha. As colunas{" "}
        <span className="text-ink-muted">Ganho do dia</span> e <span className="text-ink-muted">Líquido</span> são
        calculadas automaticamente.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-base-border">
        <table className="w-full min-w-[1080px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-base-border bg-base-elevated/60 text-left text-xs uppercase tracking-wide text-ink-faint">
              <Th onClick={() => toggleSort("num")} active={sortKey === "num"} asc={sortAsc}>#</Th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Dia</th>
              <Th onClick={() => toggleSort("arquivos")} active={sortKey === "arquivos"} asc={sortAsc}>Arquivos</Th>
              <th className="px-4 py-3 font-medium">Extra</th>
              <Th onClick={() => toggleSort("ganhoDia")} active={sortKey === "ganhoDia"} asc={sortAsc}>Ganho do dia</Th>
              <th className="px-4 py-3 font-medium">Trabalhou?</th>
              <th className="px-4 py-3 font-medium">Viajou?</th>
              <th className="px-4 py-3 font-medium">Desconto</th>
              <Th onClick={() => toggleSort("ganhoLiquido")} active={sortKey === "ganhoLiquido"} asc={sortAsc}>Líquido</Th>
              <th className="px-4 py-3 font-medium">Observações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ d, ganho, liquido, extra }) => {
              const barColor = d.viajou ? "#6E8BFF" : extra > 0 ? "#C8FF4D" : "#5C6377";
              const width = Math.max(6, (ganho / maxGanho) * 100);
              return (
                <tr key={d.num} className="border-b border-base-border/60 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-2 text-ink-faint">{d.num}</td>
                  <td className="px-4 py-2 font-mono text-[13px] text-ink">{d.data}</td>
                  <td className="px-4 py-2 text-ink-muted">{d.dia}</td>
                  <td className="px-4 py-2">
                    <EditableNumber
                      value={d.arquivos}
                      onCommit={(v) => onPatchDia(d.num, { arquivos: Math.max(0, Math.round(v)) })}
                    />
                  </td>
                  <td className="px-4 py-2">
                    {mes.era === 1 ? (
                      <ToggleSimNao
                        value={!!d.extraFlag}
                        onToggle={(v) => onPatchDia(d.num, { extraFlag: v })}
                      />
                    ) : (
                      <EditableNumber
                        value={d.valorExtraRaw ?? 0}
                        prefix="R$ "
                        onCommit={(v) => onPatchDia(d.num, { valorExtraRaw: Math.max(0, v) })}
                      />
                    )}
                    {extra > 0 && (
                      <Badge variant="accent" className="ml-2">
                        <Sparkles className="h-3 w-3" /> {formatBRL(extra)}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="relative h-1.5 w-14 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ width: `${width}%`, background: barColor }}
                        />
                      </div>
                      <span className="font-mono text-[13px] text-ink">{formatBRL(ganho)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <ToggleSimNao value={d.trabalhou} onToggle={(v) => onPatchDia(d.num, { trabalhou: v })} />
                  </td>
                  <td className="px-4 py-2">
                    <ToggleSimNao
                      value={d.viajou}
                      onToggle={(v) => onPatchDia(d.num, { viajou: v })}
                      colorSim="indigo"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <EditableNumber
                      value={d.desconto}
                      prefix="R$ "
                      onCommit={(v) => onPatchDia(d.num, { desconto: Math.max(0, v) })}
                    />
                  </td>
                  <td className="px-4 py-2 font-mono text-[13px] font-medium text-ink">{formatBRL(liquido)}</td>
                  <td className="px-4 py-2">
                    <EditableText value={d.obs} onCommit={(v) => onPatchDia(d.num, { obs: v })} />
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-ink-faint">
                  Nenhum lançamento encontrado para esse filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  asc,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  asc: boolean;
}) {
  return (
    <th className="px-4 py-3 font-medium">
      <button onClick={onClick} className={cn("flex items-center gap-1", active && "text-accent")}>
        {children}
        <ArrowUpDown className={cn("h-3 w-3", active && (asc ? "rotate-0" : "rotate-180"))} />
      </button>
    </th>
  );
}
