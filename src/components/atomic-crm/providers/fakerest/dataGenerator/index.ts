import { generateAutomationRuns } from "./automationRuns";
import { generateAutomationRules } from "./automationRules";
import { generateCompanies } from "./companies";
import { generateContactNotes } from "./contactNotes";
import { generateContacts } from "./contacts";
import { DEFAULT_WORKSPACE_ID } from "./constants";
import { generateDealNotes } from "./dealNotes";
import { generateDeals } from "./deals";
import { finalize } from "./finalize";
import { generateLeads } from "./leads";
import { generatePipelines } from "./pipelines";
import { generateProposalItems } from "./proposalItems";
import { generateProposals } from "./proposals";
import { generateProposalTemplateItems } from "./proposalTemplateItems";
import { generateProposalTemplates } from "./proposalTemplates";
import { generateSales } from "./sales";
import { generateSalesGoals } from "./salesGoals";
import { generateTags } from "./tags";
import { generateTasks } from "./tasks";
import type { Db } from "./types";

export { DEFAULT_WORKSPACE_ID } from "./constants";

const tenantSeedResources = [
  "companies",
  "contacts",
  "contact_notes",
  "pipelines",
  "deals",
  "deal_notes",
  "leads",
  "sales",
  "sales_goals",
  "tags",
  "automation_runs",
  "proposal_templates",
  "proposal_template_items",
  "proposals",
  "proposal_items",
  "automation_rules",
  "tasks",
  "configuration",
] as const;

export const addDefaultWorkspaceId = (db: Db): Db => {
  tenantSeedResources.forEach((resource) => {
    db[resource] = ((db[resource] ?? []) as Array<Record<string, any>>).map(
      (record) => ({
        ...record,
        workspace_id:
          (record as { workspace_id?: string }).workspace_id ??
          DEFAULT_WORKSPACE_ID,
      }),
    ) as any;
  });
  return db;
};

export default (): Db => {
  const db = {} as Db;
  db.sales = generateSales(db);
  db.tags = generateTags(db);
  db.companies = generateCompanies(db);
  db.contacts = generateContacts(db);
  db.contact_notes = generateContactNotes(db);
  db.pipelines = generatePipelines();
  db.deals = generateDeals(db);
  db.proposal_templates = generateProposalTemplates();
  db.proposal_template_items = generateProposalTemplateItems();
  db.proposals = generateProposals(db);
  db.proposal_items = generateProposalItems(db);
  db.automation_rules = generateAutomationRules();
  db.sales_goals = generateSalesGoals();
  db.deal_notes = generateDealNotes(db);
  db.leads = generateLeads(db);
  db.automation_runs = generateAutomationRuns();
  db.tasks = generateTasks(db);
  db.configuration = [
    {
      id: 1,
      config: {} as Db["configuration"][number]["config"],
    },
  ];
  addDefaultWorkspaceId(db);
  finalize(db);

  return db;
};
