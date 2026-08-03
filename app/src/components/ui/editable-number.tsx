"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function EditableNumber({
  value,
  onCommit,
  className,
  prefix,
  step = 1,
  align = "left",
}: {
  value: number;
  onCommit: (value: number) => void;
  className?: string;
  prefix?: string;
  step?: number;
  align?: "left" | "right";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);

  function commit() {
    const parsed = parseFloat(draft.replace(",", "."));
    setEditing(false);
    if (!Number.isNaN(parsed) && parsed !== value) {
      onCommit(parsed);
    } else {
      setDraft(String(value));
    }
  }

  if (editing) {
    return (
      <input
        ref={ref}
        type="number"
        step={step}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(String(value));
            setEditing(false);
          }
        }}
        className={cn(
          "h-8 w-20 rounded-lg border border-accent/40 bg-base-elevated px-2 text-sm text-ink outline-none ring-2 ring-accent/20",
          align === "right" && "text-right",
          className
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(
        "rounded-lg px-2 py-1 text-sm text-ink transition hover:bg-white/5 hover:ring-1 hover:ring-white/10",
        align === "right" ? "text-right" : "text-left",
        className
      )}
      title="Clique para editar"
    >
      {prefix}
      {prefix ? value.toFixed(2) : value}
    </button>
  );
}
