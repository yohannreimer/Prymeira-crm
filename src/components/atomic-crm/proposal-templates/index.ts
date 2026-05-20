import type { ProposalTemplate } from "../types";
import { ProposalTemplateCreate } from "./ProposalTemplateCreate";
import { ProposalTemplateEdit } from "./ProposalTemplateEdit";
import { ProposalTemplateList } from "./ProposalTemplateList";

export default {
  list: ProposalTemplateList,
  create: ProposalTemplateCreate,
  edit: ProposalTemplateEdit,
  recordRepresentation: (template: ProposalTemplate) => template.name,
};
