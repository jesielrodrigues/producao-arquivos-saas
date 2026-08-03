"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Files, Wallet, TrendingUp, Plane, ArrowRight, Star, ChevronDown } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MonthlyChart } from "@/components/monthly-chart";
import { ActiveDaysCalendar } from "@/components/active-days-calendar";
import { EditableNumber } from "@/components/ui/editable-number";
import { SaveIndicator } from "@/components/save-indicator";
import { Badge } from "@/components/ui/badge";
import { MesProducao } from "@/lib/data";
import { calcularResumoAnual, calcularResumoMes, roundExcel } from "@/lib/calculations";
import { formatBRL, formatNumber } from "@/lib/format";

export function DashboardClient({
  initialMeses,
  initialMesAtivoSlug,
}: {
  initialMeses: MesProducao[];
  initialMesAtivoSlug: string;
}) {
  const [meses, setMeses] = useState(initialMeses);
  const [mesAtivoSlug, setMesAtivoSlugState] = useState(initialMesAtivoSlug);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const savedTimeout = useRef<ReturnType<typeof setTimeout>>();

  function flashSaved() {
    setStatus("saved");
    if (savedTimeout.current) clearTimeout(savedTimeout.current);
    savedTimeout.current = setTimeout(() => setStatus("idle"), 1500);
  }

  const { linhas, totalAnual } = useMemo(() => calcularResumoAnual(meses), [meses]);
  const mesAtual = meses.find((m) => m.slug === mesAtivoSlug) ?? meses[meses.length - 1];
  const resumoAtual = useMemo(() => calcularResumoMes(mesAtual), [mesAtual]);
  const mesesCompletos = linhas.filter((l) => l.situacao === "Completo").length;

  async function selecionarMesAtivo(slug: string) {
    setMesAtivoSlugState(slug);
    setStatus("saving");
    await fetch("/api/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mesAtivoSlug: slug }),
    });
    flashSaved();
  }

  async function editarSalarioMesAtual(novoSalario: number) {
    const patch =
      mesAtual.era === 2
        ? (() => {
            const q1 = roundExcel(novoSalario / 2, 2);
            return { salario: novoSalario, quinzena1: q1, quinzena2: roundExcel(novoSalario - q1, 2) };
          })()
        : { salario: novoSalario };

    setMeses((prev) => prev.map((m) => (m.slug === mesAtual.slug ? { ...m, ...patch } : m)));
    setStatus("saving");
    await fetch("/api/mes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: mesAtual.slug, patch }),
    });
    flashSaved();
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Visão geral</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Calculado automaticamente a partir do controle de produção de cada mês
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SaveIndicator status={status} />
          <MesAtivoSelect meses={meses} value={mesAtivoSlug} onChange={selecionarMesAtivo} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Arquivos feitos (ano)"
          value={formatNumber(totalAnual.arquivosFeitos)}
          icon={Files}
          hint="soma de todas as abas mensais"
        />
        <KpiCard
          label="Total líquido recebido"
          value={formatBRL(totalAnual.totalLiquido)}
          icon={Wallet}
          accent="indigo"
          trend={{ value: `${mesesCompletos}/${linhas.length} meses completos`, positive: true }}
        />
        <KpiCard
          label="Total em serviços extra"
          value={formatBRL(totalAnual.totalExtra)}
          icon={TrendingUp}
          accent="amber"
          hint={`${totalAnual.diasComExtra} dias com extra`}
        />
        <KpiCard
          label="Dias viajados"
          value={formatNumber(totalAnual.diasViajados)}
          icon={Plane}
          accent="indigo"
          hint="ao longo do ano"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Salário base vs. total líquido, por mês</CardTitle>
            <Badge variant="neutral">2026</Badge>
          </CardHeader>
          <CardContent>
            <MonthlyChart linhas={linhas} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dias ativos — {mesAtual.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <ActiveDaysCalendar mes={mesAtual} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Situação do mês — {mesAtual.nome}</CardTitle>
            <Link href={`/meses/${mesAtual.slug}`} className="text-xs text-ink-faint hover:text-accent">
              Ver lançamentos →
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-muted">{resumoAtual.situacaoTexto}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-base-elevated p-3">
                <p className="text-[11px] uppercase tracking-wide text-ink-faint">Salário do mês</p>
                <div className="mt-1">
                  <EditableNumber value={mesAtual.salario} prefix="R$ " onCommit={editarSalarioMesAtual} />
                </div>
              </div>
              <Metric label="1ª quinzena" value={formatBRL(resumoAtual.q1.totalRecebido)} />
              <Metric label="Arquivos feitos" value={formatNumber(resumoAtual.total.arquivos)} />
              <Metric label="Ganho líquido" value={formatBRL(resumoAtual.total.liquido)} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Meses do ano</CardTitle>
            <span className="text-xs text-ink-faint">
              <Star className="mr-1 inline h-3 w-3 fill-accent text-accent" /> marque o mês atual
            </span>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {meses.map((mes) => {
              const r = calcularResumoMes(mes);
              const isAtivo = mes.slug === mesAtivoSlug;
              return (
                <div
                  key={mes.slug}
                  className="group relative flex flex-col rounded-xl border border-base-border bg-base-elevated p-3.5 transition hover:border-accent/30"
                >
                  <button
                    onClick={() => selecionarMesAtivo(mes.slug)}
                    title="Marcar como mês atual"
                    className="absolute right-2 top-2 rounded-md p-1 text-ink-faint transition hover:bg-white/10 hover:text-accent"
                  >
                    <Star className={`h-3.5 w-3.5 ${isAtivo ? "fill-accent text-accent" : ""}`} />
                  </button>
                  <Link href={`/meses/${mes.slug}`} className="flex flex-col">
                    <span className="pr-5 text-sm font-medium text-ink">{mes.nome}</span>
                    <span className="mt-2 font-mono text-sm text-ink-muted">{formatBRL(r.total.liquido)}</span>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Badge variant={r.situacao === "Completo" ? "accent" : "amber"}>{r.situacao}</Badge>
                      {isAtivo && <Badge variant="indigo">Atual</Badge>}
                    </div>
                    <ArrowRight className="mt-2 h-3.5 w-3.5 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-accent" />
                  </Link>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-base-elevated p-3">
      <p className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 font-mono text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function MesAtivoSelect({
  meses,
  value,
  onChange,
}: {
  meses: MesProducao[];
  value: string;
  onChange: (slug: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 appearance-none rounded-xl border border-base-border bg-base-elevated pl-3.5 pr-9 text-sm text-ink outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
      >
        {meses.map((m) => (
          <option key={m.slug} value={m.slug}>
            Mês atual: {m.nome}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
    </div>
  );
}
