import type { Deal } from "../types";

type CommercialDeal = Deal & {
  probability?: number | null;
  next_action_at?: string | null;
  last_activity_at?: string | null;
};

export type DealRiskState = "healthy" | "missing_next_action" | "stale";

export type DealSummary = {
  openCount: number;
  openAmount: number;
  weightedOpenAmount: number;
  wonAmount: number;
  lostAmount: number;
};

const CLOSED_STAGES = new Set(["won", "lost"]);
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function isDealClosed(deal: Deal) {
  return CLOSED_STAGES.has(deal.stage);
}

export function getWeightedAmount(deal: CommercialDeal) {
  if (deal.probability == null) {
    return 0;
  }

  return Math.round((deal.amount * deal.probability) / 100);
}

export function isDealMissingNextAction(deal: CommercialDeal) {
  return !isDealClosed(deal) && !deal.next_action_at;
}

export function isDealStale(deal: CommercialDeal, staleAfterDays = 3) {
  if (isDealClosed(deal)) {
    return false;
  }

  if (!deal.last_activity_at) {
    return true;
  }

  const lastActivityAt = new Date(deal.last_activity_at).getTime();

  return Date.now() - lastActivityAt >= staleAfterDays * MS_PER_DAY;
}

export function getDealRiskState(deal: CommercialDeal): DealRiskState {
  if (isDealMissingNextAction(deal)) {
    return "missing_next_action";
  }

  if (isDealStale(deal)) {
    return "stale";
  }

  return "healthy";
}

export function summarizeDeals(deals: readonly CommercialDeal[]): DealSummary {
  return deals.reduce<DealSummary>(
    (summary, deal) => {
      if (deal.stage === "won") {
        summary.wonAmount += deal.amount;
        return summary;
      }

      if (deal.stage === "lost") {
        summary.lostAmount += deal.amount;
        return summary;
      }

      summary.openCount += 1;
      summary.openAmount += deal.amount;
      summary.weightedOpenAmount += getWeightedAmount(deal);

      return summary;
    },
    {
      openCount: 0,
      openAmount: 0,
      weightedOpenAmount: 0,
      wonAmount: 0,
      lostAmount: 0,
    },
  );
}
