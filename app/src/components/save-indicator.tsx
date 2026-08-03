"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SaveIndicator({ status }: { status: "idle" | "saving" | "saved" }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs transition-opacity",
        status === "idle" ? "opacity-0" : "opacity-100"
      )}
    >
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-ink-faint" />
          <span className="text-ink-faint">Salvando...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-accent" />
          <span className="text-accent">Salvo</span>
        </>
      )}
    </div>
  );
}
