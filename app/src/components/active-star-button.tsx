"use client";

import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActiveStarButton({ slug, ativo, className }: { slug: string; ativo: boolean; className?: string }) {
  const router = useRouter();

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await fetch("/api/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mesAtivoSlug: slug }),
    });
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      title={ativo ? "Este é o mês atual" : "Marcar como mês atual"}
      className={cn(
        "rounded-md p-1 text-ink-faint transition hover:bg-white/10 hover:text-accent",
        className
      )}
    >
      <Star className={cn("h-3.5 w-3.5", ativo && "fill-accent text-accent")} />
    </button>
  );
}
