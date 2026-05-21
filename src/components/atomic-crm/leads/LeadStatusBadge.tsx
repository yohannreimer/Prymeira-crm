import { useTranslate } from "ra-core";
import { cn } from "@/lib/utils";

import type { Lead } from "../types";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-secondary text-secondary-foreground",
  contacted: "bg-secondary text-secondary-foreground",
  qualified: "bg-accent text-accent-foreground",
  converted: "bg-primary text-primary-foreground",
  discarded: "bg-muted text-muted-foreground",
};

const TEMPERATURE_STYLES: Record<string, string> = {
  cold: "border border-border text-muted-foreground bg-transparent",
  warm: "border border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
  hot: "bg-primary text-primary-foreground",
};

export const LeadStatusBadge = ({ lead }: { lead: Pick<Lead, "status"> }) => {
  const translate = useTranslate();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        STATUS_STYLES[lead.status] ?? "bg-secondary text-secondary-foreground",
      )}
    >
      {translate(`resources.leads.statuses.${lead.status}`)}
    </span>
  );
};

export const LeadTemperatureBadge = ({
  lead,
}: {
  lead: Pick<Lead, "temperature">;
}) => {
  const translate = useTranslate();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        TEMPERATURE_STYLES[lead.temperature] ??
          "border border-border text-muted-foreground bg-transparent",
      )}
    >
      {translate(`resources.leads.temperatures.${lead.temperature}`)}
    </span>
  );
};
