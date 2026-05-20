import { useTranslate } from "ra-core";
import { Badge } from "@/components/ui/badge";

import type { Proposal } from "../types";
import { proposalStatuses } from "./proposalChoices";

export const ProposalStatusBadge = ({
  proposal,
}: {
  proposal: Pick<Proposal, "status">;
}) => {
  const translate = useTranslate();
  const status = proposalStatuses.find(
    (choice) => choice.value === proposal.status,
  );

  return (
    <Badge variant={status?.variant ?? "secondary"}>
      {translate(
        status?.label ?? `resources.proposals.statuses.${proposal.status}`,
      )}
    </Badge>
  );
};
