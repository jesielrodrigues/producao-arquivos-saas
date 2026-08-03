"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResetAllButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (
      !confirm(
        "Restaurar TODOS os meses para os valores originais da planilha? Isso apaga todas as edições feitas no sistema."
      )
    ) {
      return;
    }
    setLoading(true);
    await fetch("/api/reset", { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleReset} disabled={loading}>
      <RotateCcw className="h-3.5 w-3.5" />
      {loading ? "Restaurando..." : "Restaurar dados originais"}
    </Button>
  );
}
