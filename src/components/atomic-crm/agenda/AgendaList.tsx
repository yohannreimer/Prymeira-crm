import { CalendarDays } from "lucide-react";
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
      <div className="flex items-center gap-3">
        <CalendarDays className="size-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-semibold">
            {translate("resources.agenda.name", { smart_count: 1 })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {translate("resources.agenda.subtitle")}
          </p>
        </div>
      </div>
      {isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <AgendaSection
            title={translate("resources.agenda.sections.overdue")}
            items={sections.overdue}
          />
          <AgendaSection
            title={translate("resources.agenda.sections.today")}
            items={sections.today}
          />
          <AgendaSection
            title={translate("resources.agenda.sections.risks")}
            items={sections.risks}
          />
          <AgendaSection
            title={translate("resources.agenda.sections.upcoming")}
            items={sections.upcoming}
          />
        </div>
      )}
    </div>
  );
};

const AgendaSection = ({
  title,
  items,
}: {
  title: string;
  items: AgendaSections[keyof AgendaSections];
}) => {
  const translate = useTranslate();

  return (
    <Card className="overflow-hidden py-0">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="divide-y">
        {items.length ? (
          items.map((item) => <AgendaItem key={item.id} item={item} />)
        ) : (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            {translate("resources.agenda.empty")}
          </div>
        )}
      </div>
    </Card>
  );
};
