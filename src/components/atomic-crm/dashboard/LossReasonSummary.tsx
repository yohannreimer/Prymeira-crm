import { CircleX } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { useMemo } from "react";

import { Card } from "@/components/ui/card";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { calculateLossReasons } from "./advancedCommercialDashboardUtils";
import { useDashboardScope } from "./useDashboardScope";

const PAGE_SIZE = 500;
const LOCALE = "pt-BR";

const formatCurrency = (amount: number, currency: string) =>
  (amount / 100).toLocaleString(LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

export const LossReasonSummary = () => {
  const translate = useTranslate();
  const { currency, dealLostReasons } = useConfigurationContext();
  const scope = useDashboardScope();
  const { data: deals, isPending } = useGetList<Deal>(
    "deals",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      sort: { field: "updated_at", order: "DESC" },
      filter: { "archived_at@is": null, ...scope.salesFilter },
    },
    { enabled: !scope.isPending },
  );

  const reasons = useMemo(() => calculateLossReasons(deals ?? []), [deals]);
  const reasonLabel = (reason: string) =>
    dealLostReasons.find((item) => item.value === reason)?.label ?? reason;

  if (scope.isPending || isPending) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex">
          <CircleX className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("crm.dashboard.advanced.loss_reasons.title", {
            _: "Motivos de perda",
          })}
        </h2>
      </div>
      <Card className="p-4">
        {reasons.length ? (
          <div className="space-y-2">
            {reasons.map((reason) => (
              <div
                key={reason.reason}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="truncate">{reasonLabel(reason.reason)}</span>
                <span className="shrink-0 text-muted-foreground">
                  {reason.count} · {formatCurrency(reason.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {translate("crm.dashboard.advanced.loss_reasons.empty", {
              _: "Nenhum motivo de perda registrado.",
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
