import { describe, expect, it } from "vitest";

import type { Deal, Lead, Proposal, Sale, SalesGoal, Task } from "../types";
import {
  calculateFunnelConversion,
  calculateGoalProgress,
  calculateLossReasons,
  calculatePipelineAging,
  calculateRevenueForecast,
  calculateSellerRanking,
} from "./advancedCommercialDashboardUtils";

const sale = (id: number, firstName: string): Sale => ({
  id,
  first_name: firstName,
  last_name: "Comercial",
  administrator: id === 1,
  disabled: false,
  user_id: `user-${id}`,
  email: `${firstName}@example.com`,
});

const salesGoal = (overrides: Partial<SalesGoal>): SalesGoal => ({
  id: overrides.id ?? 1,
  sales_id: 1,
  period_start: "2026-05-01",
  revenue_goal: 200000,
  won_deals_goal: 2,
  sent_proposals_goal: 3,
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-01T00:00:00.000Z",
  ...overrides,
});

const lead = (id: number, status: Lead["status"]): Lead => ({
  id,
  first_name: `Lead ${id}`,
  last_name: "",
  email: null,
  phone_number: null,
  company_name: null,
  source: null,
  interest: null,
  temperature: "warm",
  status,
  next_action_at: null,
  discard_reason: null,
  converted_at: status === "converted" ? "2026-05-10T00:00:00.000Z" : null,
  discarded_at: null,
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-01T00:00:00.000Z",
  sales_id: 1,
});

const deal = (overrides: Partial<Deal>): Deal => ({
  id: overrides.id ?? 1,
  name: "Negocio",
  company_id: 1,
  contact_ids: [],
  category: "new-business",
  deal_type: "consultative",
  probability: 50,
  source: null,
  lost_reason: null,
  next_action_at: null,
  last_activity_at: "2026-05-10T00:00:00.000Z",
  stage: "proposal-sent",
  description: "",
  amount: 100000,
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-10T00:00:00.000Z",
  archived_at: undefined,
  expected_closing_date: "2026-05-30",
  sales_id: 1,
  index: 0,
  ...overrides,
});

const proposal = (overrides: Partial<Proposal>): Proposal => ({
  id: overrides.id ?? 1,
  deal_id: 1,
  company_id: 1,
  contact_id: null,
  sales_id: 1,
  template_id: null,
  number: "PROP-0001",
  title: "Proposta",
  status: "sent",
  scope: null,
  terms: null,
  internal_notes: null,
  delivery_time: null,
  payment_terms: null,
  currency: "BRL",
  subtotal: 100000,
  discount_amount: 0,
  tax_amount: 0,
  total: 100000,
  valid_until: "2026-05-30",
  sent_at: "2026-05-05T00:00:00.000Z",
  accepted_at: null,
  rejected_at: null,
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-05T00:00:00.000Z",
  ...overrides,
});

