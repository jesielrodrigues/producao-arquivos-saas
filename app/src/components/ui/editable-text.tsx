"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function EditableText({
  value,
  onCommit,
  placeholder = "Adicionar observação...",
  className,
}: {
  value: string | null;
  onCommit: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    const next = trimmed.length ? trimmed : null;
    if (next !== value) onCommit(next);
  }

  if (editing) {
    return (
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value ?? "");
            setEditing(false);
          }
        }}
        placeholder={placeholder}
        className={cn(
          "h-8 w-full min-w-[180px] rounded-lg border border-accent/40 bg-base-elevated px-2 text-sm text-ink outline-none ring-2 ring-accent/20",
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
        "block w-full truncate rounded-lg px-2 py-1 text-left text-sm transition hover:bg-white/5 hover:ring-1 hover:ring-white/10",
        value ? "text-ink-muted" : "text-ink-faint italic",
        className
      )}
      title={value ?? placeholder}
    >
      {value || placeholder}
    </button>
  );
}
