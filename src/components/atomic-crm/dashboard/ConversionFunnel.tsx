import { useGetList, useLocaleState, useTranslate } from "ra-core";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useConfigurationContext } from "../root/ConfigurationContext";
import {
  centsToCurrencyUnits,
  formatCurrencyAmount,
} from "../misc/formatCurrency";
import { summarizeLeads } from "./commercialDashboardUtils";
import { summarizeDeals } from "../deals/dealCommercialUtils";
import { summarizeProposals } from "./commercialDashboardUtils";
import type { Deal, Lead, Proposal } from "../types";
import { useDashboardScope } from "./useDashboardScope";

const PAGE_SIZE = 1000;

interface FunnelStep {
  label: string;
  count: number;
  amount?: number;
  color: string;
  rate?: number;
}

export const ConversionFunnel = () => {
  const translate = useTranslate();
  const [locale = "pt-BR"] = useLocaleState();
  const { currency } = useConfigurationContext();
  const scope = useDashboardScope();

  const { data: leads, isPending: isPendingLeads } = useGetList<Lead>(
    "leads",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      filter: { ...scope.salesFilter, ...scope.periodFilter },
    },
    { enabled: !scope.isPending },
  );

  const { data: deals, isPending: isPendingDeals } = useGetList<Deal>(
    "deals",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      filter: {
        "archived_at@is": null,
        ...scope.salesFilter,
        ...scope.periodFilter,
      },
    },
    { enabled: !scope.isPending },
  );

  const { data: proposals, isPending: isPendingProposals } =
    useGetList<Proposal>(
      "proposals",
      {
        pagination: { page: 1, perPage: PAGE_SIZE },
        filter: { ...scope.salesFilter, ...scope.periodFilter },
      },
      { enabled: !scope.isPending },
    );

  const isPending =
    scope.isPending || isPendingLeads || isPendingDeals || isPendingProposals;

  const steps = useMemo<FunnelStep[]>(() => {
    const leadSummary = summarizeLeads(leads ?? []);
    const dealSummary = summarizeDeals(deals ?? []);
    const proposalSummary = summarizeProposals(proposals ?? []);

    const totalLeads = leadSummary.total;
    const totalDeals = (deals ?? []).length;
    const totalProposals = (proposals ?? []).length;
    const wonDeals = (deals ?? []).filter((d) => d.stage === "won").length;

    return [
      {
        label: translate("resources.leads.name", { smart_count: 2 }),
        count: totalLeads,
        color: "bg-primary/80",
        rate: undefined,
      },
      {
        label: translate("resources.deals.name", { smart_count: 2 }),
        count: totalDeals,
        amount: dealSummary.openAmount,
        color: "bg-primary/60",
        rate: totalLeads > 0 ? Math.round((totalDeals / totalLeads) * 100) : 0,
      },
      {
        label: translate("resources.proposals.name", { smart_count: 2 }),
        count: totalProposals,
        amount: centsToCurrencyUnits(proposalSummary.openAmount),
        color: "bg-primary/40",
        rate:
          totalDeals > 0 ? Math.round((totalProposals / totalDeals) * 100) : 0,
      },
      {
        label: translate("crm.dashboard.sales_summary.won_amount"),
        count: wonDeals,
        amount: dealSummary.wonAmount,
        color: "bg-primary/20",
        rate:
          totalProposals > 0
            ? Math.round((wonDeals / totalProposals) * 100)
            : 0,
      },
    ];
  }, [leads, deals, proposals, translate]);

  const formatAmount = (amount: number) =>
    formatCurrencyAmount(amount, currency, locale, {
      maximumFractionDigits: 0,
    });

  const maxCount = Math.max(...steps.map((s) => s.count), 1);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
        Funil de Conversão
      </p>
      <Card className="p-5">
        {isPending ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Carregando...
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {steps.map((step, i) => {
              const width = Math.max((step.count / maxCount) * 100, 4);
              return (
                <div key={step.label} className="flex items-center gap-4">
                  <div className="w-[120px] shrink-0 text-right">
                    <p className="text-[11px] font-medium text-foreground truncate">
                      {step.label}
                    </p>
                    {step.amount !== undefined && (
                      <p className="text-[10px] text-muted-foreground">
                        {formatAmount(step.amount)}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-7 bg-muted/40 rounded-md overflow-hidden">
                      <div
                        className={`h-full rounded-md transition-all duration-500 ${step.color}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <div className="w-[52px] shrink-0 flex flex-col items-end">
                      <span className="text-[13px] font-semibold text-foreground">
                        {step.count}
                      </span>
                      {i > 0 && step.rate !== undefined && (
                        <span className="text-[10px] text-muted-foreground">
                          {step.rate}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
