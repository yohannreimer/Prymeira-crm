import { useGetList, useTranslate } from "ra-core";
import { useMemo } from "react";

import { Card } from "@/components/ui/card";

import type { Deal, Proposal } from "../types";
import { calculatePipelineAging } from "./advancedCommercialDashboardUtils";
import { useDashboardScope } from "./useDashboardScope";

const PAGE_SIZE = 500;

export const PipelineAgingSummary = () => {
  const translate = useTranslate();
  const scope = useDashboardScope();
  const { data: deals, isPending: isPendingDeals } = useGetList<Deal>(
    "deals",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      sort: { field: "updated_at", order: "DESC" },
      filter: { "archived_at@is": null, ...scope.salesFilter },
    },
    { enabled: !scope.isPending },
  );
  const { data: proposals, isPending: isPendingProposals } =
    useGetList<Proposal>(
      "proposals",
      {
        pagination: { page: 1, perPage: PAGE_SIZE },
        sort: { field: "updated_at", order: "DESC" },
        filter: scope.salesFilter,
      },
      { enabled: !scope.isPending },
    );

  const summary = useMemo(
    () => calculatePipelineAging(deals ?? [], proposals ?? []),
    [deals, proposals],
  );

  if (scope.isPending || isPendingDeals || isPendingProposals) return null;

  const metrics = [
    {
      label: translate("crm.dashboard.advanced.pipeline_aging.open_deal_age", {
        _: "Idade média dos negócios abertos",
      }),
      value: `${summary.averageOpenDealAgeDays}d`,
    },
    {
      label: translate("crm.dashboard.advanced.pipeline_aging.stale_deals", {
        _: "Negócios sem atividade",
      }),
      value: summary.staleDeals,
    },
    {
      label: translate(
        "crm.dashboard.advanced.pipeline_aging.sent_proposal_age",
        {
          _: "Idade média das propostas enviadas",
        },
      ),
      value: `${summary.averageSentProposalAgeDays}d`,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">

        {translate("crm.dashboard.advanced.pipeline_aging.title", {
            _: "Envelhecimento do pipeline",
          })}

      </p>
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
