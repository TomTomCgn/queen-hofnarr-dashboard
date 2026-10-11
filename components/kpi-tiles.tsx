import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";
import type { Kpi } from "@/lib/kpi";
import { PARAM_COLORS, PARAM_LABELS, type ParamKey } from "@/lib/params";

function formatNumber(value: number): string {
  return value.toLocaleString("de-DE", { maximumFractionDigits: 1 });
}

function Change({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">kein Vorwert</span>;
  if (value === 0)
    return (
      <span className="text-muted-foreground inline-flex items-center gap-0.5">
        <MinusIcon className="size-3.5" aria-hidden /> unverändert
      </span>
    );
  const Icon = value > 0 ? ArrowUpIcon : ArrowDownIcon;
  return (
    <span className="inline-flex items-center gap-0.5 font-medium">
      <Icon className="size-3.5" aria-hidden />
      <span>
        {value > 0 ? "+" : "−"}
        {Math.abs(value)}
      </span>
      <span className="sr-only">{value > 0 ? "gestiegen" : "gesunken"}</span>
    </span>
  );
}

export function KpiTile({ param, kpi }: { param: ParamKey; kpi: Kpi }) {
  return (
    <Card className="gap-1 px-4 py-3" data-testid={`kpi-${param}`}>
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <span className="inline-block size-2 rounded-full" style={{ background: PARAM_COLORS[param] }} aria-hidden />
        {PARAM_LABELS[param]}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums" data-testid={`kpi-${param}-latest`}>
          {kpi.latest ?? "–"}
        </span>
        <span className="text-xs">
          <Change value={kpi.change} />
        </span>
      </div>
      <div className="text-muted-foreground flex flex-col text-xs sm:flex-row sm:justify-between sm:gap-x-2">
        <span>Ø 7 Tage: {kpi.avg7 === null ? "–" : formatNumber(kpi.avg7)}</span>
        {kpi.latestDate && <span>{formatDate(kpi.latestDate)}</span>}
      </div>
    </Card>
  );
}
