import { generateAutomationRuns } from "./automationRuns";
import { generateAutomationRules } from "./automationRules";
import { generateCompanies } from "./companies";
import { generateContactNotes } from "./contactNotes";
import { generateContacts } from "./contacts";
import { generateDealNotes } from "./dealNotes";
import { generateDeals } from "./deals";
import { finalize } from "./finalize";
import { generateLeads } from "./leads";
import { generateProposalItems } from "./proposalItems";
import { generateProposals } from "./proposals";
import { generateProposalTemplateItems } from "./proposalTemplateItems";
import { generateProposalTemplates } from "./proposalTemplates";
import { generateSales } from "./sales";
import { generateSalesGoals } from "./salesGoals";
import { generateTags } from "./tags";
import { generateTasks } from "./tasks";
import type { Db } from "./types";

export default (): Db => {
  const db = {} as Db;
  db.sales = generateSales(db);
  db.tags = generateTags(db);
  db.companies = generateCompanies(db);
  db.contacts = generateContacts(db);
  db.contact_notes = generateContactNotes(db);
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
  finalize(db);

  return db;
};
