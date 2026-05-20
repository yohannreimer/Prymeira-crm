import { describe, expect, it } from "vitest";

import type { Deal, Lead, Proposal, Sale } from "../types";
import {
  rankSalesByDeals,
  summarizeDealsByStage,
  summarizeLeads,
  summarizeLostReasons,
  summarizeProposals,
} from "./commercialDashboardUtils";

const lead = (
  id: number,
  status: Lead["status"],
  temperature: Lead["temperature"] = "warm",
  nextActionAt: string | null = "2026-05-22T12:00:00.000Z",
): Lead => ({
  id,
  first_name: `Lead ${id}`,
  last_name: "",
  email: null,
  phone_number: null,
  company_name: null,
  source: null,
  interest: null,
  temperature,
  status,
  next_action_at: nextActionAt,
  discard_reason: null,
  converted_at: status === "converted" ? "2026-05-20T12:00:00.000Z" : null,
  discarded_at: null,
  created_at: "2026-05-18T12:00:00.000Z",
  updated_at: "2026-05-18T12:00:00.000Z",
  sales_id: 1,
});

const deal = (
  id: number,
  stage: string,
  amount: number,
  salesId = 1,
  lostReason: string | null = null,
): Deal => ({
  id,
  name: `Deal ${id}`,
  company_id: 1,
  contact_ids: [],
  category: "new-business",
  deal_type: "consultative",
  probability: stage === "proposal-sent" ? 70 : 25,
  source: null,
  lost_reason: lostReason,
  next_action_at: "2026-05-22T12:00:00.000Z",
  last_activity_at: "2026-05-20T12:00:00.000Z",
  stage,
  description: "",
  amount,
  created_at: "2026-05-18T12:00:00.000Z",
  updated_at: "2026-05-18T12:00:00.000Z",
  expected_closing_date: "2026-06-20",
  sales_id: salesId,
  index: 1,
});

const sales: Sale[] = [
  {
    id: 1,
    first_name: "Ana",
    last_name: "Silva",
    email: "ana@example.com",
    administrator: false,
    user_id: "1",
  },
  {
    id: 2,
    first_name: "Bruno",
    last_name: "Costa",
    email: "bruno@example.com",
    administrator: false,
    user_id: "2",
  },
];

const proposal = (
  id: number,
  status: Proposal["status"],
  total: number,
  validUntil: string | null,
): Proposal => ({
  id,
  deal_id: 1,
  company_id: 1,
  contact_id: null,
  sales_id: 1,
  template_id: 1,
  number: `PROP-${id.toString().padStart(4, "0")}`,
  title: `Proposta ${id}`,
  status,
  scope: "",
  terms: "",
  currency: "BRL",
  subtotal: total,
  discount_amount: 0,
  tax_amount: 0,
  total,
  valid_until: validUntil,
  sent_at: status === "sent" ? "2026-05-18T12:00:00.000Z" : null,
  accepted_at: status === "accepted" ? "2026-05-20T12:00:00.000Z" : null,
  rejected_at: status === "rejected" ? "2026-05-20T12:00:00.000Z" : null,
  created_at: "2026-05-18T12:00:00.000Z",
  updated_at: "2026-05-18T12:00:00.000Z",
});

describe("commercialDashboardUtils", () => {
  it("summarizes lead volume, hot leads, missing next action, and conversion", () => {
    expect(
      summarizeLeads([
        lead(1, "new", "hot", null),
        lead(2, "qualified", "warm"),
        lead(3, "converted", "hot"),
        lead(4, "discarded", "cold"),
      ]),
    ).toEqual({
      total: 4,
      open: 2,
      hot: 2,
      missingNextAction: 1,
      converted: 1,
      conversionRate: 25,
      byStatus: {
        new: 1,
        contacted: 0,
        qualified: 1,
        converted: 1,
        discarded: 1,
      },
    });
  });

  it("summarizes deals by stage with amount and weighted amount", () => {
    expect(
      summarizeDealsByStage([
        deal(1, "opportunity", 1000),
        deal(2, "proposal-sent", 2000),
      ]),
    ).toEqual([
      {
        stage: "opportunity",
        count: 1,
        amount: 1000,
        weightedAmount: 250,
      },
      {
        stage: "proposal-sent",
        count: 1,
        amount: 2000,
        weightedAmount: 1400,
      },
    ]);
  });

  it("summarizes lost reasons", () => {
    expect(
      summarizeLostReasons([
        deal(1, "lost", 1000, 1, "price"),
        deal(2, "lost", 2000, 1, "price"),
        deal(3, "lost", 3000, 1, "no-fit"),
      ]),
    ).toEqual([
      { reason: "price", count: 2, amount: 3000 },
      { reason: "no-fit", count: 1, amount: 3000 },
    ]);
  });

  it("ranks sales by open deals and amount", () => {
    expect(
      rankSalesByDeals(sales, [
        deal(1, "opportunity", 1000, 1),
        deal(2, "proposal-sent", 2000, 2),
        deal(3, "proposal-sent", 3000, 2),
        deal(4, "won", 4000, 1),
      ]),
    ).toEqual([
      {
        salesId: 2,
        name: "Bruno Costa",
        openDeals: 2,
        openAmount: 5000,
        weightedAmount: 3500,
      },
      {
        salesId: 1,
        name: "Ana Silva",
        openDeals: 1,
        openAmount: 1000,
        weightedAmount: 250,
      },
    ]);
  });

  it("summarizes proposal metrics", () => {
    expect(
      summarizeProposals(
        [
          proposal(1, "sent", 1000, "2026-05-19"),
          proposal(2, "accepted", 2000, "2026-05-30"),
          proposal(3, "rejected", 3000, "2026-05-30"),
        ],
        new Date("2026-05-20T12:00:00.000Z"),
      ),
    ).toEqual({
      openCount: 1,
      openAmount: 1000,
      acceptedCount: 1,
      acceptedAmount: 2000,
      expiredCount: 1,
      expiredAmount: 1000,
      acceptanceRate: 50,
    });
  });

  it("counts explicit expired proposals and ignores open proposals in acceptance rate", () => {
    expect(
      summarizeProposals(
        [
          proposal(1, "draft", 500, null),
          proposal(2, "sent", 1000, "2026-05-30"),
          proposal(3, "expired", 1500, "2026-05-19"),
          proposal(4, "accepted", 2000, "2026-05-30"),
          proposal(5, "rejected", 3000, "2026-05-30"),
        ],
        new Date("2026-05-20T12:00:00.000Z"),
      ),
    ).toEqual({
      openCount: 1,
      openAmount: 1000,
      acceptedCount: 1,
      acceptedAmount: 2000,
      expiredCount: 1,
      expiredAmount: 1500,
      acceptanceRate: 50,
    });
  });
});
