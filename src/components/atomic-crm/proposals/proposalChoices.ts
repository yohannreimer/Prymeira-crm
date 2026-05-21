import type { ProposalStatus } from "../types";

export type ProposalStatusChoice = {
  value: ProposalStatus;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
};

export const proposalStatuses: ProposalStatusChoice[] = [
  {
    value: "draft",
    label: "resources.proposals.statuses.draft",
    variant: "secondary",
  },
  {
    value: "sent",
    label: "resources.proposals.statuses.sent",
    variant: "default",
  },
  {
    value: "accepted",
    label: "resources.proposals.statuses.accepted",
    variant: "default",
  },
  {
    value: "rejected",
    label: "resources.proposals.statuses.rejected",
    variant: "destructive",
  },
  {
    value: "expired",
    label: "resources.proposals.statuses.expired",
    variant: "outline",
  },
];
