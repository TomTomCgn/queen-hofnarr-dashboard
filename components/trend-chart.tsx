"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartPoint } from "@/lib/chart-data";
import { formatDate, formatDateShort } from "@/lib/dates";

export type SeriesConfig = { key: string; label: string; color: string; dash?: string };

const Y_TICKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function ChartTooltip({ active, payload, label }: TooltipContentProps<number, string>) {
  if (!active || !payload?.length) return null;
  const values = payload.filter((p) => p.value !== null && p.value !== undefined);
  return (
    <div className="bg-popover text-popover-foreground rounded-md border px-3 py-2 text-sm shadow-md">
      <div className="mb-1 font-medium">{formatDate(String(label))}</div>
      {values.length === 0 ? (
        <div className="text-muted-foreground">Kein Eintrag</div>
      ) : (
        <ul className="grid gap-0.5">
          {values.map((p) => (
            <li key={String(p.dataKey)} className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-3 rounded" style={{ background: p.color }} aria-hidden />
              <span className="text-muted-foreground">{p.name}</span>
              <span className="ml-auto pl-3 font-semibold tabular-nums">{p.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TrendChart({
  title,
  description,
  data,
  series,
}: {
  title: string;
  description?: string;
  data: ChartPoint[];
  series: SeriesConfig[];
}) {
  const denseDots = data.length > 45;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-3 px-2 sm:px-5">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 px-3 text-sm sm:px-0" aria-label="Legende">
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <svg width="20" height="8" aria-hidden className="shrink-0">
                <line x1="0" y1="4" x2="20" y2="4" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} />
              </svg>
              {s.label}
            </li>
          ))}
        </ul>
        <div className="h-64 w-full sm:h-72" role="img" aria-label={`Liniendiagramm ${title}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                minTickGap={24}
              />
              <YAxis
                domain={[1, 10]}
                ticks={Y_TICKS}
                allowDecimals={false}
                interval={0}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                content={(props) => <ChartTooltip {...(props as TooltipContentProps<number, string>)} />}
                cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
              />
              {series.map((s) => (
                <Line
                  key={s.key}
                  type="linear"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  strokeDasharray={s.dash}
                  connectNulls={false}
                  dot={{ r: denseDots ? 1.5 : 3, strokeWidth: 0, fill: s.color }}
                  activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
