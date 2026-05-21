import type { Proposal } from "../types";
import { ProposalCreate } from "./ProposalCreate";
import { ProposalEdit } from "./ProposalEdit";
import { ProposalList } from "./ProposalList";
import { ProposalShow } from "./ProposalShow";

export default {
  list: ProposalList,
  create: ProposalCreate,
  edit: ProposalEdit,
  show: ProposalShow,
  recordRepresentation: (proposal: Proposal) => proposal.title,
};
