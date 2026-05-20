import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Deal } from "../types";
import {
  getDealRiskState,
  getWeightedAmount,
  isDealMissingNextAction,
  isDealStale,
  summarizeDeals,
} from "./dealCommercialUtils";

type TestDeal = Deal & {
  deal_type: string;
  probability: number | null;
  source: string;
  lost_reason: string | null;
  next_action_at: string | null;
  last_activity_at: string | null;
};

const baseDeal = (overrides: Partial<TestDeal> = {}): TestDeal => ({
  id: 1,
  name: "Website redesign",
  company_id: 1,
  contact_ids: [1],
  category: "website-design",
  stage: "proposal-sent",
  description: "Project scope",
  amount: 10000,
  created_at: "2026-05-01T10:00:00.000Z",
  updated_at: "2026-05-01T10:00:00.000Z",
  expected_closing_date: "2026-06-01",
  sales_id: 1,
  index: 0,
  deal_type: "consultative",
  probability: 40,
  source: "referral",
  lost_reason: null,
  next_action_at: "2026-05-19T13:00:00.000Z",
  last_activity_at: "2026-05-18T13:00:00.000Z",
  ...overrides,
});

describe("dealCommercialUtils", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-05-19T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("computes weighted amount from amount and probability", () => {
    expect(
      getWeightedAmount(baseDeal({ amount: 10000, probability: 25 })),
    ).toBe(2500);
  });

  it("treats missing probability as zero weighted amount", () => {
    expect(getWeightedAmount(baseDeal({ probability: null }))).toBe(0);
  });

  it("detects deals missing a next action", () => {
    expect(isDealMissingNextAction(baseDeal({ next_action_at: null }))).toBe(
      true,
    );
    expect(isDealMissingNextAction(baseDeal())).toBe(false);
  });

  it("detects deals stale for at least the configured number of days", () => {
    expect(
      isDealStale(
        baseDeal({ last_activity_at: "2026-05-15T12:00:00.000Z" }),
        3,
      ),
    ).toBe(true);
    expect(
      isDealStale(
        baseDeal({ last_activity_at: "2026-05-18T12:00:00.000Z" }),
        3,
      ),
    ).toBe(false);
  });

  it("classifies missing next action before stale state", () => {
    expect(
      getDealRiskState(
        baseDeal({
          next_action_at: null,
          last_activity_at: "2026-05-10T12:00:00.000Z",
        }),
      ),
    ).toBe("missing_next_action");
  });

  it("summarizes open deals for manager dashboard", () => {
    const summary = summarizeDeals([
      baseDeal({
        id: 1,
        amount: 10000,
        probability: 50,
        stage: "proposal-sent",
      }),
      baseDeal({ id: 2, amount: 20000, probability: 25, stage: "won" }),
      baseDeal({ id: 3, amount: 30000, probability: 10, stage: "lost" }),
    ]);

    expect(summary.openCount).toBe(1);
    expect(summary.openAmount).toBe(10000);
    expect(summary.weightedOpenAmount).toBe(5000);
    expect(summary.wonAmount).toBe(20000);
    expect(summary.lostAmount).toBe(30000);
  });
});
