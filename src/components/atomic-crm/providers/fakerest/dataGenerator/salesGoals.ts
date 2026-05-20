import type { SalesGoal } from "../../../types";

export const generateSalesGoals = (): SalesGoal[] => [
  {
    id: 1,
    sales_id: 1,
    period_start: "2026-05-01",
    revenue_goal: 5000000,
    won_deals_goal: 5,
    sent_proposals_goal: 10,
    created_at: "2026-05-20T00:00:00.000Z",
    updated_at: "2026-05-20T00:00:00.000Z",
  },
];
