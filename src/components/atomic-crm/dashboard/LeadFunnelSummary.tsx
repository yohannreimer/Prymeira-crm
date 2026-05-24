import { useGetList, useTranslate } from "ra-core";
import { useMemo } from "react";

import { Card } from "@/components/ui/card";

import type { Lead } from "../types";
import { summarizeLeads } from "./commercialDashboardUtils";
import { useDashboardScope } from "./useDashboardScope";

const PAGE_SIZE = 1000;

export const LeadFunnelSummary = () => {
  const translate = useTranslate();
  const scope = useDashboardScope();
  const { data: leads, isPending } = useGetList<Lead>(
    "leads",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      sort: { field: "updated_at", order: "DESC" },
      filter: { ...scope.salesFilter, ...scope.periodFilter },
    },
    { enabled: !scope.isPending },
  );

  const summary = useMemo(() => summarizeLeads(leads ?? []), [leads]);

  if (scope.isPending || isPending) return null;

  const metrics = [
    {
      label: translate("crm.dashboard.leads.open"),
      value: summary.open,
    },
    {
      label: translate("crm.dashboard.leads.hot"),
      value: summary.hot,
    },
    {
      label: translate("crm.dashboard.leads.missing_next_action"),
      value: summary.missingNextAction,
    },
    {
      label: translate("crm.dashboard.leads.conversion_rate"),
      value: `${summary.conversionRate}%`,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
        {translate("crm.dashboard.leads.title")}
      </p>
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="min-w-0">
              <div className="text-xs text-muted-foreground">
                {metric.label}
              </div>
              <div className="truncate text-lg font-semibold">
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
