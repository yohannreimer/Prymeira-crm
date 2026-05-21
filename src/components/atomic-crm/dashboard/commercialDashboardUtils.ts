import type { Deal, Lead, LeadStatus, Proposal, Sale } from "../types";
import { getWeightedAmount } from "../deals/dealCommercialUtils";

const OPEN_LEAD_STATUSES = new Set<LeadStatus>([
  "new",
  "contacted",
  "qualified",
]);
const CLOSED_DEAL_STAGES = new Set(["won", "lost"]);

export type LeadSummary = {
  total: number;
  open: number;
  hot: number;
  missingNextAction: number;
  converted: number;
  conversionRate: number;
  byStatus: Record<LeadStatus, number>;
};

export type DealStageSummary = {
  stage: string;
  count: number;
  amount: number;
  weightedAmount: number;
};

export type LostReasonSummary = {
  reason: string;
  count: number;
  amount: number;
};

export type SalesRankingItem = {
  salesId: Sale["id"];
  name: string;
  openDeals: number;
  openAmount: number;
  weightedAmount: number;
};

export type ProposalSummary = {
  openCount: number;
  openAmount: number;
  acceptedCount: number;
  acceptedAmount: number;
  expiredCount: number;
  expiredAmount: number;
  acceptanceRate: number;
};

export const summarizeLeads = (leads: readonly Lead[]): LeadSummary => {
  const summary: LeadSummary = {
    total: leads.length,
    open: 0,
    hot: 0,
    missingNextAction: 0,
    converted: 0,
    conversionRate: 0,
    byStatus: {
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      discarded: 0,
    },
  };

  for (const lead of leads) {
    summary.byStatus[lead.status] += 1;
    if (OPEN_LEAD_STATUSES.has(lead.status)) {
      summary.open += 1;
      if (!lead.next_action_at) summary.missingNextAction += 1;
    }
    if (lead.temperature === "hot") summary.hot += 1;
    if (lead.status === "converted") summary.converted += 1;
  }

  summary.conversionRate =
    summary.total === 0
      ? 0
      : Math.round((summary.converted / summary.total) * 100);

  return summary;
};

export const summarizeDealsByStage = (
  deals: readonly Deal[],
): DealStageSummary[] => {
  const byStage = new Map<string, DealStageSummary>();

  for (const deal of deals) {
    const current = byStage.get(deal.stage) ?? {
      stage: deal.stage,
      count: 0,
      amount: 0,
      weightedAmount: 0,
    };
    current.count += 1;
    current.amount += deal.amount;
    current.weightedAmount += getWeightedAmount(deal);
    byStage.set(deal.stage, current);
  }

  return [...byStage.values()];
};

export const summarizeLostReasons = (
  deals: readonly Deal[],
): LostReasonSummary[] => {
  const byReason = new Map<string, LostReasonSummary>();

  for (const deal of deals) {
    if (deal.stage !== "lost" || !deal.lost_reason) continue;

    const current = byReason.get(deal.lost_reason) ?? {
      reason: deal.lost_reason,
      count: 0,
      amount: 0,
    };
    current.count += 1;
    current.amount += deal.amount;
    byReason.set(deal.lost_reason, current);
  }

  return [...byReason.values()].sort((a, b) => b.count - a.count);
};

export const rankSalesByDeals = (
  sales: readonly Sale[],
  deals: readonly Deal[],
): SalesRankingItem[] => {
  const bySales = new Map<Sale["id"], SalesRankingItem>();

  for (const sale of sales) {
    bySales.set(sale.id, {
      salesId: sale.id,
      name: [sale.first_name, sale.last_name].filter(Boolean).join(" "),
      openDeals: 0,
      openAmount: 0,
      weightedAmount: 0,
    });
  }

  for (const deal of deals) {
    if (CLOSED_DEAL_STAGES.has(deal.stage)) continue;
    const current = bySales.get(deal.sales_id);
    if (!current) continue;
    current.openDeals += 1;
    current.openAmount += deal.amount;
    current.weightedAmount += getWeightedAmount(deal);
  }

  return [...bySales.values()]
    .filter((item) => item.openDeals > 0)
    .sort((a, b) => b.openDeals - a.openDeals || b.openAmount - a.openAmount);
};

export const summarizeProposals = (
  proposals: readonly Proposal[],
  now = new Date(),
): ProposalSummary => {
  const summary: ProposalSummary = {
    openCount: 0,
    openAmount: 0,
    acceptedCount: 0,
    acceptedAmount: 0,
    expiredCount: 0,
    expiredAmount: 0,
    acceptanceRate: 0,
  };

  for (const proposal of proposals) {
    const isExpired =
      proposal.status === "expired" ||
      (proposal.status === "sent" &&
        proposal.valid_until &&
        new Date(`${proposal.valid_until}T23:59:59.999`) < now);

    if (proposal.status === "sent") {
      summary.openCount += 1;
      summary.openAmount += proposal.total;
    }

    if (isExpired) {
      summary.expiredCount += 1;
      summary.expiredAmount += proposal.total;
    }

    if (proposal.status === "accepted") {
      summary.acceptedCount += 1;
      summary.acceptedAmount += proposal.total;
    }
  }

  const decided = proposals.filter((proposal) =>
    ["accepted", "rejected"].includes(proposal.status),
  ).length;
  summary.acceptanceRate =
    decided === 0 ? 0 : Math.round((summary.acceptedCount / decided) * 100);

  return summary;
};
