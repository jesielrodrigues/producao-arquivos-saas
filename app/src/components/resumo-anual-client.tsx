"use client";

import { useMemo, useRef, useState } from "react";
import { Wallet, Files, Sparkles, Percent } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { MonthlyChart } from "@/components/monthly-chart";
import { AnnualSummaryTable } from "@/components/annual-summary-table";
import { SaveIndicator } from "@/components/save-indicator";
import { ResetAllButton } from "@/components/reset-all-button";
import { MesProducao } from "@/lib/data";
import { calcularResumoAnual } from "@/lib/calculations";
import { formatBRL, formatNumber } from "@/lib/format";

export function ResumoAnualClient({ initialMeses }: { initialMeses: MesProducao[] }) {
  const [meses, setMeses] = useState(initialMeses);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const savedTimeout = useRef<ReturnType<typeof setTimeout>>();

  function flashSaved() {
    setStatus("saved");
    if (savedTimeout.current) clearTimeout(savedTimeout.current);
    savedTimeout.current = setTimeout(() => setStatus("idle"), 1500);
  }

  async function patchMes(
    slug: string,
    patch: Partial<Pick<MesProducao, "salario" | "quinzena1" | "quinzena2" | "valorExtraFixo">>
  ) {
    setMeses((prev) => prev.map((m) => (m.slug === slug ? { ...m, ...patch } : m)));
    setStatus("saving");
    await fetch("/api/mes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, patch }),
    });
    flashSaved();
  }

  const { linhas, totalAnual } = useMemo(() => calcularResumoAnual(meses), [meses]);
  const pctDescontado =
    totalAnual.totalRecebido > 0 ? (totalAnual.descontos / totalAnual.totalRecebido) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <SaveIndicator status={status} />
        <ResetAllButton />
      </div>

      <Topbar
        title="Resumo anual"
        subtitle="Equivalente à aba '📊 Resumo Anual' da planilha — edite o salário de qualquer mês direto na tabela"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total líquido no ano" value={formatBRL(totalAnual.totalLiquido)} icon={Wallet} />
        <KpiCard
          label="Arquivos feitos"
          value={formatNumber(totalAnual.arquivosFeitos)}
          icon={Files}
          accent="indigo"
        />
        <KpiCard
          label="Total em extras"
          value={formatBRL(totalAnual.totalExtra)}
          icon={Sparkles}
          accent="amber"
          hint={`${totalAnual.diasComExtra} dias`}
        />
        <KpiCard
          label="Descontos sobre recebido"
          value={`${pctDescontado.toFixed(1)}%`}
          icon={Percent}
          accent="amber"
          hint={formatBRL(totalAnual.descontos)}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Evolução mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyChart linhas={linhas} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tabela consolidada</CardTitle>
        </CardHeader>
        <CardContent>
          <AnnualSummaryTable meses={meses} onPatchMes={patchMes} />
        </CardContent>
      </Card>
    </div>
  );
}
