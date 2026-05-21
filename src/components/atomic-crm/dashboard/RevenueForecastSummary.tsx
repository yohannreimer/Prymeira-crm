import { useGetList, useTranslate } from "ra-core";
import { useMemo } from "react";

import { Card } from "@/components/ui/card";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal, Proposal } from "../types";
import { calculateRevenueForecast } from "./advancedCommercialDashboardUtils";
import { useDashboardScope } from "./useDashboardScope";

const PAGE_SIZE = 500;
const LOCALE = "pt-BR";

const formatCurrency = (amount: number, currency: string) =>
  (amount / 100).toLocaleString(LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

export const RevenueForecastSummary = () => {
  const translate = useTranslate();
  const { currency } = useConfigurationContext();
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

  const forecast = useMemo(
    () => calculateRevenueForecast(deals ?? [], proposals ?? []),
    [deals, proposals],
  );

  if (scope.isPending || isPendingDeals || isPendingProposals) return null;

  const metrics = [
    {
      label: translate(
        "crm.dashboard.advanced.revenue_forecast.weighted_deals",
        {
          _: "Negócios ponderados",
        },
      ),
      value: formatCurrency(forecast.dealWeightedAmount, currency),
    },
    {
      label: translate(
        "crm.dashboard.advanced.revenue_forecast.open_proposals",
        {
          _: "Propostas abertas",
        },
      ),
      value: formatCurrency(forecast.proposalOpenAmount, currency),
    },
    {
      label: translate("crm.dashboard.advanced.revenue_forecast.total", {
        _: "Previsão total",
      }),
      value: formatCurrency(forecast.forecastAmount, currency),
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">

        {translate("crm.dashboard.advanced.revenue_forecast.title", {
            _: "Previsão de receita",
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
