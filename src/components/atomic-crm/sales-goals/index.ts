import type { SalesGoal } from "../types";
import { SalesGoalCreate } from "./SalesGoalCreate";
import { SalesGoalEdit } from "./SalesGoalEdit";
import { SalesGoalList } from "./SalesGoalList";

export default {
  list: SalesGoalList,
  create: SalesGoalCreate,
  edit: SalesGoalEdit,
  recordRepresentation: (goal: SalesGoal) =>
    `${goal.sales_id} - ${goal.period_start}`,
};
