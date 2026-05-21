import { useMemo } from "react";
import { useGetIdentity, useGetList, useTranslate } from "ra-core";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { Deal, Lead, Proposal, Task } from "../types";
import { AgendaItem } from "./AgendaItem";
import { buildAgendaSections, type AgendaSections } from "./agendaUtils";

const PAGE_SIZE = 1000;
const OPEN_LEAD_STATUSES = "(new,contacted,qualified)";
const OPEN_DEAL_STAGES = "(new,opportunity,proposal-sent,negotiation)";

export const AgendaList = () => {
  const translate = useTranslate();
  const { identity } = useGetIdentity();
  const enabled = identity?.id != null;
  const filter = enabled ? { sales_id: identity.id } : {};

  const { data: tasks, isPending: isTasksPending } = useGetList<Task>(
    "tasks",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      sort: { field: "due_date", order: "ASC" },
      filter: {
        ...filter,
        "done_date@is": null,
      },
    },
    { enabled },
  );

  const { data: leads, isPending: isLeadsPending } = useGetList<Lead>(
    "leads",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      sort: { field: "updated_at", order: "DESC" },
      filter: {
        ...filter,
        "status@in": OPEN_LEAD_STATUSES,
      },
    },
    { enabled },
  );

  const { data: deals, isPending: isDealsPending } = useGetList<Deal>(
    "deals",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      sort: { field: "updated_at", order: "DESC" },
      filter: {
        ...filter,
        "archived_at@is": null,
        "stage@in": OPEN_DEAL_STAGES,
      },
    },
    { enabled },
  );

  const { data: proposals, isPending: isProposalsPending } =
    useGetList<Proposal>(
      "proposals",
      {
        pagination: { page: 1, perPage: PAGE_SIZE },
        sort: { field: "valid_until", order: "ASC" },
        filter: {
          ...filter,
          status: "sent",
        },
      },
      { enabled },
    );

  const sections = useMemo(
    () =>
      buildAgendaSections({
        tasks: tasks ?? [],
        leads: leads ?? [],
        deals: deals ?? [],
        proposals: proposals ?? [],
      }),
    [deals, leads, proposals, tasks],
  );

  if (!enabled) return null;

  const isPending =
    isTasksPending || isLeadsPending || isDealsPending || isProposalsPending;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Hoje
        </p>
        <h1 className="text-[18px] font-bold text-foreground leading-tight">
          {translate("resources.agenda.name", { smart_count: 1 })}
        </h1>
      </div>
      {isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <AgendaSection
            title={translate("resources.agenda.sections.overdue")}
            items={sections.overdue}
            sectionKey="overdue"
          />
          <AgendaSection
            title={translate("resources.agenda.sections.today")}
            items={sections.today}
            sectionKey="today"
          />
          <AgendaSection
            title={translate("resources.agenda.sections.risks")}
            items={sections.risks}
            sectionKey="risks"
          />
          <AgendaSection
            title={translate("resources.agenda.sections.upcoming")}
            items={sections.upcoming}
            sectionKey="upcoming"
          />
        </div>
      )}
    </div>
  );
};

const SECTION_STYLES: Record<string, { header: string; dot: string }> = {
  overdue: {
    header: "bg-destructive/8 border-destructive/20",
    dot: "bg-destructive",
  },
  today: {
    header: "bg-primary/8 border-primary/20",
    dot: "bg-primary",
  },
  risks: {
    header:
      "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  upcoming: {
    header: "bg-muted/50 border-border",
    dot: "bg-muted-foreground",
  },
};

const AgendaSection = ({
  title,
  items,
  sectionKey,
}: {
  title: string;
  items: AgendaSections[keyof AgendaSections];
  sectionKey: keyof typeof SECTION_STYLES;
}) => {
  const translate = useTranslate();
  const styles = SECTION_STYLES[sectionKey];

  return (
    <Card className="overflow-hidden py-0">
      <div
        className={`flex items-center justify-between border-b px-4 py-2.5 ${styles.header}`}
      >
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-foreground/70">
            {title}
          </h2>
        </div>
        <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
          {items.length}
        </span>
      </div>
      <div className="divide-y divide-border/40">
        {items.length ? (
          items.map((item) => <AgendaItem key={item.id} item={item} />)
        ) : (
          <div className="px-4 py-5 text-[12px] text-muted-foreground">
            {translate("resources.agenda.empty")}
          </div>
        )}
      </div>
    </Card>
  );
};
