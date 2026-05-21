import type { Deal, Lead, Proposal, Sale, SalesGoal, Task } from "../types";
import { getWeightedAmount } from "../deals/dealCommercialUtils";

const CLOSED_DEAL_STAGES = new Set(["won", "lost"]);
const DAY_MS = 1000 * 60 * 60 * 24;

const getSellerName = (sale: Sale) =>
  [sale.first_name, sale.last_name].filter(Boolean).join(" ");

const sameMonth = (date: string | null | undefined, periodStart: string) =>
  Boolean(date?.startsWith(periodStart.slice(0, 7)));

const percentage = (value: number, goal: number) =>
  goal <= 0 ? 0 : Math.min(999, Math.round((value / goal) * 100));

const ageInDays = (date: string, now: Date) =>
  Math.max(0, Math.floor((now.getTime() - new Date(date).getTime()) / DAY_MS));

const average = (values: number[]) =>
  values.length === 0
    ? 0
    : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

export const calculateGoalProgress = (
  sales: readonly Sale[],
  goals: readonly SalesGoal[],
  deals: readonly Deal[],
  proposals: readonly Proposal[],
  nowIso: string,
) => {
  const periodStart = `${nowIso.slice(0, 7)}-01`;

  return sales.map((sale) => {
    const goal = goals.find(
      (candidate) =>
        String(candidate.sales_id) === String(sale.id) &&
        candidate.period_start === periodStart,
    );
    const sellerWonDeals = deals.filter(
      (deal) =>
        String(deal.sales_id) === String(sale.id) &&
        deal.stage === "won" &&
        sameMonth(deal.updated_at, periodStart),
    );
    const sellerSentProposals = proposals.filter(
      (proposal) =>
        String(proposal.sales_id) === String(sale.id) &&
        ["sent", "accepted", "rejected"].includes(proposal.status) &&
        (sameMonth(proposal.sent_at, periodStart) ||
          sameMonth(proposal.updated_at, periodStart)),
    );
    const wonAmount = sellerWonDeals.reduce(
      (sum, deal) => sum + deal.amount,
      0,
    );

    return {
      salesId: sale.id,
      name: getSellerName(sale),
      revenueGoal: goal?.revenue_goal ?? 0,
      revenueActual: wonAmount,
      revenueProgress: percentage(wonAmount, goal?.revenue_goal ?? 0),
      wonDealsGoal: goal?.won_deals_goal ?? 0,
      wonDealsActual: sellerWonDeals.length,
      wonDealsProgress: percentage(
        sellerWonDeals.length,
        goal?.won_deals_goal ?? 0,
      ),
      sentProposalsGoal: goal?.sent_proposals_goal ?? 0,
      sentProposalsActual: sellerSentProposals.length,
      sentProposalsProgress: percentage(
        sellerSentProposals.length,
        goal?.sent_proposals_goal ?? 0,
      ),
    };
  });
};

export const calculateRevenueForecast = (
  deals: readonly Deal[],
  proposals: readonly Proposal[],
) => {
  const dealWeightedAmount = deals
    .filter((deal) => !CLOSED_DEAL_STAGES.has(deal.stage))
    .reduce((sum, deal) => sum + getWeightedAmount(deal), 0);
  const proposalOpenAmount = proposals
    .filter((proposal) => proposal.status === "sent")
    .reduce((sum, proposal) => sum + proposal.total, 0);

  return {
    dealWeightedAmount,
    proposalOpenAmount,
    forecastAmount: dealWeightedAmount + proposalOpenAmount,
  };
};

export const calculateFunnelConversion = (
  leads: readonly Lead[],
  deals: readonly Deal[],
  proposals: readonly Proposal[],
) => {
  const convertedLeads = leads.filter(
    (lead) => lead.status === "converted",
  ).length;
  const dealIds = new Set(deals.map((deal) => String(deal.id)));
  const dealsWithProposal = new Set(
    proposals
      .filter((proposal) => dealIds.has(String(proposal.deal_id)))
      .map((proposal) => String(proposal.deal_id)),
  );
  const proposalsAccepted = proposals.filter(
    (proposal) => proposal.status === "accepted",
  ).length;
  const wonDeals = deals.filter((deal) => deal.stage === "won").length;

  return {
    leads: leads.length,
    convertedLeads,
    leadToDealRate: percentage(convertedLeads, leads.length),
    deals: deals.length,
    dealsWithProposal: dealsWithProposal.size,
    dealToProposalRate: percentage(dealsWithProposal.size, deals.length),
    proposalsAccepted,
    proposalAcceptanceRate: percentage(proposalsAccepted, proposals.length),
    wonDeals,
    dealWinRate: percentage(wonDeals, deals.length),
  };
};

export const calculatePipelineAging = (
  deals: readonly Deal[],
  proposals: readonly Proposal[],
  now = new Date(),
) => {
  const openDealAges = deals
    .filter((deal) => !CLOSED_DEAL_STAGES.has(deal.stage))
    .map((deal) => ageInDays(deal.created_at, now));
  const staleDeals = deals.filter(
    (deal) =>
      !CLOSED_DEAL_STAGES.has(deal.stage) &&
      (!deal.last_activity_at || ageInDays(deal.last_activity_at, now) >= 7),
  ).length;
  const sentProposalAges = proposals
    .filter((proposal) => proposal.status === "sent" && proposal.sent_at)
    .map((proposal) => ageInDays(proposal.sent_at as string, now));

  return {
    averageOpenDealAgeDays: average(openDealAges),
    staleDeals,
    averageSentProposalAgeDays: average(sentProposalAges),
  };
};

export const calculateSellerRanking = (
  sales: readonly Sale[],
  deals: readonly Deal[],
  proposals: readonly Proposal[],
  tasks: readonly Task[],
  now = new Date(),
) =>
  sales
    .map((sale) => {
      const sellerDeals = deals.filter(
        (deal) => String(deal.sales_id) === String(sale.id),
      );
      const sellerProposals = proposals.filter(
        (proposal) => String(proposal.sales_id) === String(sale.id),
      );
      const wonAmount = sellerDeals
        .filter((deal) => deal.stage === "won")
        .reduce((sum, deal) => sum + deal.amount, 0);
      const openAmount = sellerDeals
        .filter((deal) => !CLOSED_DEAL_STAGES.has(deal.stage))
        .reduce((sum, deal) => sum + deal.amount, 0);
      const weightedAmount = sellerDeals
        .filter((deal) => !CLOSED_DEAL_STAGES.has(deal.stage))
        .reduce((sum, deal) => sum + getWeightedAmount(deal), 0);
      const overdueTasks = tasks.filter(
        (task) =>
          String(task.sales_id) === String(sale.id) &&
          !task.done_date &&
          task.due_date &&
          new Date(task.due_date) < now,
      ).length;

      return {
        salesId: sale.id,
        name: getSellerName(sale),
        wonAmount,
        openAmount,
        weightedAmount,
        sentProposals: sellerProposals.filter((proposal) =>
          ["sent", "accepted", "rejected"].includes(proposal.status),
        ).length,
        acceptedProposals: sellerProposals.filter(
          (proposal) => proposal.status === "accepted",
        ).length,
        overdueTasks,
      };
    })
    .sort(
      (a, b) =>
        b.wonAmount - a.wonAmount || b.weightedAmount - a.weightedAmount,
    );

export const calculateLossReasons = (deals: readonly Deal[]) => {
  const byReason = new Map<
    string,
    { reason: string; count: number; amount: number }
  >();

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

  return [...byReason.values()].sort((a, b) => b.amount - a.amount);
};
