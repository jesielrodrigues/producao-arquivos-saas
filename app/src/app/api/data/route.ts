import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export async function GET() {
  return NextResponse.json(readStore());
}
