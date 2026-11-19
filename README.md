<h1 align="center">📈 Produtiva — Controle de Produção (SaaS)</h1>

<p align="center">
  A planilha <b>"Controle de Produção 2026"</b> transformada em um produto web:<br>
  mesmas fórmulas, mesmos dados, em um dashboard moderno com dark mode.
</p>

<p align="center">
  <a href="https://producao-arquivos.up.railway.app/"><img src="https://img.shields.io/badge/🚀_Ver_aplicação_online-C6F135?style=for-the-badge&labelColor=111827&color=C6F135&logoColor=black" alt="Ver aplicação online"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Recharts-2-22B5BF" alt="Recharts">
  <img src="https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway&logoColor=white" alt="Railway">
</p>

<p align="center">
    <img src="assets/telainicial.png" alt="Visão geral do dashboard Produtiva" width="100%">
  </a>
</p>

---

## 🎯 Sobre o projeto

Aplicação web para **controle pessoal de produção e gestão de arquivos**. Ela nasceu de uma planilha de Excel e mantém toda a lógica original: nada virou número fixo, cada fórmula foi reescrita como uma função TypeScript. Tudo recalcula sozinho assim que você edita qualquer campo.

A interface é inspirada em produtos como Notion, Linear e Stripe Dashboard.

## ✨ Funcionalidades

- 📊 **Visão geral:** KPIs do ano (arquivos feitos, total líquido, extras, dias viajados), gráfico de salário base vs. líquido por mês, calendário de dias ativos e situação do mês.
- 🗓️ **Controle mensal:** um card por mês (maio a dezembro de 2026), com status, arquivos, extras e total líquido.
- 📝 **Detalhe do mês:** tabela diária 100% editável, com busca, filtro e ordenação, além do card de configurações do mês.
- 📑 **Resumo anual:** equivalente à aba "Resumo Anual" da planilha, com evolução mensal e tabela consolidada.
- ✏️ **Edição como na planilha:** clique no valor, digite e aperte Enter. Os campos Sim/Não alternam com um clique.
- ⭐ **Mês ativo:** escolha qual mês aparece como "atual" no dashboard.
- 💾 **Salvamento automático:** com indicador "Salvando… / Salvo".
- ♻️ **Restaurar:** volte aos dados originais da planilha, por mês ou de tudo de uma vez.
- 🔒 **Proteção por senha** (opcional): autenticação básica configurada por variáveis de ambiente.

## 🖼️ Telas

<table>
  <tr>
    <td width="50%"><b>Controle mensal</b><br><img src="assets/meses.png" alt="Controle mensal"></td>
    <td width="50%"><b>Resumo anual</b><br><img src="assets/resumo-anual.png" alt="Resumo anual"></td>
  </tr>
</table>

## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| [Next.js 14](https://nextjs.org/) (App Router) | Framework e API Routes (backend) |
| [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Interface e tipagem |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização |
| Componentes no padrão [shadcn/ui](https://ui.shadcn.com/) | Escritos localmente em `components/ui` |
| [Recharts](https://recharts.org/) | Gráficos |
| [Lucide](https://lucide.dev/) | Ícones |

## 🚀 Como executar localmente

O projeto fica dentro da pasta `app/`.

```bash
git clone https://github.com/jesielrodrigues/producao-arquivos-saas.git
cd producao-arquivos-saas/app
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Para gerar a versão de produção:

```bash
npm run build
npm start
```

### 🔐 Variáveis de ambiente (opcional)

Para proteger o acesso com usuário e senha, defina:

| Variável | Descrição |
|---|---|
| `APP_USER` | Usuário de acesso |
| `APP_PASS` | Senha de acesso |

Se **não** forem definidas, o site fica aberto. Localmente, você pode criar um arquivo `app/.env.local` (ele já está no `.gitignore`):

```bash
APP_USER=seu_usuario
APP_PASS=sua_senha_forte
```

> ⚠️ Nunca coloque usuário e senha no README nem no código. Configure-os apenas nas variáveis de ambiente do ambiente de deploy (por exemplo, na aba *Variables* do Railway).

## 💾 Onde os dados ficam salvos

As edições são gravadas em `data/producao.json`, criado automaticamente na primeira execução a partir dos dados originais em `src/lib/data.ts` (que nunca é alterado). O arquivo guarda os lançamentos de cada mês e também as preferências do app (mês ativo e nome do perfil).

Para recomeçar do zero, apague esse arquivo ou use o botão **"Restaurar dados originais"** dentro do app.

> 💡 Em plataformas com disco efêmero (como o Railway sem volume), o arquivo pode ser perdido a cada novo deploy. Para persistir os dados, configure um *volume* apontando para a pasta `data/`.

## 🧮 Onde está a "inteligência" da planilha

Toda fórmula da planilha foi remapeada para uma função em `src/lib/calculations.ts`:

| Planilha (Excel) | Código |
|---|---|
| `F = SE(E="Sim"; $C$5; 0)` (mai–jul) / valor lançado (ago–dez) | `valorExtraDoDia()` |
| `G = ARRED(quinzena / dias_úteis; 2) + F` | `ganhoDoDia()` |
| `L = G - K` | `ganhoLiquidoDoDia()` |
| Blocos "1ª quinzena" / "2ª quinzena" / "Total do mês" | `calcularResumoMes()` |
| Texto "SITUAÇÃO DO MÊS: ..." | `calcularResumoMes().situacaoTexto` |
| Aba "Resumo Anual" | `calcularResumoAnual()` |

Os dados brutos (salário, quinzenas, arquivos por dia, extras, descontos e observações) ficam em `src/lib/data.ts`, extraídos célula a célula da planilha original e conferidos programaticamente, sem divergências.

## 📁 Estrutura do repositório

```
producao-arquivos-saas/
├── README.md
├── assets/                        # Prints usados neste README
└── app/
    ├── package.json
    ├── tailwind.config.ts
    └── src/
        ├── middleware.ts          # Autenticação básica (APP_USER / APP_PASS)
        ├── app/
        │   ├── page.tsx           # Visão geral
        │   ├── meses/             # Lista de meses e detalhe [slug]
        │   ├── resumo-anual/      # Resumo anual
        │   └── api/               # data · dias · mes · config · reset
        ├── components/            # Sidebar, KPIs, gráficos, tabelas editáveis
        │   └── ui/                # Card, Badge, Button, Input, campos editáveis
        └── lib/
            ├── data.ts            # Dados originais da planilha
            ├── store.ts           # Leitura/gravação de data/producao.json
            ├── calculations.ts    # Fórmulas
            └── format.ts, utils.ts
```

## 🗺️ Próximos passos

- Autenticação multiusuário (cada colaborador com o seu controle).
- Trocar o arquivo JSON por um banco de verdade (Postgres ou SQLite via Prisma). A camada `store.ts` já isola essa lógica.
- Exportação para Excel e PDF.
- Suporte a novos meses e anos.

---

<p align="center">Feito com 💚 por <a href="https://github.com/jesielrodrigues">Jesiel Rodrigues</a></p>
