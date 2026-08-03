"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Wallet, CalendarDays, Sparkles, PiggyBank } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/kpi-card";
import { DailyLedgerTable } from "@/components/daily-ledger-table";
import { ActiveDaysCalendar } from "@/components/active-days-calendar";
import { MonthSettingsCard } from "@/components/month-settings-card";
import { SaveIndicator } from "@/components/save-indicator";
import { MesProducao, DiaProducao } from "@/lib/data";
import { calcularResumoMes, BlocoQuinzena } from "@/lib/calculations";
import { formatBRL, formatNumber } from "@/lib/format";

export function MesDetalheClient({
  initialMes,
  mesAnteriorSlug,
  mesAnteriorNome,
  mesProximoSlug,
  mesProximoNome,
}: {
  initialMes: MesProducao;
  mesAnteriorSlug?: string;
  mesAnteriorNome?: string;
  mesProximoSlug?: string;
  mesProximoNome?: string;
}) {
  const [mes, setMes] = useState(initialMes);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const savedTimeout = useRef<ReturnType<typeof setTimeout>>();

  function flashSaved() {
    setStatus("saved");
    if (savedTimeout.current) clearTimeout(savedTimeout.current);
    savedTimeout.current = setTimeout(() => setStatus("idle"), 1500);
  }

  async function patchDia(num: number, patch: Partial<DiaProducao>) {
    setMes((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.num === num ? { ...d, ...patch } : d)),
    }));
    setStatus("saving");
    try {
      await fetch("/api/dias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: mes.slug, num, patch }),
      });
      flashSaved();
    } catch {
      setStatus("idle");
    }
  }

  async function patchMesConfig(
    patch: Partial<Pick<MesProducao, "salario" | "quinzena1" | "quinzena2" | "valorExtraFixo">>
  ) {
    setMes((prev) => ({ ...prev, ...patch }));
    setStatus("saving");
    try {
      await fetch("/api/mes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: mes.slug, patch }),
      });
      flashSaved();
    } catch {
      setStatus("idle");
    }
  }

  async function restaurarMes() {
    if (!confirm(`Restaurar ${mes.nome} para os valores originais da planilha? Isso apaga suas edições neste mês.`)) {
      return;
    }
    setStatus("saving");
    const res = await fetch("/api/mes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: mes.slug }),
    });
    const json = await res.json();
    if (json.mes) setMes(json.mes);
    flashSaved();
  }

  const r = useMemo(() => calcularResumoMes(mes), [mes]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Link href="/meses" className="text-xs text-ink-faint hover:text-ink-muted">
          ← Controle mensal
        </Link>
        <div className="flex items-center gap-3">
          <SaveIndicator status={status} />
          <div className="flex gap-2">
            <NavButton slug={mesAnteriorSlug} nome={mesAnteriorNome} direction="prev" />
            <NavButton slug={mesProximoSlug} nome={mesProximoNome} direction="next" />
          </div>
        </div>
      </div>

      <Topbar
        title={`${mes.nome} 2026`}
        subtitle={`Modelo de remuneração: ${mes.era === 1 ? "valor fixo por serviço extra" : "valor de extra lançado dia a dia"}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Salário do mês" value={formatBRL(mes.salario)} icon={Wallet} />
        <KpiCard
          label="1ª quinzena"
          value={formatBRL(mes.quinzena1)}
          icon={PiggyBank}
          accent="indigo"
          hint="paga até dia 15"
        />
        <KpiCard
          label="2ª quinzena"
          value={formatBRL(mes.quinzena2)}
          icon={PiggyBank}
          accent="indigo"
          hint="paga no fim do mês"
        />
        <KpiCard
          label="Arquivos feitos"
          value={formatNumber(r.total.arquivos)}
          icon={CalendarDays}
          accent="amber"
          hint={`${mes.days.length} dias lançados`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Situação do mês</CardTitle>
            <Badge variant={r.situacao === "Completo" ? "accent" : "amber"}>{r.situacao}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-muted">{r.situacaoTexto}</p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <QuinzenaBlock titulo="1ª quinzena — paga até dia 15" bloco={r.q1} />
              <QuinzenaBlock titulo="2ª quinzena — paga no fim do mês" bloco={r.q2} />
            </div>

            <div className="mt-4 rounded-xl border border-accent/20 bg-accent-soft p-4">
              <p className="text-[11px] uppercase tracking-wide text-accent/80">Total do mês</p>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat label="Recebido" value={formatBRL(r.total.totalRecebido)} />
                <MiniStat label="Descontos" value={formatBRL(r.total.desconto)} />
                <MiniStat label="Líquido" value={formatBRL(r.total.liquido)} highlight />
                <MiniStat label="Extras" value={formatBRL(r.total.totalExtra)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <MonthSettingsCard mes={mes} onPatchMes={patchMesConfig} onRestore={restaurarMes} />
          <Card>
            <CardHeader>
              <CardTitle>Dias ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <ActiveDaysCalendar mes={mes} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Lançamentos diários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DailyLedgerTable mes={mes} onPatchDia={patchDia} />
        </CardContent>
      </Card>
    </div>
  );
}

function QuinzenaBlock({ titulo, bloco }: { titulo: string; bloco: BlocoQuinzena }) {
  return (
    <div className="rounded-xl border border-base-border bg-base-elevated p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{titulo}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <MiniStat label="Arquivos" value={formatNumber(bloco.arquivos)} />
        <MiniStat label="Dias c/ extra" value={String(bloco.diasExtra)} />
        <MiniStat label="Recebido" value={formatBRL(bloco.totalRecebido)} />
        <MiniStat label="Líquido" value={formatBRL(bloco.liquido)} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-ink-faint">{label}</p>
      <p className={`font-mono text-sm font-medium ${highlight ? "text-accent" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function NavButton({ slug, nome, direction }: { slug?: string; nome?: string; direction: "prev" | "next" }) {
  if (!slug) return <span className="h-8 w-8" />;
  return (
    <Link
      href={`/meses/${slug}`}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-border text-ink-muted hover:text-ink"
      title={nome}
    >
      {direction === "prev" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </Link>
  );
}
