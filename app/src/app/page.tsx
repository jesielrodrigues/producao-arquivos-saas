import { readStore } from "@/lib/store";
import { DashboardClient } from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { meses, mesAtivoSlug } = readStore();
  return <DashboardClient initialMeses={meses} initialMesAtivoSlug={mesAtivoSlug} />;
}
