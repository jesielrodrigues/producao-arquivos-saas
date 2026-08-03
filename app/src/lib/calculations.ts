import { MesProducao, DiaProducao, MESES } from "./data";

/**
 * Este módulo replica, célula por célula, a lógica original da planilha
 * "CONTROLE DE PRODUÇÃO — JESIEL E TONIATI 2026".
 *
 * Nenhum total é armazenado como número fixo: tudo é recalculado a partir
 * dos insumos brutos (data.ts), exatamente como as fórmulas do Excel faziam:
 *
 *   F = SE(SERVIÇO EXTRA = "Sim", $C$5, 0)              [era 1 · Mai-Jul]
 *   F = valor lançado manualmente na coluna F            [era 2 · Ago-Dez]
 *   G = ARRED(quinzena_de_referência / dias_úteis, 2) + F
 *   L = G - K (desconto)
 *   Bloco de quinzena = SOMA/CONT.SE das linhas do período
 *   Resumo anual = referência direta às células de total de cada aba mensal
 */

// Arredondamento "half up", igual ao ARRED()/ROUND() do Excel
// (evita o half-to-even do JS/Python em .5 exatos)
export function roundExcel(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function valorExtraDoDia(mes: MesProducao, dia: DiaProducao): number {
  if (mes.era === 1) {
    return dia.extraFlag ? mes.valorExtraFixo ?? 0 : 0;
  }
  return dia.valorExtraRaw ?? 0;
}

export function extraSimNao(mes: MesProducao, dia: DiaProducao): "Sim" | "Não" {
  return valorExtraDoDia(mes, dia) > 0 ? "Sim" : "Não";
}

/** G: GANHO DO DIA (R$) */
export function ganhoDoDia(mes: MesProducao, dia: DiaProducao): number {
  let base: number;
  let divisor: number;
  if (dia.taxaRef === "mensal") {
    base = mes.salario;
    divisor = 24;
  } else if (dia.taxaRef === "q1") {
    base = mes.quinzena1;
    divisor = mes.q1Divisor;
  } else {
    base = mes.quinzena2;
    divisor = mes.q2Divisor;
  }
  return roundExcel(base / divisor, 2) + valorExtraDoDia(mes, dia);
}

/** L: GANHO LÍQUIDO (R$) */
export function ganhoLiquidoDoDia(mes: MesProducao, dia: DiaProducao): number {
  return ganhoDoDia(mes, dia) - dia.desconto;
}

export interface BlocoQuinzena {
  arquivos: number;
  diasExtra: number;
  totalExtra: number;
  totalRecebido: number;
  diasTrabalhados: number;
  diasViajados: number;
  desconto: number;
  liquido: number;
}

function calcularBloco(mes: MesProducao, dias: DiaProducao[], valorBase: number): BlocoQuinzena {
  const totalExtra = dias.reduce((acc, d) => acc + valorExtraDoDia(mes, d), 0);
  return {
    arquivos: dias.reduce((acc, d) => acc + d.arquivos, 0),
    diasExtra: dias.filter((d) => valorExtraDoDia(mes, d) > 0).length,
    totalExtra,
    totalRecebido: valorBase + totalExtra,
    diasTrabalhados: dias.filter((d) => d.trabalhou).length,
    diasViajados: dias.filter((d) => d.viajou).length,
    desconto: dias.reduce((acc, d) => acc + d.desconto, 0),
    liquido: valorBase + totalExtra - dias.reduce((acc, d) => acc + d.desconto, 0),
  };
}

export interface ResumoMes {
  mes: MesProducao;
  q1: BlocoQuinzena;
  q2: BlocoQuinzena;
  total: BlocoQuinzena;
  situacao: "Completo" | "Descontado";
  situacaoTexto: string;
}

export function calcularResumoMes(mes: MesProducao): ResumoMes {
  const diasQ1 = mes.days.filter((d) => d.quinzenaGroup === "q1");
  const diasQ2 = mes.days.filter((d) => d.quinzenaGroup === "q2");
  const q1 = calcularBloco(mes, diasQ1, mes.quinzena1);
  const q2 = calcularBloco(mes, diasQ2, mes.quinzena2);
  const total = calcularBloco(mes, mes.days, mes.salario);

  const situacao: "Completo" | "Descontado" = total.desconto === 0 ? "Completo" : "Descontado";
  const pct = mes.salario > 0 ? (total.desconto / mes.salario) * 100 : 0;
  const situacaoTexto =
    total.desconto === 0
      ? "Salário recebido integralmente, sem descontos."
      : `Salário recebido com desconto de R$ ${total.desconto.toFixed(2)} (${pct.toFixed(1)}% do salário do mês)`;

  return { mes, q1, q2, total, situacao, situacaoTexto };
}

export interface LinhaResumoAnual {
  mesNome: string;
  slug: string;
  arquivosFeitos: number;
  diasComExtra: number;
  totalExtra: number;
  salarioBase: number;
  primeiraQuinzenaPaga: number;
  totalRecebido: number;
  descontos: number;
  totalLiquido: number;
  diasViajados: number;
  situacao: "Completo" | "Descontado";
}

/** Aba "📊 Resumo Anual" — cada linha referencia a aba mensal correspondente.
 *  Recebe a lista de meses atual (pode vir do arquivo de dados salvo em disco,
 *  já com as edições do usuário) — se nada for passado, usa a planilha original. */
export function calcularResumoAnual(meses: MesProducao[] = MESES): {
  linhas: LinhaResumoAnual[];
  totalAnual: Omit<LinhaResumoAnual, "mesNome" | "slug" | "situacao">;
} {
  const linhas: LinhaResumoAnual[] = meses.map((mes) => {
    const r = calcularResumoMes(mes);
    return {
      mesNome: mes.nome,
      slug: mes.slug,
      arquivosFeitos: r.total.arquivos,
      diasComExtra: r.total.diasExtra,
      totalExtra: r.total.totalExtra,
      salarioBase: mes.salario,
      primeiraQuinzenaPaga: mes.quinzena1,
      totalRecebido: r.total.totalRecebido,
      descontos: r.total.desconto,
      totalLiquido: r.total.liquido,
      diasViajados: r.total.diasViajados,
      situacao: r.situacao,
    };
  });

  const totalAnual = linhas.reduce(
    (acc, l) => ({
      arquivosFeitos: acc.arquivosFeitos + l.arquivosFeitos,
      diasComExtra: acc.diasComExtra + l.diasComExtra,
      totalExtra: acc.totalExtra + l.totalExtra,
      salarioBase: acc.salarioBase + l.salarioBase,
      primeiraQuinzenaPaga: acc.primeiraQuinzenaPaga + l.primeiraQuinzenaPaga,
      totalRecebido: acc.totalRecebido + l.totalRecebido,
      descontos: acc.descontos + l.descontos,
      totalLiquido: acc.totalLiquido + l.totalLiquido,
      diasViajados: acc.diasViajados + l.diasViajados,
    }),
    {
      arquivosFeitos: 0,
      diasComExtra: 0,
      totalExtra: 0,
      salarioBase: 0,
      primeiraQuinzenaPaga: 0,
      totalRecebido: 0,
      descontos: 0,
      totalLiquido: 0,
      diasViajados: 0,
    }
  );

  return { linhas, totalAnual };
}

export function getMesBySlug(slug: string): MesProducao | undefined {
  return MESES.find((m) => m.slug === slug);
}

export function mesAnterior(slug: string): MesProducao | undefined {
  const idx = MESES.findIndex((m) => m.slug === slug);
  return idx > 0 ? MESES[idx - 1] : undefined;
}

export function mesProximo(slug: string): MesProducao | undefined {
  const idx = MESES.findIndex((m) => m.slug === slug);
  return idx >= 0 && idx < MESES.length - 1 ? MESES[idx + 1] : undefined;
}
