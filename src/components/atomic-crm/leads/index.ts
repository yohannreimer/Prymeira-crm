import { LeadCreate } from "./LeadCreate";
import { LeadEdit } from "./LeadEdit";
import { LeadList } from "./LeadList";
import { LeadShow } from "./LeadShow";
import type { Lead } from "../types";

export default {
  list: LeadList,
  create: LeadCreate,
  edit: LeadEdit,
  show: LeadShow,
  recordRepresentation: (lead: Lead) =>
    [lead.first_name, lead.last_name].filter(Boolean).join(" "),
};
