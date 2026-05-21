import {
  AlertTriangle,
  BriefcaseBusiness,
  FileText,
  ListTodo,
  UserRound,
} from "lucide-react";
import { useTranslate } from "ra-core";
import { Link } from "react-router";

import type { AgendaItem as AgendaItemData } from "./agendaUtils";

const KIND_STYLES: Record<
  string,
  { icon: React.ElementType; bg: string; iconColor: string }
> = {
  task: {
    icon: ListTodo,
    bg: "bg-primary/10",
    iconColor: "text-primary",
  },
  lead: {
    icon: UserRound,
    bg: "bg-violet-100 dark:bg-violet-900/20",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  deal: {
    icon: BriefcaseBusiness,
    bg: "bg-amber-100 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  proposal: {
    icon: FileText,
    bg: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
};

const STATE_LABEL_STYLES: Record<string, string> = {
  overdue: "text-destructive font-semibold",
  today: "text-primary font-semibold",
  upcoming: "text-muted-foreground",
  "missing-next-action": "text-amber-600 dark:text-amber-400 font-semibold",
  stale: "text-destructive font-semibold",
};

const LOCALE = "pt-BR";

export const AgendaItem = ({ item }: { item: AgendaItemData }) => {
  const translate = useTranslate();
  const kindStyle = KIND_STYLES[item.kind] ?? KIND_STYLES.task;
  const Icon = kindStyle.icon;
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
        <div className={`mt-0.5 rounded-md p-1.5 ${kindStyle.bg}`}>
          <Icon className={`size-3.5 ${kindStyle.iconColor}`} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-foreground">
            {item.title}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span>{translate(`resources.agenda.kinds.${item.kind}`)}</span>
            {item.context && <span>· {item.context}</span>}
            {dueAt && <span>· {dueAt}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 md:justify-end">
        {(item.state === "missing-next-action" || item.state === "stale") && (
          <AlertTriangle className="size-3.5 text-amber-500" />
        )}
        <span
          className={`text-[11px] ${STATE_LABEL_STYLES[item.state] ?? "text-muted-foreground"}`}
        >
          {translate(`resources.agenda.states.${item.state}`)}
        </span>
      </div>
    </Link>
  );
};
