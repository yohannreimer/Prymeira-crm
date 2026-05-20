import { describe, expect, it } from "vitest";

import type { Deal, Lead, Proposal, Task } from "../types";
import { buildAgendaSections } from "./agendaUtils";

const now = new Date("2026-05-20T12:00:00.000Z");

const task = (id: number, dueDate: string): Task => ({
  id,
  contact_id: null,
  lead_id: null,
  deal_id: null,
  automation_run_id: null,
  type: "call",
  text: `Tarefa ${id}`,
  due_date: dueDate,
  done_date: null,
  sales_id: 4,
});

const lead = (id: number, nextActionAt: string | null): Lead => ({
  id,
  first_name: `Lead ${id}`,
  last_name: "",
  email: null,
  phone_number: null,
  company_name: null,
  source: null,
  interest: "CRM",
  temperature: "warm",
  status: "new",
  next_action_at: nextActionAt,
  discard_reason: null,
  converted_at: null,
  discarded_at: null,
  created_at: "2026-05-18T12:00:00.000Z",
  updated_at: "2026-05-18T12:00:00.000Z",
  sales_id: 4,
});

const deal = (
  id: number,
  nextActionAt: string | null,
  lastActivityAt = "2026-05-20T10:00:00.000Z",
): Deal => ({
  id,
  name: `Deal ${id}`,
  company_id: 1,
  contact_ids: [],
  category: "new-business",
  deal_type: "consultative",
  probability: 50,
  source: null,
  lost_reason: null,
  next_action_at: nextActionAt,
  last_activity_at: lastActivityAt,
  stage: "opportunity",
  description: "",
  amount: 1000,
  created_at: "2026-05-18T12:00:00.000Z",
  updated_at: "2026-05-18T12:00:00.000Z",
  expected_closing_date: "2026-06-20",
  sales_id: 4,
  index: 1,
});

const proposal = (
  id: number,
  status: Proposal["status"],
  validUntil: string | null,
): Proposal => ({
  id,
  deal_id: 21,
  company_id: 1,
  contact_id: null,
  sales_id: 4,
  template_id: 1,
  number: `PROP-${id.toString().padStart(4, "0")}`,
  title: "Proposta vencida",
  status,
  scope: "",
  terms: "",
  currency: "BRL",
  subtotal: 1000,
  discount_amount: 0,
  tax_amount: 0,
  total: 1000,
  valid_until: validUntil,
  sent_at: "2026-05-18T12:00:00.000Z",
  accepted_at: null,
  rejected_at: null,
  created_at: "2026-05-18T12:00:00.000Z",
  updated_at: "2026-05-18T12:00:00.000Z",
});

describe("buildAgendaSections", () => {
  it("groups open tasks and dated commercial records by urgency", () => {
    const sections = buildAgendaSections(
      {
        tasks: [
          task(1, "2026-05-19T15:00:00.000Z"),
          task(2, "2026-05-20T15:00:00.000Z"),
          task(3, "2026-05-22T15:00:00.000Z"),
        ],
        leads: [
          lead(11, "2026-05-19T15:00:00.000Z"),
          lead(12, "2026-05-20T15:00:00.000Z"),
        ],
        deals: [deal(21, "2026-05-22T15:00:00.000Z")],
      },
      now,
    );

    expect(sections.overdue.map((item) => item.id)).toEqual([
      "task-1",
      "lead-11",
    ]);
    expect(sections.today.map((item) => item.id)).toEqual([
      "task-2",
      "lead-12",
    ]);
    expect(sections.upcoming.map((item) => item.id)).toEqual([
      "task-3",
      "deal-21",
    ]);
  });

  it("puts leads and deals without next action into risk section", () => {
    const sections = buildAgendaSections(
      {
        tasks: [],
        leads: [lead(11, null)],
        deals: [deal(21, null), deal(22, "2026-05-25T12:00:00.000Z")],
      },
      now,
    );

    expect(sections.risks.map((item) => item.id)).toEqual([
      "lead-11",
      "deal-21",
    ]);
  });

  it("puts stale open deals into risk section", () => {
    const sections = buildAgendaSections(
      {
        tasks: [],
        leads: [],
        deals: [
          deal(21, "2026-05-25T12:00:00.000Z", "2026-05-15T12:00:00.000Z"),
        ],
      },
      now,
    );

    expect(sections.risks.map((item) => item.id)).toEqual(["deal-21"]);
  });

  it("puts expired sent proposals into risk section", () => {
    const sections = buildAgendaSections(
      {
        tasks: [],
        leads: [],
        deals: [],
        proposals: [proposal(51, "sent", "2026-05-19")],
      },
      now,
    );

    expect(sections.risks.map((item) => item.id)).toEqual(["proposal-51"]);
    expect(sections.risks[0].dueAt).toBe("2026-05-19T23:59:59.999");
  });
});
