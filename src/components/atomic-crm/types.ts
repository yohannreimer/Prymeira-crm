import type { Identifier, RaRecord } from "ra-core";
import type { ComponentType } from "react";

import type {
  COMPANY_CREATED,
  CONTACT_CREATED,
  CONTACT_NOTE_CREATED,
  DEAL_CREATED,
  DEAL_NOTE_CREATED,
} from "./consts";

export type SignUpData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type SalesFormData = {
  avatar?: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  administrator: boolean;
  disabled: boolean;
};

export type TenantRecord = {
  workspace_id?: string;
};

type OptionalTenantRecord = TenantRecord | Record<never, never>;

export type Sale = {
  id: Identifier;
  first_name: string;
  last_name: string;
  email: string;
  administrator: boolean;
  clerk_user_id?: string;
  workspace_id?: string;
  workspace_role?: string;
  product_role?: string;
  avatar?: RAFile;
  disabled?: boolean;
  user_id?: string;
  password?: string;
} & TenantRecord;

export type SalesGoal = {
  sales_id: Identifier;
  period_start: string;
  revenue_goal: number;
  won_deals_goal: number;
  sent_proposals_goal: number;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id"> &
  OptionalTenantRecord;

export type Company = {
  name: string;
  logo: RAFile;
  sector: string;
  size: 1 | 10 | 50 | 250 | 500;
  linkedin_url: string;
  website: string;
  phone_number: string;
  address: string;
  zipcode: string;
  city: string;
  state_abbr: string;
  sales_id?: Identifier;
  created_at: string;
  description: string;
  revenue: string;
  tax_identifier: string;
  country: string;
  context_links?: string[];
  nb_contacts?: number;
  nb_deals?: number;
} & Pick<RaRecord, "id"> &
  OptionalTenantRecord;

export type EmailAndType = {
  email: string;
  type: "Work" | "Home" | "Other";
};

export type PhoneNumberAndType = {
  number: string;
  type: "Work" | "Home" | "Other";
};

export type Contact = {
  first_name: string;
  last_name: string;
  title: string;
  company_id?: Identifier | null;
  email_jsonb: EmailAndType[];
  avatar?: Partial<RAFile>;
  linkedin_url?: string | null;
  first_seen: string;
  last_seen: string;
  has_newsletter: boolean;
  tags: number[];
  gender: string;
  sales_id?: Identifier;
  status: string;
  background: string;
  phone_jsonb: PhoneNumberAndType[];
  nb_tasks?: number;
  company_name?: string;
} & Pick<RaRecord, "id"> &
  OptionalTenantRecord;

export type ContactNote = {
  contact_id: Identifier;
  text: string;
  date: string;
  sales_id: Identifier;
  status: string;
  attachments?: AttachmentNote[];
} & TenantRecord &
  Pick<RaRecord, "id">;

export type Deal = {
  name: string;
  company_id: Identifier;
  contact_ids: Identifier[];
  category: string;
  deal_type: string;
  probability: number | null;
  source: string | null;
  lost_reason: string | null;
  next_action_at: string | null;
  last_activity_at: string | null;
  stage: string;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  expected_closing_date: string;
  sales_id: Identifier;
  index: number;
} & TenantRecord &
  Pick<RaRecord, "id">;

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "discarded";

export type LeadTemperature = "cold" | "warm" | "hot";

export type Lead = {
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  company_name: string | null;
  source: string | null;
  interest: string | null;
  temperature: LeadTemperature;
  status: LeadStatus;
  next_action_at: string | null;
  discard_reason: string | null;
  converted_at: string | null;
  discarded_at: string | null;
  created_at: string;
  updated_at: string;
  sales_id?: Identifier;
} & TenantRecord &
  Pick<RaRecord, "id">;

export type ConvertLeadInput = {
  lead: Lead;
  dealName?: string;
  amount?: number;
  expectedClosingDate?: string;
};

export type ConvertLeadResult = {
  lead: Lead;
  company: Company;
  contact: Contact;
  deal: Deal;
};

export type DealNote = {
  deal_id: Identifier;
  text: string;
  date: string;
  sales_id: Identifier;
  attachments?: AttachmentNote[];

  // This is defined for compatibility with `ContactNote`
  status?: undefined;
} & TenantRecord &
  Pick<RaRecord, "id">;

export type Tag = {
  id: number;
  name: string;
  color: string;
} & TenantRecord;

export type Task = {
  contact_id?: Identifier | null;
  lead_id?: Identifier | null;
  deal_id?: Identifier | null;
  automation_run_id?: Identifier | null;
  type: string;
  text: string;
  due_date: string;
  done_date?: string | null;
  sales_id?: Identifier;
} & TenantRecord &
  Pick<RaRecord, "id">;

export type ProposalStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";

export type ProposalTemplate = {
  name: string;
  description?: string | null;
  default_scope?: string | null;
  default_terms?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
} & TenantRecord &
  Pick<RaRecord, "id">;

export type ProposalTemplateItem = {
  template_id: Identifier;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  index: number;
} & TenantRecord &
  Pick<RaRecord, "id">;

export type Proposal = {
  deal_id: Identifier;
  company_id: Identifier;
  contact_id?: Identifier | null;
  sales_id?: Identifier | null;
  template_id?: Identifier | null;
  number: string;
  title: string;
  status: ProposalStatus;
  scope?: string | null;
  terms?: string | null;
  internal_notes?: string | null;
  delivery_time?: string | null;
  payment_terms?: string | null;
  currency: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  valid_until?: string | null;
  sent_at?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  created_at: string;
  updated_at: string;
} & TenantRecord &
  Pick<RaRecord, "id">;

export type ProposalItem = {
  proposal_id: Identifier;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total: number;
  index: number;
} & TenantRecord &
  Pick<RaRecord, "id">;

export type AutomationRule = {
  rule_key: string;
  name: string;
  description?: string | null;
  enabled: boolean;
  trigger_resource: "leads" | "deals" | "proposals";
  trigger_event: "created" | "updated";
  condition_key?: string | null;
  action_key: "create_task" | "proposal_accepted_action";
  params: AutomationRuleParams;
  created_at: string;
  updated_at: string;
} & TenantRecord &
  Pick<RaRecord, "id">;

export type AutomationRuleParams = {
  dueInDays?: number;
  taskType?: string;
  taskText?: string;
  assignee?: "record_owner";
  acceptedAction?: "move_deal_won" | "create_closing_task" | "none";
};

export type AutomationRunStatus = "success" | "skipped" | "failed";

export type AutomationRun = {
  created_at: string;
  rule_key: string;
  trigger_resource: string;
  trigger_record_id: Identifier;
  action_resource?: string | null;
  action_record_id?: Identifier | null;
  status: AutomationRunStatus;
  message?: string | null;
  sales_id?: Identifier | null;
} & TenantRecord &
  Pick<RaRecord, "id">;

export type ActivityCompanyCreated = {
  type: typeof COMPANY_CREATED;
  company_id: Identifier;
  company: Company;
  sales_id: Identifier;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityContactCreated = {
  type: typeof CONTACT_CREATED;
  company_id: Identifier;
  sales_id?: Identifier;
  contact: Contact;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityContactNoteCreated = {
  type: typeof CONTACT_NOTE_CREATED;
  sales_id?: Identifier;
  contactNote: ContactNote;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityDealCreated = {
  type: typeof DEAL_CREATED;
  company_id: Identifier;
  sales_id?: Identifier;
  deal: Deal;
  date: string;
};

export type ActivityDealNoteCreated = {
  type: typeof DEAL_NOTE_CREATED;
  sales_id?: Identifier;
  dealNote: DealNote;
  date: string;
};

export type Activity = RaRecord &
  (
    | ActivityCompanyCreated
    | ActivityContactCreated
    | ActivityContactNoteCreated
    | ActivityDealCreated
    | ActivityDealNoteCreated
  );

export interface RAFile {
  src: string;
  title: string;
  path?: string;
  rawFile: File;
  type?: string;
}

export type AttachmentNote = RAFile;

export interface LabeledValue {
  value: string;
  label: string;
}

export type DealStage = LabeledValue;
export type DealType = LabeledValue;
export type DealLostReason = LabeledValue;

export interface NoteStatus extends LabeledValue {
  color: string;
}

export interface ContactGender {
  value: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}
