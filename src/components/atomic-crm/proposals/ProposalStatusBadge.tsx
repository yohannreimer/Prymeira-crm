import { useTranslate } from "ra-core";
import { cn } from "@/lib/utils";

import type { Proposal } from "../types";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-secondary text-secondary-foreground",
  sent: "bg-primary/10 text-primary border border-primary/20",
  accepted:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  rejected: "bg-destructive/10 text-destructive border border-destructive/20",
  expired: "border border-border text-muted-foreground bg-transparent",
};

export const ProposalStatusBadge = ({
  proposal,
}: {
  proposal: Pick<Proposal, "status">;
}) => {
  const translate = useTranslate();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        STATUS_STYLES[proposal.status] ??
          "bg-secondary text-secondary-foreground",
      )}
    >
      {translate(`resources.proposals.statuses.${proposal.status}`)}
    </span>
  );
};
