import { Trophy } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { useMemo } from "react";

import { Card } from "@/components/ui/card";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal, Proposal, Sale, Task } from "../types";
import { calculateSellerRanking } from "./advancedCommercialDashboardUtils";
import { useDashboardScope } from "./useDashboardScope";

const PAGE_SIZE = 500;
const LOCALE = "pt-BR";

const formatCurrency = (amount: number, currency: string) =>
  (amount / 100).toLocaleString(LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

export const AdvancedSellerRanking = () => {
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
  const { data: tasks, isPending: isPendingTasks } = useGetList<Task>(
    "tasks",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      sort: { field: "due_date", order: "ASC" },
      filter: scope.salesFilter,
    },
    { enabled: !scope.isPending },
  );

  const ranking = useMemo(
    () =>
      calculateSellerRanking(
        sales ?? [],
        deals ?? [],
        proposals ?? [],
        tasks ?? [],
      ),
    [deals, proposals, sales, tasks],
  );

  if (
    scope.isPending ||
    isPendingSales ||
    isPendingDeals ||
    isPendingProposals ||
    isPendingTasks
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex">
          <Trophy className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("crm.dashboard.advanced.seller_ranking.title", {
            _: "Ranking comercial",
          })}
        </h2>
      </div>
      <Card className="p-4">
        {ranking.length ? (
          <div className="space-y-3">
            {ranking.map((seller) => (
              <div
                key={String(seller.salesId)}
                className="grid gap-2 border-b pb-3 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_repeat(4,minmax(0,auto))]"
              >
                <div className="min-w-0 font-medium">{seller.name}</div>
                <div className="min-w-0 text-sm">
                  <div className="text-xs text-muted-foreground">
                    {translate(
                      "crm.dashboard.advanced.seller_ranking.won_amount",
                      {
                        _: "Ganho",
                      },
                    )}
                  </div>
                  <div className="truncate">
                    {formatCurrency(seller.wonAmount, currency)}
                  </div>
                </div>
                <div className="min-w-0 text-sm">
                  <div className="text-xs text-muted-foreground">
                    {translate(
                      "crm.dashboard.advanced.seller_ranking.weighted_amount",
                      { _: "Ponderado" },
                    )}
                  </div>
                  <div className="truncate">
                    {formatCurrency(seller.weightedAmount, currency)}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-xs text-muted-foreground">
                    {translate(
                      "crm.dashboard.advanced.seller_ranking.accepted_proposals",
                      { _: "Aceitas" },
                    )}
                  </div>
                  <div>{seller.acceptedProposals}</div>
                </div>
                <div className="text-sm">
                  <div className="text-xs text-muted-foreground">
                    {translate(
                      "crm.dashboard.advanced.seller_ranking.overdue_tasks",
                      {
                        _: "Tarefas vencidas",
                      },
                    )}
                  </div>
                  <div>{seller.overdueTasks}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {translate("crm.dashboard.advanced.seller_ranking.empty", {
              _: "Nenhum vendedor para exibir.",
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
