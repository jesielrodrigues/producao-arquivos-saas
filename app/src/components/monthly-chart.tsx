"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { LinhaResumoAnual } from "@/lib/calculations";
import { formatBRL } from "@/lib/format";

export function MonthlyChart({ linhas }: { linhas: LinhaResumoAnual[] }) {
  const data = linhas.map((l) => ({
    mes: l.mesNome.slice(0, 3),
    liquido: l.totalLiquido,
    base: l.salarioBase,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorLiquido" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8FF4D" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#C8FF4D" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6E8BFF" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#6E8BFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#232838" vertical={false} />
        <XAxis
          dataKey="mes"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9AA1B2", fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9AA1B2", fontSize: 11 }}
          tickFormatter={(v) => `R$${v}`}
          width={64}
        />
        <Tooltip
          contentStyle={{
            background: "#171B26",
            border: "1px solid #232838",
            borderRadius: 12,
            fontSize: 13,
          }}
          labelStyle={{ color: "#EDEFF4" }}
          formatter={(value: number, name: string) => [
            formatBRL(value),
            name === "liquido" ? "Total líquido" : "Salário base",
          ]}
        />
        <Area type="monotone" dataKey="base" stroke="#6E8BFF" fill="url(#colorBase)" strokeWidth={2} />
        <Area type="monotone" dataKey="liquido" stroke="#C8FF4D" fill="url(#colorLiquido)" strokeWidth={2.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
