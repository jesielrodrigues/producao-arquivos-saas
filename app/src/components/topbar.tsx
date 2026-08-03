import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden w-64 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input placeholder="Buscar lançamento..." className="pl-9" />
        </div>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-base-border bg-base-elevated text-ink-muted hover:text-ink">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>
      </div>
    </header>
  );
}
