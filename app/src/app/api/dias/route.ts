import { NextResponse } from "next/server";
import { updateDia } from "@/lib/store";

// PATCH { slug: string, num: number, patch: Partial<DiaProducao> }
export async function PATCH(req: Request) {
  const body = await req.json();
  const { slug, num, patch } = body ?? {};

  if (!slug || typeof num !== "number" || !patch) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  const mes = updateDia(slug, num, patch);
  if (!mes) {
    return NextResponse.json({ error: "mês ou dia não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, mes });
}
