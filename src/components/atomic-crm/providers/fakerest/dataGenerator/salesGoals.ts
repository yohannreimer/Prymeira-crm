import type { SalesGoal } from "../../../types";

const makeGoal = (
  id: number,
  sales_id: number,
  period_start: string,
  revenue_goal: number,
  won_deals_goal: number,
  sent_proposals_goal: number,
): SalesGoal => ({
  id,
  sales_id,
  period_start,
  revenue_goal,
  won_deals_goal,
  sent_proposals_goal,
  created_at: "2026-05-20T00:00:00.000Z",
  updated_at: "2026-06-05T00:00:00.000Z",
});

export const generateSalesGoals = (): SalesGoal[] => [
  makeGoal(1, 0, "2026-06-01", 420000, 4, 8),
  makeGoal(2, 1, "2026-06-01", 260000, 3, 6),
  makeGoal(3, 2, "2026-06-01", 310000, 3, 7),
  makeGoal(4, 3, "2026-06-01", 280000, 3, 6),
  makeGoal(5, 4, "2026-06-01", 220000, 2, 5),
  makeGoal(6, 5, "2026-06-01", 190000, 2, 5),
  makeGoal(7, 0, "2026-07-01", 480000, 5, 9),
  makeGoal(8, 1, "2026-07-01", 300000, 3, 7),
  makeGoal(9, 2, "2026-07-01", 340000, 4, 7),
];
