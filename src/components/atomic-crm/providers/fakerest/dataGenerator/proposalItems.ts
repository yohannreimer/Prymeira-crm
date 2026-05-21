import type { ProposalItem } from "../../../types";
import type { Db } from "./types";

export const generateProposalItems = (db: Db): ProposalItem[] => {
  const proposal = db.proposals[0];
  if (!proposal) return [];

  return [
    {
      id: 1,
      proposal_id: proposal.id,
      description: "Implantacao CRM",
      quantity: 1,
      unit_price: 12000,
      discount_amount: 0,
      total: 12000,
      index: 0,
    },
  ];
};
