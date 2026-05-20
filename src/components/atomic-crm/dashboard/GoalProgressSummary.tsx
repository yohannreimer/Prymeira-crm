import { Target } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { useMemo } from "react";

import { Card } from "@/components/ui/card";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal, Proposal, Sale, SalesGoal } from "../types";
import { calculateGoalProgress } from "./advancedCommercialDashboardUtils";
import { useDashboardScope } from "./useDashboardScope";

const PAGE_SIZE = 500;
const LOCALE = "pt-BR";

const formatCurrency = (amount: number, currency: string) =>
  (amount / 100).toLocaleString(LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

const getIdentitySale = (identity: {
  id: Sale["id"];
  fullName?: string;
}): Sale => {
  const [firstName = "", ...lastNameParts] =
    identity.fullName?.split(" ") ?? [];

  return {
    id: identity.id,
    first_name: firstName,
    last_name: lastNameParts.join(" "),
    administrator: false,
    disabled: false,
    user_id: "",
    email: "",
  };
};

const ProgressBar = ({ value }: { value: number }) => (
  <div className="h-2 rounded-full bg-muted">
    <div
      className="h-2 rounded-full bg-primary"
      style={{ width: `${Math.min(100, value)}%` }}
    />
  </div>
);

export const GoalProgressSummary = () => {
  const translate = useTranslate();
  const { currency } = useConfigurationContext();
  const scope = useDashboardScope();
  const { data: sales, isPending: isPendingSales } = useGetList<Sale>(
    "sales",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      sort: { field: "first_name", order: "ASC" },
      filter: { disabled: false, ...scope.ownRecordFilter },
    },
    { enabled: !scope.isPending },
  );
  const { data: goals, isPending: isPendingGoals } = useGetList<SalesGoal>(
    "sales_goals",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      sort: { field: "period_start", order: "DESC" },
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

  const rows = useMemo(() => {
    if (!scope.identity) return [];

    const currentSale =
      scope.currentSale ??
      (sales ?? []).find(
        (sale) => String(sale.id) === String(scope.identity?.id),
      );
    const visibleSales = scope.isAdmin
      ? (sales ?? [])
      : [currentSale ?? getIdentitySale(scope.identity)];

    return calculateGoalProgress(
      visibleSales,
      goals ?? [],
      deals ?? [],
      proposals ?? [],
      new Date().toISOString(),
    );
  }, [deals, goals, proposals, sales, scope]);

  if (
    scope.isPending ||
    isPendingSales ||
    isPendingGoals ||
    isPendingDeals ||
    isPendingProposals
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex">
          <Target className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("crm.dashboard.advanced.goal_progress.title", {
            _: "Progresso de metas",
          })}
        </h2>
      </div>
      <Card className="p-4">
        {rows.length ? (
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={String(row.salesId)} className="space-y-3">
                <div className="font-medium">{row.name}</div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">
                        {translate(
                          "crm.dashboard.advanced.goal_progress.revenue",
                          {
                            _: "Receita",
                          },
                        )}
                      </span>
                      <span className="font-medium">
                        {row.revenueProgress}%
                      </span>
                    </div>
                    <ProgressBar value={row.revenueProgress} />
                    <div className="truncate text-xs text-muted-foreground">
                      {formatCurrency(row.revenueActual, currency)} /{" "}
                      {formatCurrency(row.revenueGoal, currency)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">
                        {translate(
                          "crm.dashboard.advanced.goal_progress.won_deals",
                          {
                            _: "Negócios ganhos",
                          },
                        )}
                      </span>
                      <span className="font-medium">
                        {row.wonDealsProgress}%
                      </span>
                    </div>
                    <ProgressBar value={row.wonDealsProgress} />
                    <div className="text-xs text-muted-foreground">
                      {row.wonDealsActual} / {row.wonDealsGoal}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">
                        {translate(
                          "crm.dashboard.advanced.goal_progress.sent_proposals",
                          { _: "Propostas enviadas" },
                        )}
                      </span>
                      <span className="font-medium">
                        {row.sentProposalsProgress}%
                      </span>
                    </div>
                    <ProgressBar value={row.sentProposalsProgress} />
                    <div className="text-xs text-muted-foreground">
                      {row.sentProposalsActual} / {row.sentProposalsGoal}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {translate("crm.dashboard.advanced.goal_progress.empty", {
              _: "Nenhuma meta comercial para exibir.",
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
