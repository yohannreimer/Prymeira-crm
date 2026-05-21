import type {
  AutomationRule,
  AutomationRun,
  Company,
  Contact,
  ContactNote,
  Deal,
  DealNote,
  Lead,
  Pipeline,
  Proposal,
  ProposalItem,
  ProposalTemplate,
  ProposalTemplateItem,
  Sale,
  SalesGoal,
  Tag,
  Task,
} from "../../../types";
import type { ConfigurationContextValue } from "../../../root/ConfigurationContext";

export interface Db {
  companies: Company[];
  contacts: Contact[];
  contact_notes: ContactNote[];
  deals: Deal[];
  pipelines: Pipeline[];
  deal_notes: DealNote[];
  leads: Lead[];
  proposal_templates: ProposalTemplate[];
  proposal_template_items: ProposalTemplateItem[];
  proposals: Proposal[];
  proposal_items: ProposalItem[];
  automation_rules: AutomationRule[];
  sales: Sale[];
  sales_goals: SalesGoal[];
  tags: Tag[];
  automation_runs: AutomationRun[];
  tasks: Task[];
  configuration: Array<{
    id: number;
    workspace_id?: string;
    config: ConfigurationContextValue;
  }>;
}
