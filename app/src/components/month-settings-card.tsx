"use client";

import { RotateCcw, Wallet } from "lucide-react";
import { MesProducao } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EditableNumber } from "@/components/ui/editable-number";
import { Button } from "@/components/ui/button";
import { roundExcel } from "@/lib/calculations";

export function MonthSettingsCard({
  mes,
  onPatchMes,
  onRestore,
}: {
  mes: MesProducao;
  onPatchMes: (patch: Partial<Pick<MesProducao, "salario" | "quinzena1" | "quinzena2" | "valorExtraFixo">>) => void;
  onRestore: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5" /> Configurações do mês
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onRestore} title="Restaurar valores originais da planilha">
          <RotateCcw className="h-3.5 w-3.5" /> Restaurar
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Field label="Salário do mês">
          <EditableNumber
            value={mes.salario}
            prefix="R$ "
            onCommit={(v) => {
              if (mes.era === 2) {
                const q1 = roundExcel(v / 2, 2);
                onPatchMes({ salario: v, quinzena1: q1, quinzena2: roundExcel(v - q1, 2) });
              } else {
                onPatchMes({ salario: v });
              }
            }}
          />
        </Field>

        <Field label={mes.era === 2 ? "1ª quinzena (auto)" : "1ª quinzena"}>
          {mes.era === 2 ? (
            <span className="px-2 py-1 text-sm text-ink-faint">R$ {mes.quinzena1.toFixed(2)}</span>
          ) : (
            <EditableNumber value={mes.quinzena1} prefix="R$ " onCommit={(v) => onPatchMes({ quinzena1: v })} />
          )}
        </Field>

        <Field label={mes.era === 2 ? "2ª quinzena (auto)" : "2ª quinzena"}>
          {mes.era === 2 ? (
            <span className="px-2 py-1 text-sm text-ink-faint">R$ {mes.quinzena2.toFixed(2)}</span>
          ) : (
            <EditableNumber value={mes.quinzena2} prefix="R$ " onCommit={(v) => onPatchMes({ quinzena2: v })} />
          )}
        </Field>

        {mes.era === 1 && (
          <Field label="Valor fixo do extra">
            <EditableNumber
              value={mes.valorExtraFixo ?? 0}
              prefix="R$ "
              onCommit={(v) => onPatchMes({ valorExtraFixo: v })}
            />
          </Field>
        )}

        <p className="col-span-2 text-[11px] text-ink-faint">
          {mes.era === 2
            ? "Neste mês, o valor do extra é lançado dia a dia direto na tabela — igual na planilha original."
            : "Neste mês, o valor do extra é fixo: marque 'Sim' no dia e o valor acima é somado automaticamente."}
        </p>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-base-border bg-base-elevated p-3">
      <p className="text-[10px] uppercase tracking-wide text-ink-faint">{label}</p>
      <div className="mt-1 font-mono">{children}</div>
    </div>
  );
}
