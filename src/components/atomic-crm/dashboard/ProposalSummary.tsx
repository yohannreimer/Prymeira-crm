import { useGetList, useLocaleState, useTranslate } from "ra-core";
import { useMemo } from "react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Proposal } from "../types";
import { summarizeProposals } from "./commercialDashboardUtils";

const PAGE_SIZE = 1000;

export const ProposalSummary = () => {
  const translate = useTranslate();
  const [locale = "pt-BR"] = useLocaleState();
  const { currency } = useConfigurationContext();
  const { data: proposals, isPending } = useGetList<Proposal>("proposals", {
    pagination: { page: 1, perPage: PAGE_SIZE },
    sort: { field: "updated_at", order: "DESC" },
    filter: {},
  });

  const summary = useMemo(
    () => summarizeProposals(proposals ?? []),
    [proposals],
  );

  const formatAmount = (amount: number) =>
    (amount / 100).toLocaleString(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });

  const formatCount = (count: number) => count.toLocaleString(locale);

  const metrics = [
    {
      label: translate("crm.dashboard.proposals.open_count"),
      value: formatCount(summary.openCount),
    },
    {
      label: translate("crm.dashboard.proposals.open_amount"),
      value: formatAmount(summary.openAmount),
    },
    {
      label: translate("crm.dashboard.proposals.accepted_count"),
      value: formatCount(summary.acceptedCount),
    },
    {
      label: translate("crm.dashboard.proposals.acceptance_rate"),
      value: `${summary.acceptanceRate}%`,
    },
  ];

  if (isPending) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">

        {translate("crm.dashboard.proposals.title")}

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
        <Link
          to="/agenda"
          className="mt-4 flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm"
        >
          <span>{translate("crm.dashboard.proposals.expired_count")}</span>
          <Badge
            variant={summary.expiredCount > 0 ? "destructive" : "secondary"}
          >
            {formatCount(summary.expiredCount)}
          </Badge>
        </Link>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            {translate("crm.dashboard.proposals.expired_amount")}
          </span>
          <span className="truncate font-medium">
            {formatAmount(summary.expiredAmount)}
          </span>
        </div>
      </Card>
    </div>
  );
};
