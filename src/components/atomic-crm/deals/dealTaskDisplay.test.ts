import { describe, expect, it } from "vitest";

import type { Task } from "../types";
import {
  getOpenDealTasks,
  getTaskDueState,
  groupOpenDealTasks,
} from "./dealTaskDisplay";

const task = (overrides: Partial<Task>): Task => ({
  id: overrides.id ?? 1,
  workspace_id: "workspace-1",
  deal_id: 1,
  contact_id: null,
  lead_id: null,
  automation_run_id: null,
  type: "follow-up",
  text: "Ligar",
  due_date: "2026-05-24T00:00:00.000Z",
  done_date: null,
  sales_id: 1,
  ...overrides,
});

describe("dealTaskDisplay", () => {
  it("groups only open tasks by deal", () => {
    expect(
      groupOpenDealTasks([
        task({ id: 1, deal_id: 1 }),
        task({ id: 2, deal_id: 1, done_date: "2026-05-24T10:00:00.000Z" }),
        task({ id: 3, deal_id: 2 }),
        task({ id: 4, deal_id: null }),
      ]),
    ).toEqual({
      "1": [expect.objectContaining({ id: 1 })],
      "2": [expect.objectContaining({ id: 3 })],
    });
  });

  it("sorts open deal tasks by due date", () => {
    expect(
      getOpenDealTasks(
        [
          task({ id: 1, due_date: "2026-05-26T00:00:00.000Z" }),
          task({ id: 2, due_date: "2026-05-24T00:00:00.000Z" }),
        ],
        1,
      ).map(({ id }) => id),
    ).toEqual([2, 1]);
  });

  it("describes due state relative to today", () => {
    const now = new Date(2026, 4, 24, 12);

    expect(getTaskDueState(task({ due_date: "2026-05-23" }), now)).toEqual({
      state: "overdue",
      days: 1,
    });
    expect(getTaskDueState(task({ due_date: "2026-05-24" }), now)).toEqual({
      state: "today",
      days: 0,
    });
    expect(getTaskDueState(task({ due_date: "2026-05-25" }), now)).toEqual({
      state: "tomorrow",
      days: 1,
    });
    expect(getTaskDueState(task({ due_date: "2026-05-27" }), now)).toEqual({
      state: "future",
      days: 3,
    });
  });
});
