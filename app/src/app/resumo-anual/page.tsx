import { readStore } from "@/lib/store";
import { ResumoAnualClient } from "@/components/resumo-anual-client";

export const dynamic = "force-dynamic";

export default function ResumoAnualPage() {
  const { meses } = readStore();
  return <ResumoAnualClient initialMeses={meses} />;
}
