import {
  AlertTriangle,
  BriefcaseBusiness,
  FileText,
  ListTodo,
  UserRound,
} from "lucide-react";
import { useTranslate } from "ra-core";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";

import type { AgendaItem as AgendaItemData } from "./agendaUtils";

const kindIcon = {
  task: ListTodo,
  lead: UserRound,
  deal: BriefcaseBusiness,
  proposal: FileText,
};

const stateVariant = {
  overdue: "destructive",
  today: "default",
  upcoming: "secondary",
  "missing-next-action": "outline",
  stale: "destructive",
} as const;

const LOCALE = "pt-BR";

export const AgendaItem = ({ item }: { item: AgendaItemData }) => {
  const translate = useTranslate();
  const Icon = kindIcon[item.kind];
  const dueAt = item.dueAt
    ? new Intl.DateTimeFormat(LOCALE, {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(item.dueAt))
    : null;

  return (
    <Link
      to={item.href}
      className="grid gap-3 px-4 py-3 transition-colors hover:bg-muted md:grid-cols-[1fr_auto] md:items-center"
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 rounded-md border bg-background p-2">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{item.title}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{translate(`resources.agenda.kinds.${item.kind}`)}</span>
            {item.context && <span>{item.context}</span>}
            {dueAt && <span>{dueAt}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 md:justify-end">
        {(item.state === "missing-next-action" || item.state === "stale") && (
          <AlertTriangle className="size-4 text-destructive" />
        )}
        <Badge variant={stateVariant[item.state]}>
          {translate(`resources.agenda.states.${item.state}`)}
        </Badge>
      </div>
    </Link>
  );
};
