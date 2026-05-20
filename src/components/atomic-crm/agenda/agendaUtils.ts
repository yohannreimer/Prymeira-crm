import type { Deal, Lead, Proposal, Task } from "../types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const STALE_AFTER_DAYS = 3;
const CLOSED_DEAL_STAGES = new Set(["won", "lost"]);

export type AgendaItemKind = "task" | "lead" | "deal" | "proposal";
export type AgendaItemState =
  | "overdue"
  | "today"
  | "upcoming"
  | "missing-next-action"
  | "stale";

export type AgendaItem = {
  id: string;
  kind: AgendaItemKind;
  recordId: Task["id"] | Lead["id"] | Deal["id"] | Proposal["id"];
  title: string;
  context?: string | null;
  dueAt?: string | null;
  salesId?:
    | Task["sales_id"]
    | Lead["sales_id"]
    | Deal["sales_id"]
    | Proposal["sales_id"];
  state: AgendaItemState;
  href: string;
};

export type AgendaSections = {
  overdue: AgendaItem[];
  today: AgendaItem[];
  risks: AgendaItem[];
  upcoming: AgendaItem[];
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const compareDueAt = (a: AgendaItem, b: AgendaItem) => {
  if (!a.dueAt && !b.dueAt) return 0;
  if (!a.dueAt) return 1;
  if (!b.dueAt) return -1;
  return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
};

const classifyDatedItem = (
  dueAt: string,
  todayStart: Date,
  tomorrowStart: Date,
): "overdue" | "today" | "upcoming" => {
  const dueDate = new Date(dueAt);
  if (dueDate < todayStart) return "overdue";
  if (dueDate < tomorrowStart) return "today";
  return "upcoming";
};

const buildTaskItem = (
  task: Task,
  todayStart: Date,
  tomorrowStart: Date,
): AgendaItem | null => {
  if (task.done_date || !task.due_date) return null;

  const state = classifyDatedItem(task.due_date, todayStart, tomorrowStart);
  return {
    id: `task-${task.id}`,
    kind: "task",
    recordId: task.id,
    title: task.text,
    context: task.type === "none" ? null : task.type,
    dueAt: task.due_date,
    salesId: task.sales_id,
    state,
    href:
      task.contact_id != null
        ? `/contacts/${task.contact_id}/show`
        : task.lead_id != null
          ? `/leads/${task.lead_id}/show`
          : task.deal_id != null
            ? `/deals/${task.deal_id}/show`
            : "/tasks",
  };
};

const buildLeadItem = (
  lead: Lead,
  todayStart: Date,
  tomorrowStart: Date,
): AgendaItem | null => {
  if (lead.status === "converted" || lead.status === "discarded") return null;
  const title = [lead.first_name, lead.last_name].filter(Boolean).join(" ");

  if (!lead.next_action_at) {
    return {
      id: `lead-${lead.id}`,
      kind: "lead",
      recordId: lead.id,
      title,
      context: lead.company_name ?? lead.interest,
      dueAt: null,
      salesId: lead.sales_id,
      state: "missing-next-action",
      href: `/leads/${lead.id}/show`,
    };
  }

  const state = classifyDatedItem(
    lead.next_action_at,
    todayStart,
    tomorrowStart,
  );
  return {
    id: `lead-${lead.id}`,
    kind: "lead",
    recordId: lead.id,
    title,
    context: lead.company_name ?? lead.interest,
    dueAt: lead.next_action_at,
    salesId: lead.sales_id,
    state,
    href: `/leads/${lead.id}/show`,
  };
};

const buildDealItem = (
  deal: Deal,
  todayStart: Date,
  tomorrowStart: Date,
  staleCutoff: Date,
): AgendaItem | null => {
  if (deal.archived_at || CLOSED_DEAL_STAGES.has(deal.stage)) return null;

  if (!deal.next_action_at) {
    return {
      id: `deal-${deal.id}`,
      kind: "deal",
      recordId: deal.id,
      title: deal.name,
      context: deal.stage,
      dueAt: null,
      salesId: deal.sales_id,
      state: "missing-next-action",
      href: `/deals/${deal.id}/show`,
    };
  }

  const lastActivityAt = deal.last_activity_at
    ? new Date(deal.last_activity_at)
    : null;
  if (lastActivityAt && lastActivityAt < staleCutoff) {
    return {
      id: `deal-${deal.id}`,
      kind: "deal",
      recordId: deal.id,
      title: deal.name,
      context: deal.stage,
      dueAt: deal.next_action_at,
      salesId: deal.sales_id,
      state: "stale",
      href: `/deals/${deal.id}/show`,
    };
  }

  const state = classifyDatedItem(
    deal.next_action_at,
    todayStart,
    tomorrowStart,
  );
  return {
    id: `deal-${deal.id}`,
    kind: "deal",
    recordId: deal.id,
    title: deal.name,
    context: deal.stage,
    dueAt: deal.next_action_at,
    salesId: deal.sales_id,
    state,
    href: `/deals/${deal.id}/show`,
  };
};

const buildProposalItem = (
  proposal: Proposal,
  now: Date,
): AgendaItem | null => {
  if (proposal.status !== "sent" || !proposal.valid_until) return null;
  const validUntil = new Date(`${proposal.valid_until}T23:59:59.999`);
  if (validUntil >= now) return null;

  return {
    id: `proposal-${proposal.id}`,
    kind: "proposal",
    recordId: proposal.id,
    title: proposal.title,
    context: proposal.number,
    dueAt: `${proposal.valid_until}T23:59:59.999`,
    salesId: proposal.sales_id ?? undefined,
    state: "stale",
    href: `/proposals/${proposal.id}/show`,
  };
};

export const buildAgendaSections = (
  {
    tasks,
    leads,
    deals,
    proposals = [],
  }: {
    tasks: Task[];
    leads: Lead[];
    deals: Deal[];
    proposals?: Proposal[];
  },
  now = new Date(),
): AgendaSections => {
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const staleCutoff = new Date(now.getTime() - STALE_AFTER_DAYS * MS_PER_DAY);
  const sections: AgendaSections = {
    overdue: [],
    today: [],
    risks: [],
    upcoming: [],
  };

  const items = [
    ...tasks
      .map((task) => buildTaskItem(task, todayStart, tomorrowStart))
      .filter((item): item is AgendaItem => Boolean(item)),
    ...leads
      .map((lead) => buildLeadItem(lead, todayStart, tomorrowStart))
      .filter((item): item is AgendaItem => Boolean(item)),
    ...deals
      .map((deal) =>
        buildDealItem(deal, todayStart, tomorrowStart, staleCutoff),
      )
      .filter((item): item is AgendaItem => Boolean(item)),
    ...proposals
      .map((proposal) => buildProposalItem(proposal, now))
      .filter((item): item is AgendaItem => Boolean(item)),
  ];

  for (const item of items) {
    if (item.state === "overdue") sections.overdue.push(item);
    if (item.state === "today") sections.today.push(item);
    if (item.state === "upcoming") sections.upcoming.push(item);
    if (item.state === "missing-next-action" || item.state === "stale") {
      sections.risks.push(item);
    }
  }

  sections.overdue.sort(compareDueAt);
  sections.today.sort(compareDueAt);
  sections.risks.sort(compareDueAt);
  sections.upcoming.sort(compareDueAt);

  return sections;
};
