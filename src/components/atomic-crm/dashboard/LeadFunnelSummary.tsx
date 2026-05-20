import { UserRoundPlus } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { useMemo } from "react";

import { Card } from "@/components/ui/card";

import type { Lead } from "../types";
import { summarizeLeads } from "./commercialDashboardUtils";

const PAGE_SIZE = 1000;

export const LeadFunnelSummary = () => {
  const translate = useTranslate();
  const { data: leads, isPending } = useGetList<Lead>("leads", {
    pagination: { page: 1, perPage: PAGE_SIZE },
    sort: { field: "updated_at", order: "DESC" },
    filter: {},
  });

  const summary = useMemo(() => summarizeLeads(leads ?? []), [leads]);

  if (isPending) return null;

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
      <div className="flex items-center">
        <div className="mr-3 flex">
          <UserRoundPlus className="text-muted-foreground h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("crm.dashboard.leads.title")}
        </h2>
      </div>
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
