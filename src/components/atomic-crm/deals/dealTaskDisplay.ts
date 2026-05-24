import type { Identifier } from "ra-core";

import type { Task } from "../types";

export const getOpenDealTasks = (tasks: Task[], dealId: Identifier) =>
  tasks
    .filter(
      (task) => String(task.deal_id) === String(dealId) && !task.done_date,
    )
    .sort(compareTasksByDueDate);

export const groupOpenDealTasks = (tasks: Task[]) =>
  tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (task.deal_id == null || task.done_date) return acc;

    const dealId = String(task.deal_id);
    acc[dealId] = [...(acc[dealId] ?? []), task].sort(compareTasksByDueDate);
    return acc;
  }, {});

export type TaskDueState = "overdue" | "today" | "tomorrow" | "future";

export const getTaskDueState = (
  task: Pick<Task, "due_date">,
  now = new Date(),
): { state: TaskDueState; days: number } => {
  const dueDate = parseTaskDate(task.due_date);
  const today = startOfLocalDay(now);
  const diffInDays = Math.round(
    (dueDate.getTime() - today.getTime()) / 86_400_000,
  );

  if (diffInDays < 0) return { state: "overdue", days: Math.abs(diffInDays) };
  if (diffInDays === 0) return { state: "today", days: 0 };
  if (diffInDays === 1) return { state: "tomorrow", days: 1 };
  return { state: "future", days: diffInDays };
};

const compareTasksByDueDate = (a: Task, b: Task) =>
  parseTaskDate(a.due_date).getTime() - parseTaskDate(b.due_date).getTime();

const parseTaskDate = (dateString: string) => {
  const [datePart] = dateString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) return new Date(dateString);
  return new Date(year, month - 1, day);
};

const startOfLocalDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};
