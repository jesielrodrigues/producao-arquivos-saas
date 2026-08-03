import { NextResponse } from "next/server";
import { restaurarTudo } from "@/lib/store";

export async function POST() {
  const data = restaurarTudo();
  return NextResponse.json({ ok: true, data });
}
