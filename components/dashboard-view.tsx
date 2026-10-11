"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { KpiTile } from "@/components/kpi-tiles";
import { TrendChart, type SeriesConfig } from "@/components/trend-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { buildSeries, RANGE_OPTIONS, rangeStart, type RangeKey } from "@/lib/chart-data";
import { computeKpi } from "@/lib/kpi";
import { FOOL_FIELDS, PARAM_COLORS, PARAM_DASH, PARAM_LABELS, QUEEN_FIELDS, type ParamKey } from "@/lib/params";
import type { FoolEntry, QueenEntry } from "@/lib/types";
import { useRealtimeTable } from "@/lib/use-realtime";

function seriesFor(keys: readonly ParamKey[], suffix?: Partial<Record<ParamKey, string>>): SeriesConfig[] {
  return keys.map((key) => ({
    key,
    label: PARAM_LABELS[key] + (suffix?.[key] ?? ""),
    color: PARAM_COLORS[key],
    dash: PARAM_DASH[key],
  }));
}

export function DashboardView({
  initialQueen,
  initialFool,
  today,
}: {
  initialQueen: QueenEntry[];
  initialFool: FoolEntry[];
  today: string;
}) {
  const [range, setRange] = useState<RangeKey>("30");
  const [queen] = useRealtimeTable<QueenEntry>("queen_entries", initialQueen);
  const [fool] = useRealtimeTable<FoolEntry>("fool_entries", initialFool);

  const kpis = useMemo(
    () => ({
      emotionality: computeKpi(queen, "emotionality", today),
      fool_is_reason: computeKpi(queen, "fool_is_reason", today),
      joe_annoyance: computeKpi(fool, "joe_annoyance", today),
      topic_variety: computeKpi(fool, "topic_variety", today),
      need_for_rest: computeKpi(fool, "need_for_rest", today),
    }),
    [queen, fool, today],
  );

  const { queenData, foolData, combinedData } = useMemo(() => {
    const earliest = [...queen, ...fool].reduce<string | null>(
      (min, r) => (min === null || r.entry_date < min ? r.entry_date : min),
      null,
    );
    const from = rangeStart(range, today, earliest);
    const queenData = buildSeries(queen, QUEEN_FIELDS, from, today);
    const foolData = buildSeries(fool, FOOL_FIELDS, from, today);
    const combinedData = queenData.map((point, i) => ({
      date: point.date,
      emotionality: point.emotionality,
      joe_annoyance: foolData[i].joe_annoyance,
    }));
    return { queenData, foolData, combinedData };
  }, [queen, fool, range, today]);

  if (queen.length === 0 && fool.length === 0) {
    return (
      <Card className="mx-auto max-w-xl text-center" data-testid="empty-state">
        <CardHeader>
          <div className="text-4xl" aria-hidden>
            👑🃏
          </div>
          <CardTitle className="text-xl">Noch keine Einträge</CardTitle>
          <CardDescription>
            Sobald Queen oder Hofnarr die ersten Werte erfassen, erscheinen hier Kennzahlen und Verläufe.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/queen">👑 Erfassung Queen</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/hofnarr">🃏 Erfassung Hofnarr</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <section aria-labelledby="kpi-queen" className="grid gap-2">
        <h2 id="kpi-queen" className="text-sm font-semibold">
          👑 Queen
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUEEN_FIELDS.map((p) => (
            <KpiTile key={p} param={p} kpi={kpis[p]} />
          ))}
        </div>
      </section>
      <section aria-labelledby="kpi-fool" className="grid gap-2">
        <h2 id="kpi-fool" className="text-sm font-semibold">
          🃏 Hofnarr
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FOOL_FIELDS.map((p) => (
            <KpiTile key={p} param={p} kpi={kpis[p]} />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Verlauf</h2>
        <ToggleGroup
          type="single"
          value={range}
          onValueChange={(v) => v && setRange(v as RangeKey)}
          aria-label="Zeitraum"
        >
          {RANGE_OPTIONS.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value}>
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendChart title="👑 Queen" data={queenData} series={seriesFor(QUEEN_FIELDS)} />
        <TrendChart title="🃏 Hofnarr" data={foolData} series={seriesFor(FOOL_FIELDS)} />
      </div>
      <TrendChart
        title="Emotionalität (Queen) vs. Joe-Genervtheit (Hofnarr)"
        data={combinedData}
        series={seriesFor(["emotionality", "joe_annoyance"], {
          emotionality: " (Queen)",
          joe_annoyance: " (Hofnarr)",
        })}
      />
    </div>
  );
}
