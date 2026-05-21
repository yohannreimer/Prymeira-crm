import type { AutomationRule } from "../types";
import { AutomationEdit } from "./AutomationEdit";
import { AutomationList } from "./AutomationList";

export default {
  list: AutomationList,
  edit: AutomationEdit,
  recordRepresentation: (rule: AutomationRule) => rule.name,
};