describe("advanced dashboard metrics", () => {
  it("calculates goal progress for a seller", () => {
    const result = calculateGoalProgress(
      [sale(1, "Ana")],
      [salesGoal({ id: 1 })],
      [deal({ id: 1, stage: "won", amount: 100000 })],
      [
        proposal({ id: 1, status: "sent" }),
        proposal({ id: 2, status: "accepted" }),
      ],
      "2026-05-15",
    );

    expect(result[0]).toEqual(
      expect.objectContaining({
        salesId: 1,
        revenueProgress: 50,
        wonDealsProgress: 50,
        sentProposalsProgress: 67,
      }),
    );
  });

  it("returns zero progress when goals are zero", () => {
    expect(
      calculateGoalProgress(
        [sale(1, "Ana")],
        [
          salesGoal({
            revenue_goal: 0,
            won_deals_goal: 0,
            sent_proposals_goal: 0,
          }),
        ],
        [deal({ id: 1, stage: "won", amount: 100000 })],
        [proposal({ id: 1, status: "sent" })],
        "2026-05-15",
      )[0],
    ).toEqual(
      expect.objectContaining({
        revenueProgress: 0,
        wonDealsProgress: 0,
        sentProposalsProgress: 0,
      }),
    );
  });

  it("caps goal progress at 999", () => {
    expect(
      calculateGoalProgress(
        [sale(1, "Ana")],
        [
          salesGoal({
            revenue_goal: 1000,
            won_deals_goal: 1,
            sent_proposals_goal: 1,
          }),
        ],
        [deal({ id: 1, stage: "won", amount: 200000 })],
        [
          proposal({ id: 1, status: "sent" }),
          proposal({ id: 2, status: "accepted" }),
          proposal({ id: 3, status: "rejected" }),
          proposal({ id: 4, status: "sent" }),
          proposal({ id: 5, status: "accepted" }),
          proposal({ id: 6, status: "rejected" }),
          proposal({ id: 7, status: "sent" }),
          proposal({ id: 8, status: "accepted" }),
          proposal({ id: 9, status: "rejected" }),
          proposal({ id: 10, status: "sent" }),
        ],
        "2026-05-15",
      )[0],
    ).toEqual(
      expect.objectContaining({
        revenueProgress: 999,
        sentProposalsProgress: 999,
      }),
    );
  });

  it("filters goal progress by sales, period, and current-month activity dates", () => {
    const result = calculateGoalProgress(
      [sale(1, "Ana"), sale(2, "Bruno")],
      [
        salesGoal({ id: 1, sales_id: 1 }),
        salesGoal({
          id: 2,
          sales_id: 1,
          period_start: "2026-04-01",
          revenue_goal: 1,
          won_deals_goal: 1,
          sent_proposals_goal: 1,
        }),
        salesGoal({
          id: 3,
          sales_id: 2,
          revenue_goal: 300000,
          won_deals_goal: 3,
          sent_proposals_goal: 4,
        }),
      ],
      [
        deal({ id: 1, stage: "won", amount: 100000, sales_id: 1 }),
        deal({
          id: 2,
          stage: "won",
          amount: 900000,
          sales_id: 1,
          updated_at: "2026-04-30T00:00:00.000Z",
        }),
        deal({ id: 3, stage: "won", amount: 300000, sales_id: 2 }),
      ],
      [
        proposal({ id: 1, status: "sent", sales_id: 1 }),
        proposal({
          id: 2,
          status: "accepted",
          sales_id: 1,
          sent_at: "2026-04-30T00:00:00.000Z",
          updated_at: "2026-05-02T00:00:00.000Z",
        }),
        proposal({
          id: 3,
          status: "rejected",
          sales_id: 1,
          sent_at: "2026-04-30T00:00:00.000Z",
          updated_at: "2026-04-30T00:00:00.000Z",
        }),
        proposal({ id: 4, status: "accepted", sales_id: 2 }),
        proposal({ id: 5, status: "draft", sales_id: 1 }),
      ],
      "2026-05-15",
    );

    expect(result).toEqual([
      expect.objectContaining({
        salesId: 1,
        revenueGoal: 200000,
        revenueActual: 100000,
        revenueProgress: 50,
        wonDealsActual: 1,
        sentProposalsActual: 2,
        sentProposalsProgress: 67,
      }),
      expect.objectContaining({
        salesId: 2,
        revenueGoal: 300000,
        revenueActual: 300000,
        revenueProgress: 100,
        wonDealsActual: 1,
        wonDealsProgress: 33,
        sentProposalsActual: 1,
        sentProposalsProgress: 25,
      }),
    ]);
  });

  it("calculates revenue forecast from open deals and sent proposals", () => {
    expect(
      calculateRevenueForecast(
        [
          deal({ id: 1, amount: 100000, probability: 40 }),
          deal({ id: 2, amount: 900000, probability: 90, stage: "won" }),
          deal({ id: 3, amount: 800000, probability: 80, stage: "lost" }),
        ],
        [
          proposal({ id: 1, total: 200000, status: "sent" }),
          proposal({ id: 2, total: 300000, status: "accepted" }),
          proposal({ id: 3, total: 400000, status: "draft" }),
        ],
      ),
    ).toEqual({
      dealWeightedAmount: 40000,
      proposalOpenAmount: 200000,
      forecastAmount: 240000,
    });
  });

  it("calculates funnel conversion", () => {
    expect(
      calculateFunnelConversion(
        [lead(1, "new"), lead(2, "converted")],
        [deal({ id: 1 }), deal({ id: 2, stage: "won" })],
        [
          proposal({ id: 1, deal_id: 1, status: "accepted" }),
          proposal({ id: 2, deal_id: 2, status: "sent" }),
        ],
      ),
    ).toEqual({
      leads: 2,
      convertedLeads: 1,
      leadToDealRate: 50,
      deals: 2,
      dealsWithProposal: 2,
      dealToProposalRate: 100,
      proposalsAccepted: 1,
      proposalAcceptanceRate: 50,
      wonDeals: 1,
      dealWinRate: 50,
    });
  });

  it("counts deals with proposal only when the deal is present", () => {
    expect(
      calculateFunnelConversion(
        [lead(1, "converted")],
        [deal({ id: 1 })],
        [
          proposal({ id: 1, deal_id: 1, status: "sent" }),
          proposal({ id: 2, deal_id: 999, status: "sent" }),
        ],
      ),
    ).toEqual(
      expect.objectContaining({
        deals: 1,
        dealsWithProposal: 1,
        dealToProposalRate: 100,
      }),
    );
  });

  it("deduplicates deals with proposal across numeric and string identifiers", () => {
    expect(
      calculateFunnelConversion(
        [lead(1, "converted")],
        [deal({ id: 1 })],
        [
          proposal({ id: 1, deal_id: 1, status: "sent" }),
          proposal({ id: 2, deal_id: "1", status: "sent" }),
        ],
      ),
    ).toEqual(
      expect.objectContaining({
        deals: 1,
        dealsWithProposal: 1,
        dealToProposalRate: 100,
      }),
    );
  });

  it("calculates pipeline aging for open deals and sent proposals", () => {
    expect(
      calculatePipelineAging(
        [
          deal({
            id: 1,
            created_at: "2026-05-01T00:00:00.000Z",
            last_activity_at: "2026-05-13T00:00:00.000Z",
          }),
          deal({
            id: 2,
            created_at: "2026-05-18T00:00:00.000Z",
            last_activity_at: "2026-05-19T00:00:00.000Z",
          }),
          deal({
            id: 3,
            stage: "won",
            created_at: "2026-04-01T00:00:00.000Z",
            last_activity_at: "2026-04-01T00:00:00.000Z",
          }),
        ],
        [
          proposal({
            id: 1,
            status: "sent",
            sent_at: "2026-05-10T00:00:00.000Z",
          }),
          proposal({
            id: 2,
            status: "sent",
            sent_at: "2026-05-17T00:00:00.000Z",
          }),
          proposal({
            id: 3,
            status: "accepted",
            sent_at: "2026-04-01T00:00:00.000Z",
          }),
        ],
        new Date("2026-05-20T00:00:00.000Z"),
      ),
    ).toEqual({
      averageOpenDealAgeDays: 11,
      staleDeals: 1,
      averageSentProposalAgeDays: 7,
    });
  });

  it("counts open deals without last activity as stale", () => {
    expect(
      calculatePipelineAging(
        [
          deal({ id: 1, last_activity_at: null }),
          deal({ id: 2, last_activity_at: "2026-05-14T00:00:00.000Z" }),
          deal({ id: 3, last_activity_at: "2026-05-13T00:00:00.000Z" }),
          deal({ id: 4, stage: "lost", last_activity_at: null }),
        ],
        [],
        new Date("2026-05-20T00:00:00.000Z"),
      ),
    ).toEqual(
      expect.objectContaining({
        staleDeals: 2,
      }),
    );
  });

  it("calculates seller ranking metrics and sorting", () => {
    const tasks = [
      {
        id: 1,
        text: "Vencida",
        type: "follow-up",
        due_date: "2026-05-10T00:00:00.000Z",
        done_date: null,
        sales_id: 1,
      } satisfies Task,
      {
        id: 2,
        text: "Concluida",
        type: "follow-up",
        due_date: "2026-05-10T00:00:00.000Z",
        done_date: "2026-05-11T00:00:00.000Z",
        sales_id: 1,
      } satisfies Task,
      {
        id: 3,
        text: "Futura",
        type: "follow-up",
        due_date: "2026-05-21T00:00:00.000Z",
        done_date: null,
        sales_id: 2,
      } satisfies Task,
      {
        id: 4,
        text: "Sem prazo",
        type: "follow-up",
        due_date: null as unknown as string,
        done_date: null,
        sales_id: 1,
      } satisfies Task,
    ];

    expect(
      calculateSellerRanking(
        [sale(1, "Ana"), sale(2, "Bruno"), sale(3, "Clara")],
        [
          deal({ id: 1, sales_id: 1, stage: "won", amount: 100000 }),
          deal({
            id: 2,
            sales_id: 1,
            stage: "proposal-sent",
            amount: 50000,
            probability: 40,
          }),
          deal({
            id: 3,
            sales_id: 2,
            stage: "won",
            amount: 100000,
            probability: 20,
          }),
          deal({
            id: 4,
            sales_id: 2,
            stage: "qualified",
            amount: 120000,
            probability: 50,
          }),
          deal({
            id: 5,
            sales_id: 3,
            stage: "qualified",
            amount: 1000000,
            probability: 90,
          }),
        ],
        [
          proposal({ id: 1, sales_id: 1, status: "accepted" }),
          proposal({ id: 2, sales_id: 1, status: "sent" }),
          proposal({ id: 3, sales_id: 1, status: "draft" }),
          proposal({ id: 4, sales_id: 2, status: "rejected" }),
        ],
        tasks,
        new Date("2026-05-20T00:00:00.000Z"),
      ),
    ).toEqual([
      expect.objectContaining({
        salesId: 2,
        wonAmount: 100000,
        openAmount: 120000,
        weightedAmount: 60000,
        sentProposals: 1,
        acceptedProposals: 0,
        overdueTasks: 0,
      }),
      expect.objectContaining({
        salesId: 1,
        wonAmount: 100000,
        openAmount: 50000,
        weightedAmount: 20000,
        sentProposals: 2,
        acceptedProposals: 1,
        overdueTasks: 1,
      }),
      expect.objectContaining({
        salesId: 3,
        wonAmount: 0,
        openAmount: 1000000,
        weightedAmount: 900000,
        sentProposals: 0,
        acceptedProposals: 0,
        overdueTasks: 0,
      }),
    ]);
  });

  it("groups loss reasons by amount and ignores irrelevant deals", () => {
    expect(
      calculateLossReasons([
        deal({ id: 1, stage: "lost", lost_reason: "price", amount: 50000 }),
        deal({ id: 2, stage: "lost", lost_reason: "price", amount: 100000 }),
        deal({ id: 3, stage: "lost", lost_reason: "timing", amount: 200000 }),
        deal({ id: 4, stage: "lost", lost_reason: null, amount: 900000 }),
        deal({ id: 5, stage: "won", lost_reason: "price", amount: 800000 }),
      ]),
    ).toEqual([
      { reason: "timing", count: 1, amount: 200000 },
      { reason: "price", count: 2, amount: 150000 },
    ]);
  });
});
