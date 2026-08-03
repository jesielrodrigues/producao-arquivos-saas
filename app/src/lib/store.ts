import fs from "fs";
import path from "path";
import { MESES, MesProducao } from "./data";

// Banco de dados local em arquivo (data/producao.json na raiz do projeto).
// Isso permite EDITAR os lançamentos (como preencher a planilha) e as
// alterações ficam salvas em disco, sobrevivendo a reinícios do servidor.
//
// A "planilha original" (src/lib/data.ts) nunca é alterada — ela serve como
// semente inicial e como fonte para o botão "Restaurar dados originais".

export interface StoreShape {
  perfilNome: string;
  mesAtivoSlug: string;
  meses: MesProducao[];
}

const STORE_PATH = path.join(process.cwd(), "data", "producao.json");

function defaultStore(): StoreShape {
  return {
    perfilNome: "Jesiel & Toniati",
    mesAtivoSlug: MESES[MESES.length - 1].slug,
    meses: JSON.parse(JSON.stringify(MESES)),
  };
}

function normalize(raw: unknown): StoreShape {
  // compatibilidade com o formato antigo (array puro de meses)
  if (Array.isArray(raw)) {
    return { ...defaultStore(), meses: raw as MesProducao[] };
  }
  const obj = raw as Partial<StoreShape>;
  return {
    perfilNome: obj.perfilNome ?? "Jesiel & Toniati",
    mesAtivoSlug: obj.mesAtivoSlug ?? MESES[MESES.length - 1].slug,
    meses: obj.meses ?? JSON.parse(JSON.stringify(MESES)),
  };
}

function ensureStore(): StoreShape {
  if (!fs.existsSync(STORE_PATH)) {
    const fresh = defaultStore();
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(fresh, null, 2), "utf-8");
    return fresh;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    return normalize(JSON.parse(raw));
  } catch {
    const fresh = defaultStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(fresh, null, 2), "utf-8");
    return fresh;
  }
}

export function readStore(): StoreShape {
  return ensureStore();
}

export function writeStore(data: StoreShape): void {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function getMes(slug: string): MesProducao | undefined {
  return readStore().meses.find((m) => m.slug === slug);
}

export function updateDia(
  slug: string,
  num: number,
  patch: Record<string, unknown>
): MesProducao | undefined {
  const data = readStore();
  const mes = data.meses.find((m) => m.slug === slug);
  if (!mes) return undefined;
  const dia = mes.days.find((d) => d.num === num);
  if (!dia) return undefined;
  Object.assign(dia, patch);
  writeStore(data);
  return mes;
}

export function updateMesConfig(
  slug: string,
  patch: Record<string, unknown>
): MesProducao | undefined {
  const data = readStore();
  const mes = data.meses.find((m) => m.slug === slug);
  if (!mes) return undefined;
  Object.assign(mes, patch);
  writeStore(data);
  return mes;
}

export function restaurarMesOriginal(slug: string): MesProducao | undefined {
  const data = readStore();
  const original = MESES.find((m) => m.slug === slug);
  if (!original) return undefined;
  const idx = data.meses.findIndex((m) => m.slug === slug);
  if (idx === -1) return undefined;
  data.meses[idx] = JSON.parse(JSON.stringify(original));
  writeStore(data);
  return data.meses[idx];
}

export function restaurarTudo(): StoreShape {
  const data = readStore();
  data.meses = JSON.parse(JSON.stringify(MESES));
  writeStore(data);
  return data;
}

export function setMesAtivo(slug: string): StoreShape {
  const data = readStore();
  if (data.meses.some((m) => m.slug === slug)) {
    data.mesAtivoSlug = slug;
    writeStore(data);
  }
  return data;
}

export function setPerfilNome(nome: string): StoreShape {
  const data = readStore();
  data.perfilNome = nome.trim() || data.perfilNome;
  writeStore(data);
  return data;
}
