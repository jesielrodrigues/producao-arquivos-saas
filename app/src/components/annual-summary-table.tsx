"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MesProducao } from "@/lib/data";
import { calcularResumoAnual, roundExcel } from "@/lib/calculations";
import { formatBRL, formatNumber } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { EditableNumber } from "@/components/ui/editable-number";

export function AnnualSummaryTable({
  meses,
  onPatchMes,
}: {
  meses: MesProducao[];
  onPatchMes: (
    slug: string,
    patch: Partial<Pick<MesProducao, "salario" | "quinzena1" | "quinzena2" | "valorExtraFixo">>
  ) => void;
}) {
  const { linhas, totalAnual } = useMemo(() => calcularResumoAnual(meses), [meses]);

  function editarSalario(mes: MesProducao, novoSalario: number) {
    if (mes.era === 2) {
      const q1 = roundExcel(novoSalario / 2, 2);
      onPatchMes(mes.slug, { salario: novoSalario, quinzena1: q1, quinzena2: roundExcel(novoSalario - q1, 2) });
    } else {
      onPatchMes(mes.slug, { salario: novoSalario });
    }
  }

  return (
    <div>
      <p className="mb-3 text-xs text-ink-faint">
        A coluna <span className="text-ink-muted">Salário base</span> é editável — clique no valor para ajustar o
        mês direto por aqui.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-base-border">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-base-border bg-base-elevated/60 text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Mês</th>
              <th className="px-4 py-3 font-medium">Arquivos</th>
              <th className="px-4 py-3 font-medium">Dias c/ extra</th>
              <th className="px-4 py-3 font-medium">Total extra</th>
              <th className="px-4 py-3 font-medium">Salário base</th>
              <th className="px-4 py-3 font-medium">1ª quinzena</th>
              <th className="px-4 py-3 font-medium">Total recebido</th>
              <th className="px-4 py-3 font-medium">Descontos</th>
              <th className="px-4 py-3 font-medium">Total líquido</th>
              <th className="px-4 py-3 font-medium">Dias viajados</th>
              <th className="px-4 py-3 font-medium">Situação</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const mes = meses.find((m) => m.slug === l.slug)!;
              return (
                <tr key={l.slug} className="border-b border-base-border/60 hover:bg-white/[0.02]">
                  <td className="px-4 py-2">
                    <Link href={`/meses/${l.slug}`} className="font-medium text-ink hover:text-accent">
                      {l.mesNome}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-ink-muted">{formatNumber(l.arquivosFeitos)}</td>
                  <td className="px-4 py-2 text-ink-muted">{l.diasComExtra}</td>
                  <td className="px-4 py-2 font-mono text-[13px] text-ink">{formatBRL(l.totalExtra)}</td>
                  <td className="px-4 py-2">
                    <EditableNumber
                      value={l.salarioBase}
                      prefix="R$ "
                      onCommit={(v) => editarSalario(mes, v)}
                    />
                  </td>
                  <td className="px-4 py-2 font-mono text-[13px] text-ink-muted">
                    {formatBRL(l.primeiraQuinzenaPaga)}
                  </td>
                  <td className="px-4 py-2 font-mono text-[13px] text-ink">{formatBRL(l.totalRecebido)}</td>
                  <td className="px-4 py-2 font-mono text-[13px] text-rose">
                    {l.descontos > 0 ? formatBRL(l.descontos) : "—"}
                  </td>
                  <td className="px-4 py-2 font-mono text-[13px] font-semibold text-ink">
                    {formatBRL(l.totalLiquido)}
                  </td>
                  <td className="px-4 py-2 text-ink-muted">{l.diasViajados}</td>
                  <td className="px-4 py-2">
                    <Badge variant={l.situacao === "Completo" ? "accent" : "amber"}>{l.situacao}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-base-border bg-base-elevated/40 font-medium text-ink">
              <td className="px-4 py-3">TOTAL ANUAL</td>
              <td className="px-4 py-3">{formatNumber(totalAnual.arquivosFeitos)}</td>
              <td className="px-4 py-3">{totalAnual.diasComExtra}</td>
              <td className="px-4 py-3 font-mono text-[13px]">{formatBRL(totalAnual.totalExtra)}</td>
              <td className="px-4 py-3 font-mono text-[13px]">{formatBRL(totalAnual.salarioBase)}</td>
              <td className="px-4 py-3 font-mono text-[13px]">{formatBRL(totalAnual.primeiraQuinzenaPaga)}</td>
              <td className="px-4 py-3 font-mono text-[13px]">{formatBRL(totalAnual.totalRecebido)}</td>
              <td className="px-4 py-3 font-mono text-[13px] text-rose">{formatBRL(totalAnual.descontos)}</td>
              <td className="px-4 py-3 font-mono text-[13px] text-accent">{formatBRL(totalAnual.totalLiquido)}</td>
              <td className="px-4 py-3">{totalAnual.diasViajados}</td>
              <td className="px-4 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
