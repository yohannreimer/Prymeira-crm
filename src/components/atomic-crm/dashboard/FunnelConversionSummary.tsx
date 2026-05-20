import { GitFork } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { useMemo } from "react";

import { Card } from "@/components/ui/card";

import type { Deal, Lead, Proposal } from "../types";
import { calculateFunnelConversion } from "./advancedCommercialDashboardUtils";
import { useDashboardScope } from "./useDashboardScope";

const PAGE_SIZE = 500;

export const FunnelConversionSummary = () => {
  const translate = useTranslate();
  const scope = useDashboardScope();
  const { data: leads, isPending: isPendingLeads } = useGetList<Lead>(
    "leads",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      sort: { field: "updated_at", order: "DESC" },
      filter: scope.salesFilter,
    },
    { enabled: !scope.isPending },
  );
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
    () => calculateFunnelConversion(leads ?? [], deals ?? [], proposals ?? []),
    [deals, leads, proposals],
  );

  if (scope.isPending || isPendingLeads || isPendingDeals || isPendingProposals)
    return null;

  const metrics = [
    {
      label: translate("crm.dashboard.advanced.funnel_conversion.leads", {
        _: "Leads",
      }),
      value: summary.leads,
    },
    {
      label: translate(
        "crm.dashboard.advanced.funnel_conversion.converted_leads",
        {
          _: "Leads convertidos",
        },
      ),
      value: `${summary.convertedLeads} · ${summary.leadToDealRate}%`,
    },
    {
      label: translate(
        "crm.dashboard.advanced.funnel_conversion.deals_with_proposal",
        { _: "Negócios com proposta" },
      ),
      value: `${summary.dealsWithProposal} · ${summary.dealToProposalRate}%`,
    },
    {
      label: translate(
        "crm.dashboard.advanced.funnel_conversion.accepted_proposals",
        { _: "Propostas aceitas" },
      ),
      value: `${summary.proposalsAccepted} · ${summary.proposalAcceptanceRate}%`,
    },
    {
      label: translate("crm.dashboard.advanced.funnel_conversion.won_deals", {
        _: "Negócios ganhos",
      }),
      value: `${summary.wonDeals} · ${summary.dealWinRate}%`,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">

        {translate("crm.dashboard.advanced.funnel_conversion.title", {
            _: "Conversão do funil",
          })}

      </p>
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
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
