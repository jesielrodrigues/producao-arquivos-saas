import { NextResponse } from "next/server";
import { updateMesConfig, restaurarMesOriginal } from "@/lib/store";

// PATCH { slug: string, patch: Partial<Pick<MesProducao,'salario'|'quinzena1'|'quinzena2'|'valorExtraFixo'>> }
export async function PATCH(req: Request) {
  const body = await req.json();
  const { slug, patch } = body ?? {};

  if (!slug || !patch) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  const mes = updateMesConfig(slug, patch);
  if (!mes) {
    return NextResponse.json({ error: "mês não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, mes });
}

// POST { slug: string } → restaura o mês para os valores originais da planilha
export async function POST(req: Request) {
  const body = await req.json();
  const { slug } = body ?? {};
  if (!slug) return NextResponse.json({ error: "payload inválido" }, { status: 400 });

  const mes = restaurarMesOriginal(slug);
  if (!mes) return NextResponse.json({ error: "mês não encontrado" }, { status: 404 });

  return NextResponse.json({ ok: true, mes });
}
