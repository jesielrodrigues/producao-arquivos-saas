# Produtiva — Controle de Produção (SaaS)

Transformação completa da planilha **"CONTROLE DE PRODUÇÃO"**
em um produto de software: mesma lógica, mesmas fórmulas, mesmos dados — em uma
experiência de dashboard moderna, dark mode, inspirada em produtos como Notion,
Linear e Stripe Dashboard.

## ✏️ Agora dá para editar — igual preencher a planilha

Todo campo é clicável e editável diretamente na tela:

- **Arquivos feitos**, **desconto** e **observações** de cada dia → clique no valor, digite e aperte Enter (ou clique fora).
- **Serviço extra**, **trabalhou?** e **viajou?** → botões "Sim/Não" que alternam com um clique.
- **Salário do mês**, **quinzenas** e **valor fixo do extra** → editáveis no card "Configurações do mês" de cada mês, na "Situação do mês" do Dashboard, e direto na coluna "Salário base" da tabela do Resumo Anual (a 1ª/2ª quinzena fica travada em meses que calculam automaticamente, igual na planilha original).
- **Mês ativo** → escolha qual mês aparece como "atual" no Dashboard: use o seletor no topo da Visão geral, clique na estrela ⭐ de qualquer mês (no Dashboard, na Sidebar ou na lista "Controle mensal"), ou navegue até o mês desejado.
- **Nome do perfil** (canto inferior da sidebar) → clique para renomear.
- Todos os totais (ganho do dia, líquido, blocos de quinzena, resumo anual) **recalculam sozinhos** assim que você edita qualquer campo — porque continuam sendo fórmulas de verdade, não números fixos.
- Um indicador "Salvando... / Salvo" aparece sempre que algo é gravado.
- Botão **"Restaurar"** em cada mês e **"Restaurar dados originais"** na lista de meses e no Resumo Anual, para voltar aos valores originais da planilha a qualquer momento.

### Onde os dados ficam salvos

As edições são gravadas em `data/producao.json`, um arquivo criado automaticamente
na primeira vez que você abre o sistema (a partir dos dados originais em
`src/lib/data.ts`, que nunca é alterado). Esse arquivo guarda os lançamentos de
cada mês **e também** as preferências do app (mês ativo, nome do perfil) — é
o "banco de dados" local do sistema. Feche o servidor, abra de novo, e tudo
continua exatamente como você deixou.

Se quiser começar do zero, é só apagar o arquivo `data/producao.json` (ou usar o
botão "Restaurar dados originais" dentro do app) e ele é recriado automaticamente.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · componentes no
padrão shadcn/ui (escritos localmente) · Recharts · Lucide Icons · API Routes do
Next.js como backend (leem/gravam o arquivo `data/producao.json`).

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000

## Onde a "inteligência" da planilha está

Nada foi convertido em número fixo. Toda fórmula da planilha foi remapeada para
uma função TypeScript equivalente:

| Planilha (Excel)                                             | Código (`src/lib/calculations.ts`)                     |
|----------------------------------------------------------------|---------------------------------------------------------|
| `F = SE(E="Sim"; $C$5; 0)` (Mai–Jul) / valor lançado (Ago–Dez)  | `valorExtraDoDia()`                                      |
| `G = ARRED(quinzena/dias_úteis; 2) + F`                        | `ganhoDoDia()`                                           |
| `L = G - K`                                                     | `ganhoLiquidoDoDia()`                                    |
| Blocos "1ª quinzena" / "2ª quinzena" / "Total do mês"           | `calcularResumoMes()` → `BlocoQuinzena`                  |
| Texto "SITUAÇÃO DO MÊS: ..."                                    | `calcularResumoMes().situacaoTexto`                      |
| Aba "📊 Resumo Anual" (referências entre abas)                  | `calcularResumoAnual()`                                  |

Os **insumos brutos** originais (salário do mês, valor de cada quinzena, arquivos
feitos por dia, se houve serviço extra, se trabalhou, se viajou, descontos e
observações) ficam em `src/lib/data.ts`, extraídos célula a célula do arquivo
original — inclusive a particularidade dos 3 primeiros dias de maio, que na
planilha usam a taxa do salário mensal cheio (`/24`) em vez da quinzena, por
serem uma sobra do ciclo de abril. Essa regra foi preservada (`taxaRef:
"mensal"`).

Todos os valores foram conferidos programaticamente célula a célula contra o
arquivo `.xlsx` original antes da migração — 0 divergências.

## Estrutura

```
data/
  producao.json               → "banco de dados" local (criado automaticamente)
src/
  app/
    api/
      data/route.ts            → GET: retorna todos os meses
      dias/route.ts             → PATCH: edita um lançamento diário
      mes/route.ts               → PATCH: edita config do mês · POST: restaura o mês
      reset/route.ts             → POST: restaura todos os meses
    page.tsx                    → Dashboard (Visão geral)
    meses/page.tsx               → Grade com os 8 meses
    meses/[slug]/page.tsx         → Detalhe do mês (server) → delega ao client abaixo
    resumo-anual/page.tsx         → Equivalente à aba "📊 Resumo Anual"
  components/
    ui/                           → primitives (Card, Badge, Input, Button,
                                     EditableNumber, EditableText, ToggleSimNao)
    mes-detalhe-client.tsx        → dono do estado do mês + chamadas de API
    month-settings-card.tsx       → edição de salário/quinzenas/extra fixo
    daily-ledger-table.tsx        → tabela 100% editável, com busca/filtro/ordenação
    sidebar.tsx, topbar.tsx, kpi-card.tsx, monthly-chart.tsx,
    active-days-calendar.tsx, annual-summary-table.tsx, reset-all-button.tsx
  lib/
    data.ts                      → planilha original (nunca é alterada)
    store.ts                     → leitura/gravação do arquivo data/producao.json
    calculations.ts               → toda a lógica/fórmulas
    format.ts, utils.ts
```

## Próximos módulos sugeridos (arquitetura já preparada para isso)

- Autenticação multiusuário (cada colaborador com seu próprio controle).
- Trocar o arquivo JSON por um banco de verdade (Postgres/SQLite via Prisma) —
  a camada `store.ts` já isola essa lógica, então a troca é só ali dentro.
- Exportação para Excel/PDF a partir dos mesmos dados.
- Adicionar novos meses/anos além dos 8 já existentes.

