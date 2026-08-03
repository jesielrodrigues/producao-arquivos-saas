"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarRange, BarChart3, Star, Sparkles } from "lucide-react";
import { MESES } from "@/lib/data";
import { cn } from "@/lib/utils";
import { EditableText } from "@/components/ui/editable-text";

const nav = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/meses", label: "Controle mensal", icon: CalendarRange },
  { href: "/resumo-anual", label: "Resumo anual", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [perfilNome, setPerfilNome] = useState("Jesiel & Toniati");
  const [mesAtivoSlug, setMesAtivoSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((cfg) => {
        setPerfilNome(cfg.perfilNome);
        setMesAtivoSlug(cfg.mesAtivoSlug);
      })
      .catch(() => {});
  }, [pathname]);

  async function salvarPerfilNome(nome: string | null) {
    if (!nome) return;
    setPerfilNome(nome);
    await fetch("/api/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ perfilNome: nome }),
    });
  }

  async function marcarComoAtivo(slug: string) {
    setMesAtivoSlug(slug);
    await fetch("/api/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mesAtivoSlug: slug }),
    });
    router.refresh();
  }

  const iniciais = perfilNome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 shrink-0 flex-col border-r border-base-border bg-base-surface/60 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-base">
          <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-display text-sm font-semibold leading-none text-ink">Produtiva</p>
          <p className="mt-1 text-[11px] leading-none text-ink-faint">controle de produção</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-ink-muted hover:bg-white/5 hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 px-3">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          Meses 2026
        </p>
        <div className="flex flex-col gap-0.5">
          {MESES.map((mes) => {
            const href = `/meses/${mes.slug}`;
            const active = pathname === href;
            const ativo = mesAtivoSlug === mes.slug;
            return (
              <div
                key={mes.slug}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-1.5 text-[13px] transition",
                  active ? "bg-white/5 text-ink" : "text-ink-faint hover:bg-white/5 hover:text-ink-muted"
                )}
              >
                <Link href={href} className="flex-1 truncate">
                  {mes.nome}
                </Link>
                <button
                  onClick={() => marcarComoAtivo(mes.slug)}
                  title="Marcar como mês atual"
                  className="rounded p-0.5 opacity-0 transition group-hover:opacity-100"
                  style={ativo ? { opacity: 1 } : undefined}
                >
                  <Star className={cn("h-3 w-3", ativo ? "fill-accent text-accent" : "text-ink-faint")} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-base-border p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-soft text-xs font-semibold text-indigo">
          {iniciais || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <EditableText value={perfilNome} onCommit={salvarPerfilNome} className="!text-xs !font-medium !text-ink" />
          <p className="px-2 text-[11px] text-ink-faint">Ano de referência 2026</p>
        </div>
      </div>
    </aside>
  );
}
