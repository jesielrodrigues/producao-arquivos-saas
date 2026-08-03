import Link from "next/link";
import { ArrowRight, Files, Sparkles } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { readStore } from "@/lib/store";
import { calcularResumoMes } from "@/lib/calculations";
import { formatBRL, formatNumber } from "@/lib/format";
import { ResetAllButton } from "@/components/reset-all-button";
import { ActiveStarButton } from "@/components/active-star-button";

export const dynamic = "force-dynamic";

export default function MesesPage() {
  const { meses, mesAtivoSlug } = readStore();

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <ResetAllButton />
      </div>
      <Topbar title="Controle mensal" subtitle="Cada card corresponde a uma aba da planilha original — clique para editar os lançamentos" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {meses.map((mes) => {
          const r = calcularResumoMes(mes);
          const ativo = mes.slug === mesAtivoSlug;
          return (
            <Link key={mes.slug} href={`/meses/${mes.slug}`}>
              <Card className="group relative h-full p-5 transition hover:border-accent/30">
                <ActiveStarButton slug={mes.slug} ativo={ativo} className="absolute right-3 top-3" />
                <div className="flex items-start justify-between pr-6">
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">{mes.nome}</p>
                    <p className="text-xs text-ink-faint">{mes.days.length} lançamentos · 2026</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge variant={r.situacao === "Completo" ? "accent" : "amber"}>{r.situacao}</Badge>
                  {ativo && <Badge variant="indigo">Mês atual</Badge>}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-base-elevated p-3">
                    <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-ink-faint">
                      <Files className="h-3 w-3" /> Arquivos
                    </p>
                    <p className="mt-1 font-mono text-sm font-medium text-ink">{formatNumber(r.total.arquivos)}</p>
                  </div>
                  <div className="rounded-xl bg-base-elevated p-3">
                    <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-ink-faint">
                      <Sparkles className="h-3 w-3" /> Extras
                    </p>
                    <p className="mt-1 font-mono text-sm font-medium text-ink">{formatBRL(r.total.totalExtra)}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-base-border pt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-ink-faint">Total líquido</p>
                    <p className="font-mono text-base font-semibold text-ink">{formatBRL(r.total.liquido)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-faint transition group-hover:translate-x-1 group-hover:text-accent" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

