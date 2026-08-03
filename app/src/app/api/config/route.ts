import { NextResponse } from "next/server";
import { readStore, setMesAtivo, setPerfilNome } from "@/lib/store";

export async function GET() {
  const { perfilNome, mesAtivoSlug } = readStore();
  return NextResponse.json({ perfilNome, mesAtivoSlug });
}

// PATCH { mesAtivoSlug?: string, perfilNome?: string }
export async function PATCH(req: Request) {
  const body = await req.json();
  let data = readStore();

  if (typeof body?.mesAtivoSlug === "string") {
    data = setMesAtivo(body.mesAtivoSlug);
  }
  if (typeof body?.perfilNome === "string") {
    data = setPerfilNome(body.perfilNome);
  }

  return NextResponse.json({ perfilNome: data.perfilNome, mesAtivoSlug: data.mesAtivoSlug });
}
