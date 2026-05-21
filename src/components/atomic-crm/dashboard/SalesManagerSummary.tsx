import { useGetList, useLocaleState, useTranslate } from "ra-core";
import { useMemo } from "react";

import { Card } from "@/components/ui/card";

import { summarizeDeals } from "../deals/dealCommercialUtils";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal, Sale } from "../types";
import { rankSalesByDeals } from "./commercialDashboardUtils";

const DEAL_SUMMARY_PAGE_SIZE = 1000;

export const SalesManagerSummary = () => {
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();
  const { currency } = useConfigurationContext();

  const { data: deals, isPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: DEAL_SUMMARY_PAGE_SIZE },
    sort: { field: "updated_at", order: "DESC" },
    filter: { "archived_at@is": null },
  });
  const { data: sales } = useGetList<Sale>("sales", {
    pagination: { page: 1, perPage: DEAL_SUMMARY_PAGE_SIZE },
    sort: { field: "first_name", order: "ASC" },
    filter: { disabled: false },
  });

  const summary = useMemo(() => summarizeDeals(deals ?? []), [deals]);
  const salesRanking = useMemo(
    () => rankSalesByDeals(sales ?? [], deals ?? []).slice(0, 3),
    [deals, sales],
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
      label: translate("crm.dashboard.sales_summary.open_deals"),
      value: formatCount(summary.openCount),
    },
    {
      label: translate("crm.dashboard.sales_summary.open_amount"),
      value: formatAmount(summary.openAmount),
    },
    {
      label: translate("crm.dashboard.sales_summary.weighted_amount"),
      value: formatAmount(summary.weightedOpenAmount),
    },
    {
      label: translate("crm.dashboard.sales_summary.won_amount"),
      value: formatAmount(summary.wonAmount),
    },
  ];

  if (isPending) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">

        {translate("crm.dashboard.sales_summary.title")}

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
        {salesRanking.length ? (
          <div className="mt-4 border-t pt-3">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              {translate("crm.dashboard.sales_summary.sales_ranking")}
            </div>
            <div className="space-y-2">
              {salesRanking.map((item) => (
                <div
                  key={item.salesId}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-muted-foreground">
                    {formatCount(item.openDeals)} ·{" "}
                    {formatAmount(item.weightedAmount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
};
