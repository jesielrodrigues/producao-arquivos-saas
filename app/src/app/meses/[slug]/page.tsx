import { notFound } from "next/navigation";
import { readStore } from "@/lib/store";
import { MesDetalheClient } from "@/components/mes-detalhe-client";

// dados podem mudar a qualquer momento (edições do usuário), então nunca
// cacheia estaticamente esta rota
export const dynamic = "force-dynamic";

export default function MesDetalhePage({ params }: { params: { slug: string } }) {
  const { meses } = readStore();
  const mes = meses.find((m) => m.slug === params.slug);
  if (!mes) notFound();

  const idx = meses.findIndex((m) => m.slug === params.slug);
  const anterior = idx > 0 ? meses[idx - 1] : undefined;
  const proximo = idx >= 0 && idx < meses.length - 1 ? meses[idx + 1] : undefined;

  return (
    <MesDetalheClient
      initialMes={mes}
      mesAnteriorSlug={anterior?.slug}
      mesAnteriorNome={anterior?.nome}
      mesProximoSlug={proximo?.slug}
      mesProximoNome={proximo?.nome}
    />
  );
}
