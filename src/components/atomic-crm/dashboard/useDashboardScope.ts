import { useGetIdentity, useGetOne } from "ra-core";
import type { Identifier } from "ra-core";
import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";

import type { Sale } from "../types";

export type DashboardPeriod = "month" | "quarter" | "year" | "all";

type DateFilter = Record<string, string>;

type DashboardPeriodContextValue = {
  period: DashboardPeriod;
  periodStart: string | null;
  buildPeriodFilter: (field?: string) => DateFilter;
};

const defaultPeriodContext: DashboardPeriodContextValue = {
  period: "all",
  periodStart: null,
  buildPeriodFilter: () => ({}),
};

const DashboardPeriodContext =
  createContext<DashboardPeriodContextValue>(defaultPeriodContext);

export function getDashboardPeriodStart(
  period: DashboardPeriod,
  now = new Date(),
): string | null {
  if (period === "all") return null;

  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }

  if (period === "quarter") {
    const quarter = Math.floor(now.getMonth() / 3);
    return new Date(now.getFullYear(), quarter * 3, 1).toISOString();
  }

  return new Date(now.getFullYear(), 0, 1).toISOString();
}

export const DashboardScopeProvider = ({
  children,
  period,
}: PropsWithChildren<{ period: DashboardPeriod }>) => {
  const value = useMemo<DashboardPeriodContextValue>(() => {
    const periodStart = getDashboardPeriodStart(period);

    return {
      period,
      periodStart,
      buildPeriodFilter: (field = "created_at") =>
        periodStart ? { [`${field}@gte`]: periodStart } : {},
    };
  }, [period]);

  return createElement(DashboardPeriodContext.Provider, { value }, children);
};

export const useDashboardScope = () => {
  const periodScope = useContext(DashboardPeriodContext);
  const { identity, isPending: isPendingIdentity } = useGetIdentity();
  const hasIdentity = identity?.id != null;
  const { data: currentSale, isPending: isPendingCurrentSale } =
    useGetOne<Sale>(
      "sales",
      { id: identity?.id ?? "" },
      { enabled: hasIdentity },
    );

  const isAdmin = currentSale?.administrator === true;
  const salesId = identity?.id as Identifier | undefined;
  const salesFilter = !isAdmin && salesId != null ? { sales_id: salesId } : {};
  const ownRecordFilter = !isAdmin && salesId != null ? { id: salesId } : {};

  return {
    buildPeriodFilter: periodScope.buildPeriodFilter,
    currentSale,
    identity,
    isAdmin,
    isPending: isPendingIdentity || (hasIdentity && isPendingCurrentSale),
    ownRecordFilter,
    period: periodScope.period,
    periodFilter: periodScope.buildPeriodFilter(),
    periodStart: periodScope.periodStart,
    salesFilter,
    salesId,
  };
};
