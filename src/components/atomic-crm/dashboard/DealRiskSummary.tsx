import { AlertTriangle } from "lucide-react";
import { useGetList, useLocaleState, useTranslate } from "ra-core";
import { useMemo } from "react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { getDealRiskState } from "../deals/dealCommercialUtils";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import {
  summarizeDealsByStage,
  summarizeLostReasons,
} from "./commercialDashboardUtils";

const PAGE_SIZE = 1000;

export const DealRiskSummary = () => {
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();
  const { currency, dealStages, dealLostReasons } = useConfigurationContext();
  const { data: deals, isPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: PAGE_SIZE },
    sort: { field: "updated_at", order: "DESC" },
    filter: { "archived_at@is": null },
  });

  const stageSummary = useMemo(
    () => summarizeDealsByStage(deals ?? []),
    [deals],
  );
  const lostReasons = useMemo(() => summarizeLostReasons(deals ?? []), [deals]);
  const riskCount = useMemo(
    () =>
      (deals ?? []).filter((deal) => getDealRiskState(deal) !== "healthy")
        .length,
    [deals],
  );

  const formatAmount = (amount: number) =>
    (amount / 100).toLocaleString(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });

  const stageLabel = (stage: string) =>
    dealStages.find((item) => item.value === stage)?.label ?? stage;
  const lostReasonLabel = (reason: string) =>
    dealLostReasons.find((item) => item.value === reason)?.label ?? reason;

  if (isPending) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">

        {translate("crm.dashboard.deal_risk.title")}

      </p>
      <Card className="p-4">
        <Link
          to="/agenda"
          className="mb-3 flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm"
        >
          <span>{translate("crm.dashboard.deal_risk.items_at_risk")}</span>
          <Badge variant={riskCount > 0 ? "destructive" : "secondary"}>
            {riskCount}
          </Badge>
        </Link>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              {translate("crm.dashboard.deal_risk.by_stage")}
            </div>
            <div className="space-y-2">
              {stageSummary.slice(0, 5).map((item) => (
                <div
                  key={item.stage}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate">{stageLabel(item.stage)}</span>
                  <span className="text-muted-foreground">
                    {item.count} · {formatAmount(item.weightedAmount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              {translate("crm.dashboard.deal_risk.lost_reasons")}
            </div>
            <div className="space-y-2">
              {lostReasons.slice(0, 5).map((item) => (
                <div
                  key={item.reason}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate">
                    {lostReasonLabel(item.reason)}
                  </span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
              ))}
              {!lostReasons.length && (
                <div className="text-sm text-muted-foreground">
                  {translate("crm.dashboard.deal_risk.no_lost_reasons")}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
