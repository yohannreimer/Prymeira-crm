import type { SalesGoal } from "../types";

type SalesGoalFormData = Partial<SalesGoal>;

export const centsToCurrencyUnits = (value?: number | null) =>
  value == null ? value : value / 100;

export const currencyUnitsToCents = (value?: number | null) =>
  value == null ? 0 : Math.round(value * 100);

export const normalizeSalesGoalRecordForForm = (
  record: SalesGoal,
): SalesGoal => ({
  ...record,
  revenue_goal: centsToCurrencyUnits(record.revenue_goal) ?? 0,
});

export const transformSalesGoalFormValues = (
  data: SalesGoalFormData,
): SalesGoalFormData => ({
  ...data,
  revenue_goal: currencyUnitsToCents(data.revenue_goal),
});
