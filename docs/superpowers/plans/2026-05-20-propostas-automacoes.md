# Propostas Rapidas e Automacoes Configuraveis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add quick proposal generation tied to deals and a configurable admin automation screen for safe commercial rules.

**Architecture:** Add proposal and automation-rule tables to Supabase, mirror them in FakeRest, and keep business rules in small tested utilities. Proposals become first-class CRM resources, while automation rules remain predefined rule keys with editable parameters stored in `automation_rules.params`. Existing `automation_runs` remains the audit trail and duplicate guard.

**Tech Stack:** React 19, TypeScript, Vite, ra-core, shadcn-admin-kit, shadcn/ui, Tailwind CSS v4, Supabase/PostgreSQL, FakeRest, Vitest.

---

## Scope Check

This spec contains two linked subsystems: proposals and configurable automations. They should ship together because proposal events are one of the first useful automation triggers, and the automation screen is less valuable without proposal rules. The implementation remains one plan, but tasks are sliced so each area can be verified independently.

## File Structure

Modify:

- `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/01_tables.sql`
- `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/05_policies.sql`
- `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/06_grants.sql`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/types.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/automationEngine.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/automationEngine.test.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/supabase/dataProvider.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataProvider.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/types.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/index.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/agendaUtils.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/agendaUtils.test.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/Dashboard.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/commercialDashboardUtils.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/commercialDashboardUtils.test.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealShow.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/CRM.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/layout/Header.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/portugueseCrmMessages.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/test/StoryWrapper.tsx`

Create:

- `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/migrations/20260520020000_proposals_automation_rules.sql`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/index.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/proposalUtils.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/proposalUtils.test.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/proposalChoices.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalList.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalCreate.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalEdit.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalShow.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalInputs.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalItemsInput.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalPreview.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalStatusBadge.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/DealProposalsPanel.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/index.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/automationRuleChoices.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/automationRuleUtils.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/automationRuleUtils.test.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/AutomationList.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/AutomationEdit.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/AutomationRuleForm.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/AutomationRunsPanel.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/ProposalSummary.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/proposals.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/proposalItems.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/proposalTemplates.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/automationRules.ts`

---

## Task 1: Database Model

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/01_tables.sql`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/05_policies.sql`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/06_grants.sql`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/migrations/20260520020000_proposals_automation_rules.sql`

- [x] **Step 1: Update declarative tables**

Add these tables after `automation_runs` and before `tasks` in `01_tables.sql`:

```sql
create table public.proposal_templates (
    id bigint generated by default as identity primary key,
    name text not null,
    description text,
    default_scope text,
    default_terms text,
    active boolean not null default true,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create table public.proposals (
    id bigint generated by default as identity primary key,
    deal_id bigint not null,
    company_id bigint not null,
    contact_id bigint,
    sales_id bigint,
    template_id bigint,
    number text not null,
    title text not null,
    status text not null default 'draft',
    scope text,
    terms text,
    currency text not null default 'BRL',
    subtotal bigint not null default 0,
    discount_amount bigint not null default 0,
    total bigint not null default 0,
    valid_until date,
    sent_at timestamp with time zone,
    accepted_at timestamp with time zone,
    rejected_at timestamp with time zone,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint proposals_status_check check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    constraint proposals_amounts_check check (subtotal >= 0 and discount_amount >= 0 and total >= 0)
);

create table public.proposal_items (
    id bigint generated by default as identity primary key,
    proposal_id bigint not null,
    description text not null,
    quantity numeric not null default 1,
    unit_price bigint not null default 0,
    discount_amount bigint not null default 0,
    total bigint not null default 0,
    index smallint not null default 0,
    constraint proposal_items_amounts_check check (quantity > 0 and unit_price >= 0 and discount_amount >= 0 and total >= 0)
);

create table public.automation_rules (
    id bigint generated by default as identity primary key,
    rule_key text not null unique,
    name text not null,
    description text,
    enabled boolean not null default true,
    trigger_resource text not null,
    trigger_event text not null,
    condition_key text,
    action_key text not null,
    params jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);
```

- [x] **Step 2: Add foreign keys and indexes**

Add these constraints in the foreign key section of `01_tables.sql`:

```sql
alter table public.proposals
    add constraint proposals_deal_id_fkey foreign key (deal_id) references public.deals(id) on update cascade on delete cascade;

alter table public.proposals
    add constraint proposals_company_id_fkey foreign key (company_id) references public.companies(id) on update cascade on delete cascade;

alter table public.proposals
    add constraint proposals_contact_id_fkey foreign key (contact_id) references public.contacts(id) on update cascade on delete set null;

alter table public.proposals
    add constraint proposals_sales_id_fkey foreign key (sales_id) references public.sales(id);

alter table public.proposals
    add constraint proposals_template_id_fkey foreign key (template_id) references public.proposal_templates(id);

alter table public.proposal_items
    add constraint proposal_items_proposal_id_fkey foreign key (proposal_id) references public.proposals(id) on update cascade on delete cascade;
```

Add these indexes:

```sql
create index proposals_deal_id_idx on public.proposals using btree (deal_id);
create index proposals_company_id_idx on public.proposals using btree (company_id);
create index proposals_sales_id_idx on public.proposals using btree (sales_id);
create index proposals_status_idx on public.proposals using btree (status);
create index proposals_valid_until_idx on public.proposals using btree (valid_until);
create index proposal_items_proposal_id_idx on public.proposal_items using btree (proposal_id);
create index automation_rules_enabled_idx on public.automation_rules using btree (enabled);
```

- [x] **Step 3: Add RLS policies**

In `05_policies.sql`, enable RLS:

```sql
alter table public.proposal_templates enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_items enable row level security;
alter table public.automation_rules enable row level security;
```

Add policies:

```sql
create policy "Enable read access for authenticated users" on public.proposal_templates for select to authenticated using (true);
create policy "Enable insert for authenticated users only" on public.proposal_templates for insert to authenticated with check (true);
create policy "Enable update for authenticated users only" on public.proposal_templates for update to authenticated using (true) with check (true);
create policy "Proposal Templates Delete Policy" on public.proposal_templates for delete to authenticated using (true);

create policy "Enable read access for authenticated users" on public.proposals for select to authenticated using (true);
create policy "Enable insert for authenticated users only" on public.proposals for insert to authenticated with check (true);
create policy "Enable update for authenticated users only" on public.proposals for update to authenticated using (true) with check (true);
create policy "Proposals Delete Policy" on public.proposals for delete to authenticated using (true);

create policy "Enable read access for authenticated users" on public.proposal_items for select to authenticated using (true);
create policy "Enable insert for authenticated users only" on public.proposal_items for insert to authenticated with check (true);
create policy "Enable update for authenticated users only" on public.proposal_items for update to authenticated using (true) with check (true);
create policy "Proposal Items Delete Policy" on public.proposal_items for delete to authenticated using (true);

create policy "Enable read access for authenticated users" on public.automation_rules for select to authenticated using (true);
create policy "Enable insert for admins" on public.automation_rules for insert to authenticated with check (public.is_admin());
create policy "Enable update for admins" on public.automation_rules for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Automation Rules Delete Policy" on public.automation_rules for delete to authenticated using (public.is_admin());
```

- [x] **Step 4: Add grants**

In `06_grants.sql`, add table grants for `proposal_templates`, `proposals`, `proposal_items`, and `automation_rules`:

```sql
grant all on table public.proposal_templates to anon;
grant all on table public.proposal_templates to authenticated;
grant all on table public.proposal_templates to service_role;

grant all on table public.proposals to anon;
grant all on table public.proposals to authenticated;
grant all on table public.proposals to service_role;

grant all on table public.proposal_items to anon;
grant all on table public.proposal_items to authenticated;
grant all on table public.proposal_items to service_role;

grant all on table public.automation_rules to anon;
grant all on table public.automation_rules to authenticated;
grant all on table public.automation_rules to service_role;
```

Add sequence grants:

```sql
grant all on sequence public.proposal_templates_id_seq to anon;
grant all on sequence public.proposal_templates_id_seq to authenticated;
grant all on sequence public.proposal_templates_id_seq to service_role;

grant all on sequence public.proposals_id_seq to anon;
grant all on sequence public.proposals_id_seq to authenticated;
grant all on sequence public.proposals_id_seq to service_role;

grant all on sequence public.proposal_items_id_seq to anon;
grant all on sequence public.proposal_items_id_seq to authenticated;
grant all on sequence public.proposal_items_id_seq to service_role;

grant all on sequence public.automation_rules_id_seq to anon;
grant all on sequence public.automation_rules_id_seq to authenticated;
grant all on sequence public.automation_rules_id_seq to service_role;
```

- [x] **Step 5: Create manual migration**

Create `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/migrations/20260520020000_proposals_automation_rules.sql` with the same tables, indexes, constraints, RLS, policies, grants, and these seed records:

```sql
insert into public.proposal_templates (name, description, default_scope, default_terms, active)
values (
    'Proposta comercial padrao',
    'Template simples para propostas comerciais',
    'Escopo comercial a ser ajustado pelo vendedor.',
    'Esta proposta e valida ate a data indicada e pode ser revisada conforme alinhamento comercial.',
    true
);

insert into public.automation_rules (rule_key, name, description, enabled, trigger_resource, trigger_event, condition_key, action_key, params)
values
('lead.first-contact', 'Lead sem proxima acao', 'Cria tarefa de primeiro contato quando um lead nasce sem proxima acao.', true, 'leads', 'created', 'missing_next_action', 'create_task', '{"dueInDays":0,"taskType":"call","taskText":"Primeiro contato com {{lead.name}}","assignee":"record_owner"}'::jsonb),
('deal.follow-up-required', 'Negocio sem proxima acao', 'Cria follow-up quando um negocio nasce sem proxima acao.', true, 'deals', 'created', 'missing_next_action', 'create_task', '{"dueInDays":1,"taskType":"follow-up","taskText":"Definir proximo passo: {{deal.name}}","assignee":"record_owner"}'::jsonb),
('deal.proposal-follow-up', 'Negocio em proposta enviada', 'Cria follow-up quando o negocio entra na etapa Proposta enviada.', true, 'deals', 'updated', 'stage_is_proposal_sent', 'create_task', '{"dueInDays":2,"taskType":"follow-up","taskText":"Retomar proposta enviada: {{deal.name}}","assignee":"record_owner"}'::jsonb),
('proposal.sent-follow-up', 'Proposta enviada', 'Cria follow-up depois que uma proposta e marcada como enviada.', true, 'proposals', 'updated', 'status_is_sent', 'create_task', '{"dueInDays":2,"taskType":"follow-up","taskText":"Acompanhar proposta: {{proposal.title}}","assignee":"record_owner"}'::jsonb),
('proposal.accepted-action', 'Proposta aceita', 'Executa a acao configurada quando uma proposta e aceita.', true, 'proposals', 'updated', 'status_is_accepted', 'proposal_accepted_action', '{"acceptedAction":"move_deal_won","taskType":"follow-up","taskText":"Concluir fechamento da proposta: {{proposal.title}}","assignee":"record_owner"}'::jsonb);
```

- [x] **Step 6: Apply migration**

Run:

```bash
npx supabase migration up --local
```

Expected: `Local database is up to date.`

---

## Task 2: Types And FakeRest Seed Data

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/types.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/types.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/index.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/test/StoryWrapper.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/proposalTemplates.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/proposals.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/proposalItems.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/automationRules.ts`

- [x] **Step 1: Add proposal and automation rule types**

In `types.ts`, add:

```ts
export type ProposalStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export type ProposalTemplate = {
  name: string;
  description?: string | null;
  default_scope?: string | null;
  default_terms?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id">;

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
  currency: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  valid_until?: string | null;
  sent_at?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id">;

export type ProposalItem = {
  proposal_id: Identifier;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total: number;
  index: number;
} & Pick<RaRecord, "id">;

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
} & Pick<RaRecord, "id">;

export type AutomationRuleParams = {
  dueInDays?: number;
  taskType?: string;
  taskText?: string;
  assignee?: "record_owner";
  acceptedAction?: "move_deal_won" | "create_closing_task" | "none";
};
```

- [x] **Step 2: Update FakeRest DB shape**

In `dataGenerator/types.ts`, add imports and fields:

```ts
import type {
  AutomationRule,
  Proposal,
  ProposalItem,
  ProposalTemplate,
} from "../../../types";

export interface Db {
  proposal_templates: ProposalTemplate[];
  proposals: Proposal[];
  proposal_items: ProposalItem[];
  automation_rules: AutomationRule[];
}
```

Keep existing fields unchanged.

- [x] **Step 3: Seed automation rules**

Create `automationRules.ts`:

```ts
import type { AutomationRule } from "../../../types";

const now = "2026-05-20T00:00:00.000Z";

export const generateAutomationRules = (): AutomationRule[] => [
  {
    id: 1,
    rule_key: "lead.first-contact",
    name: "Lead sem proxima acao",
    description: "Cria tarefa de primeiro contato quando um lead nasce sem proxima acao.",
    enabled: true,
    trigger_resource: "leads",
    trigger_event: "created",
    condition_key: "missing_next_action",
    action_key: "create_task",
    params: {
      dueInDays: 0,
      taskType: "call",
      taskText: "Primeiro contato com {{lead.name}}",
      assignee: "record_owner",
    },
    created_at: now,
    updated_at: now,
  },
  {
    id: 2,
    rule_key: "deal.follow-up-required",
    name: "Negocio sem proxima acao",
    description: "Cria follow-up quando um negocio nasce sem proxima acao.",
    enabled: true,
    trigger_resource: "deals",
    trigger_event: "created",
    condition_key: "missing_next_action",
    action_key: "create_task",
    params: {
      dueInDays: 1,
      taskType: "follow-up",
      taskText: "Definir proximo passo: {{deal.name}}",
      assignee: "record_owner",
    },
    created_at: now,
    updated_at: now,
  },
  {
    id: 3,
    rule_key: "deal.proposal-follow-up",
    name: "Negocio em proposta enviada",
    description: "Cria follow-up quando o negocio entra na etapa Proposta enviada.",
    enabled: true,
    trigger_resource: "deals",
    trigger_event: "updated",
    condition_key: "stage_is_proposal_sent",
    action_key: "create_task",
    params: {
      dueInDays: 2,
      taskType: "follow-up",
      taskText: "Retomar proposta enviada: {{deal.name}}",
      assignee: "record_owner",
    },
    created_at: now,
    updated_at: now,
  },
  {
    id: 4,
    rule_key: "proposal.sent-follow-up",
    name: "Proposta enviada",
    description: "Cria follow-up depois que uma proposta e marcada como enviada.",
    enabled: true,
    trigger_resource: "proposals",
    trigger_event: "updated",
    condition_key: "status_is_sent",
    action_key: "create_task",
    params: {
      dueInDays: 2,
      taskType: "follow-up",
      taskText: "Acompanhar proposta: {{proposal.title}}",
      assignee: "record_owner",
    },
    created_at: now,
    updated_at: now,
  },
  {
    id: 5,
    rule_key: "proposal.accepted-action",
    name: "Proposta aceita",
    description: "Executa a acao configurada quando uma proposta e aceita.",
    enabled: true,
    trigger_resource: "proposals",
    trigger_event: "updated",
    condition_key: "status_is_accepted",
    action_key: "proposal_accepted_action",
    params: {
      acceptedAction: "move_deal_won",
      taskType: "follow-up",
      taskText: "Concluir fechamento da proposta: {{proposal.title}}",
      assignee: "record_owner",
    },
    created_at: now,
    updated_at: now,
  },
];
```

- [x] **Step 4: Seed proposal templates**

Create `proposalTemplates.ts`:

```ts
import type { ProposalTemplate } from "../../../types";

export const generateProposalTemplates = (): ProposalTemplate[] => [
  {
    id: 1,
    name: "Proposta comercial padrao",
    description: "Template simples para propostas comerciais",
    default_scope: "Escopo comercial a ser ajustado pelo vendedor.",
    default_terms:
      "Esta proposta e valida ate a data indicada e pode ser revisada conforme alinhamento comercial.",
    active: true,
    created_at: "2026-05-20T00:00:00.000Z",
    updated_at: "2026-05-20T00:00:00.000Z",
  },
];
```

- [x] **Step 5: Seed proposals and proposal items**

Create `proposals.ts`:

```ts
import type { Proposal } from "../../../types";
import type { Db } from "./types";

export const generateProposals = (db: Db): Proposal[] => {
  const deal = db.deals[0];
  if (!deal) return [];

  return [
    {
      id: 1,
      deal_id: deal.id,
      company_id: deal.company_id,
      contact_id: deal.contact_ids?.[0] ?? null,
      sales_id: deal.sales_id,
      template_id: 1,
      number: "PROP-0001",
      title: `Proposta - ${deal.name}`,
      status: "sent",
      scope: "Implantacao inicial e acompanhamento comercial.",
      terms: "Valida por 15 dias.",
      currency: "BRL",
      subtotal: 12000,
      discount_amount: 0,
      total: 12000,
      valid_until: "2026-06-05",
      sent_at: "2026-05-20T12:00:00.000Z",
      accepted_at: null,
      rejected_at: null,
      created_at: "2026-05-20T12:00:00.000Z",
      updated_at: "2026-05-20T12:00:00.000Z",
    },
  ];
};
```

Create `proposalItems.ts`:

```ts
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
```

- [x] **Step 6: Wire FakeRest generators**

In `dataGenerator/index.ts`, import and call generators in this order after `deals`:

```ts
import { generateAutomationRules } from "./automationRules";
import { generateProposalItems } from "./proposalItems";
import { generateProposals } from "./proposals";
import { generateProposalTemplates } from "./proposalTemplates";

db.proposal_templates = generateProposalTemplates();
db.proposals = generateProposals(db);
db.proposal_items = generateProposalItems(db);
db.automation_rules = generateAutomationRules();
```

In `src/test/StoryWrapper.tsx`, add empty arrays to `createCrmDb`:

```ts
proposal_templates: [],
proposals: [],
proposal_items: [],
automation_rules: [],
```

- [x] **Step 7: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: TypeScript errors are only from files that later tasks will create. If this step is run immediately after Task 2, it should pass because no imports reference missing proposal UI files yet.

---

## Task 3: Proposal Calculation Utilities

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/proposalUtils.test.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/proposalUtils.ts`

- [x] **Step 1: Write failing tests**

Create `proposalUtils.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import type { Proposal, ProposalItem } from "../types";
import {
  calculateProposalTotals,
  getNextProposalStatusData,
  isProposalExpired,
} from "./proposalUtils";

const item = (
  id: number,
  quantity: number,
  unitPrice: number,
  discountAmount = 0,
): ProposalItem => ({
  id,
  proposal_id: 1,
  description: `Item ${id}`,
  quantity,
  unit_price: unitPrice,
  discount_amount: discountAmount,
  total: 0,
  index: id,
});

const proposal = (overrides: Partial<Proposal> = {}): Proposal => ({
  id: 1,
  deal_id: 10,
  company_id: 20,
  contact_id: null,
  sales_id: 1,
  template_id: 1,
  number: "PROP-0001",
  title: "Proposta CRM",
  status: "draft",
  scope: "Escopo",
  terms: "Termos",
  currency: "BRL",
  subtotal: 0,
  discount_amount: 0,
  total: 0,
  valid_until: "2026-05-25",
  sent_at: null,
  accepted_at: null,
  rejected_at: null,
  created_at: "2026-05-20T12:00:00.000Z",
  updated_at: "2026-05-20T12:00:00.000Z",
  ...overrides,
});

describe("proposalUtils", () => {
  it("calculates item totals, subtotal, discount, and final total", () => {
    expect(
      calculateProposalTotals([item(1, 2, 1000), item(2, 1, 5000, 500)]),
    ).toEqual({
      items: [
        expect.objectContaining({ id: 1, total: 2000 }),
        expect.objectContaining({ id: 2, total: 4500 }),
      ],
      subtotal: 7000,
      discountAmount: 500,
      total: 6500,
    });
  });

  it("detects expired sent proposal", () => {
    expect(
      isProposalExpired(
        proposal({ status: "sent", valid_until: "2026-05-19" }),
        new Date("2026-05-20T12:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("does not expire accepted proposal", () => {
    expect(
      isProposalExpired(
        proposal({ status: "accepted", valid_until: "2026-05-19" }),
        new Date("2026-05-20T12:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("adds timestamps when status changes to sent or accepted", () => {
    expect(
      getNextProposalStatusData("sent", new Date("2026-05-20T12:00:00.000Z")),
    ).toEqual({ status: "sent", sent_at: "2026-05-20T12:00:00.000Z" });

    expect(
      getNextProposalStatusData(
        "accepted",
        new Date("2026-05-20T12:00:00.000Z"),
      ),
    ).toEqual({
      status: "accepted",
      accepted_at: "2026-05-20T12:00:00.000Z",
    });
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/proposals/proposalUtils.test.ts
```

Expected: FAIL because `proposalUtils.ts` does not exist.

- [x] **Step 3: Implement utilities**

Create `proposalUtils.ts`:

```ts
import type { Proposal, ProposalItem, ProposalStatus } from "../types";

export const calculateProposalTotals = (items: readonly ProposalItem[]) => {
  const calculatedItems = items.map((item) => {
    const gross = Math.round(item.quantity * item.unit_price);
    return {
      ...item,
      total: Math.max(0, gross - item.discount_amount),
    };
  });

  const subtotal = items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unit_price),
    0,
  );
  const discountAmount = items.reduce(
    (sum, item) => sum + item.discount_amount,
    0,
  );

  return {
    items: calculatedItems,
    subtotal,
    discountAmount,
    total: Math.max(0, subtotal - discountAmount),
  };
};

export const isProposalExpired = (proposal: Proposal, now = new Date()) => {
  if (proposal.status !== "sent" || !proposal.valid_until) return false;
  const validUntil = new Date(`${proposal.valid_until}T23:59:59.999`);
  return validUntil < now;
};

export const getNextProposalStatusData = (
  status: ProposalStatus,
  now = new Date(),
): Partial<Proposal> => {
  if (status === "sent") {
    return { status, sent_at: now.toISOString() };
  }
  if (status === "accepted") {
    return { status, accepted_at: now.toISOString() };
  }
  if (status === "rejected") {
    return { status, rejected_at: now.toISOString() };
  }
  return { status };
};

export const buildProposalNumber = (id: number | string) =>
  `PROP-${String(id).padStart(4, "0")}`;
```

- [x] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/proposals/proposalUtils.test.ts
```

Expected: PASS.

---

## Task 4: Proposal Resource UI

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/index.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/proposalChoices.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalStatusBadge.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalItemsInput.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalInputs.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalPreview.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalList.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalCreate.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalEdit.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalShow.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/CRM.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/layout/Header.tsx`

- [x] **Step 1: Create proposal choices**

Create `proposalChoices.ts`:

```ts
import type { ProposalStatus } from "../types";

export const proposalStatuses: Array<{
  value: ProposalStatus;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
}> = [
  { value: "draft", label: "resources.proposals.statuses.draft", variant: "secondary" },
  { value: "sent", label: "resources.proposals.statuses.sent", variant: "default" },
  { value: "accepted", label: "resources.proposals.statuses.accepted", variant: "default" },
  { value: "rejected", label: "resources.proposals.statuses.rejected", variant: "destructive" },
  { value: "expired", label: "resources.proposals.statuses.expired", variant: "outline" },
];
```

- [x] **Step 2: Create status badge**

Create `ProposalStatusBadge.tsx`:

```tsx
import { useTranslate } from "ra-core";
import { Badge } from "@/components/ui/badge";
import type { Proposal } from "../types";
import { proposalStatuses } from "./proposalChoices";

export const ProposalStatusBadge = ({ proposal }: { proposal: Proposal }) => {
  const translate = useTranslate();
  const status = proposalStatuses.find((item) => item.value === proposal.status);
  return (
    <Badge variant={status?.variant ?? "secondary"}>
      {translate(status?.label ?? proposal.status)}
    </Badge>
  );
};
```

- [x] **Step 3: Create proposal item form**

Create `ProposalItemsInput.tsx` with `ArrayInput` and `SimpleFormIterator` from the admin kit:

```tsx
import { ArrayInput, NumberInput, SimpleFormIterator, TextInput } from "@/components/admin";
import { required } from "ra-core";

export const ProposalItemsInput = () => (
  <ArrayInput source="items" label="resources.proposals.fields.items">
    <SimpleFormIterator inline>
      <TextInput
        source="description"
        label="resources.proposal_items.fields.description"
        validate={required()}
        helperText={false}
      />
      <NumberInput
        source="quantity"
        label="resources.proposal_items.fields.quantity"
        defaultValue={1}
        validate={required()}
        helperText={false}
      />
      <NumberInput
        source="unit_price"
        label="resources.proposal_items.fields.unit_price"
        defaultValue={0}
        validate={required()}
        helperText={false}
      />
      <NumberInput
        source="discount_amount"
        label="resources.proposal_items.fields.discount_amount"
        defaultValue={0}
        helperText={false}
      />
    </SimpleFormIterator>
  </ArrayInput>
);
```

If `ArrayInput` is not exported from `@/components/admin`, import it from the existing admin component path found with `rg --files src/components/admin | rg array`.

- [x] **Step 4: Create proposal inputs**

Create `ProposalInputs.tsx`:

```tsx
import { DateInput, NumberInput, ReferenceInput, SelectInput, TextInput } from "@/components/admin";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { required } from "ra-core";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { proposalStatuses } from "./proposalChoices";
import { ProposalItemsInput } from "./ProposalItemsInput";

export const ProposalInputs = () => {
  const { currency } = useConfigurationContext();

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput source="title" validate={required()} helperText={false} />
        <TextInput source="number" validate={required()} helperText={false} />
        <ReferenceInput source="deal_id" reference="deals">
          <AutocompleteInput optionText="name" validate={required()} helperText={false} />
        </ReferenceInput>
        <ReferenceInput source="company_id" reference="companies">
          <AutocompleteInput optionText="name" validate={required()} helperText={false} />
        </ReferenceInput>
        <SelectInput
          source="status"
          choices={proposalStatuses}
          optionText="label"
          optionValue="value"
          defaultValue="draft"
          helperText={false}
        />
        <DateInput source="valid_until" helperText={false} />
      </div>
      <TextInput source="scope" multiline helperText={false} />
      <ProposalItemsInput />
      <div className="grid gap-4 md:grid-cols-3">
        <TextInput source="currency" defaultValue={currency} helperText={false} />
        <NumberInput source="discount_amount" defaultValue={0} helperText={false} />
        <NumberInput source="total" disabled helperText={false} />
      </div>
      <TextInput source="terms" multiline helperText={false} />
    </div>
  );
};
```

- [x] **Step 5: Create preview**

Create `ProposalPreview.tsx`:

```tsx
import { useLocaleState } from "ra-core";
import { Card } from "@/components/ui/card";
import type { Company, Proposal, ProposalItem } from "../types";
import { ProposalStatusBadge } from "./ProposalStatusBadge";

export const ProposalPreview = ({
  proposal,
  company,
  items,
}: {
  proposal: Proposal;
  company?: Company;
  items: ProposalItem[];
}) => {
  const [locale = "pt-BR"] = useLocaleState();
  const formatAmount = (amount: number) =>
    amount.toLocaleString(locale, {
      style: "currency",
      currency: proposal.currency,
      maximumFractionDigits: 0,
    });

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
        <div>
          <div className="text-xs uppercase text-muted-foreground">
            {proposal.number}
          </div>
          <h1 className="mt-1 text-2xl font-semibold">{proposal.title}</h1>
          <div className="mt-1 text-sm text-muted-foreground">
            {company?.name}
          </div>
        </div>
        <ProposalStatusBadge proposal={proposal} />
      </div>
      {proposal.scope && (
        <section className="border-b py-4">
          <h2 className="text-sm font-semibold">Escopo</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {proposal.scope}
          </p>
        </section>
      )}
      <section className="border-b py-4">
        <h2 className="text-sm font-semibold">Itens</h2>
        <div className="mt-3 divide-y">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid gap-2 py-3 text-sm md:grid-cols-[1fr_auto_auto]"
            >
              <span>{item.description}</span>
              <span className="text-muted-foreground">
                {item.quantity} x {formatAmount(item.unit_price)}
              </span>
              <span className="font-medium">{formatAmount(item.total)}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="flex justify-end pt-4">
        <div className="min-w-52 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatAmount(proposal.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Desconto</span>
            <span>{formatAmount(proposal.discount_amount)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatAmount(proposal.total)}</span>
          </div>
        </div>
      </div>
      {proposal.terms && (
        <section className="pt-4">
          <h2 className="text-sm font-semibold">Condicoes comerciais</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {proposal.terms}
          </p>
        </section>
      )}
    </Card>
  );
};
```

- [x] **Step 6: Create list, create, edit, show**

Create resource components using current list/show patterns:

`ProposalList.tsx`:

```tsx
import { Link } from "react-router";
import { CreateButton } from "@/components/admin/create-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { SearchInput } from "@/components/admin/search-input";
import { SelectInput } from "@/components/admin/select-input";
import { TopToolbar } from "../layout/TopToolbar";
import type { Proposal } from "../types";
import { proposalStatuses } from "./proposalChoices";
import { ProposalStatusBadge } from "./ProposalStatusBadge";
import { useListContext, useTranslate } from "ra-core";
import { Card } from "@/components/ui/card";

export const ProposalList = () => {
  const translate = useTranslate();
  const filters = [
    <SearchInput source="q" alwaysOn />,
    <SelectInput
      source="status"
      choices={proposalStatuses.map((item) => ({
        ...item,
        label: translate(item.label),
      }))}
      optionText="label"
      optionValue="value"
      alwaysOn
    />,
  ];

  return (
    <List
      title={false}
      filters={filters}
      actions={
        <TopToolbar>
          <CreateButton label="resources.proposals.action.new" />
        </TopToolbar>
      }
      sort={{ field: "updated_at", order: "DESC" }}
      pagination={<ListPagination rowsPerPageOptions={[10, 25, 50]} />}
    >
      <ProposalRows />
    </List>
  );
};

const ProposalRows = () => {
  const { data = [] } = useListContext<Proposal>();
  return (
    <Card className="py-0">
      <div className="divide-y">
        {data.map((proposal) => (
          <Link
            key={proposal.id}
            to={`/proposals/${proposal.id}/show`}
            className="grid gap-3 p-4 hover:bg-muted md:grid-cols-[1fr_auto_auto]"
          >
            <div>
              <div className="font-medium">{proposal.title}</div>
              <div className="text-sm text-muted-foreground">
                {proposal.number}
              </div>
            </div>
            <ProposalStatusBadge proposal={proposal} />
            <div className="text-sm font-medium">
              {proposal.total.toLocaleString(undefined, {
                style: "currency",
                currency: proposal.currency,
                maximumFractionDigits: 0,
              })}
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};
```

`ProposalCreate.tsx`, `ProposalEdit.tsx`, and `ProposalShow.tsx` should use existing `Create`, `Edit`, `Show` admin wrappers. `ProposalShow.tsx` must fetch `proposal_items` with `filter: { proposal_id: record.id }` and pass them to `ProposalPreview`.

- [x] **Step 7: Register resource and nav**

In `proposals/index.ts`:

```ts
import { ProposalCreate } from "./ProposalCreate";
import { ProposalEdit } from "./ProposalEdit";
import { ProposalList } from "./ProposalList";
import { ProposalShow } from "./ProposalShow";
import type { Proposal } from "../types";

export default {
  list: ProposalList,
  create: ProposalCreate,
  edit: ProposalEdit,
  show: ProposalShow,
  recordRepresentation: (proposal: Proposal) => proposal.title,
};
```

In `CRM.tsx`, import and register:

```tsx
import proposals from "../proposals";

<Resource name="proposals" {...proposals} />
```

In `Header.tsx`, add a `Propostas` navigation tab between `Negocios` and user menu. Keep desktop spacing compact by reducing tab horizontal padding from `px-6` to `px-4` if needed.

- [x] **Step 8: Run focused typecheck**

Run:

```bash
npm run typecheck
```

Expected: pass after any import-path corrections.

---

## Task 5: Deal Integration

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/DealProposalsPanel.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealShow.tsx`

- [x] **Step 1: Create deal proposals panel**

Create `DealProposalsPanel.tsx`:

```tsx
import { FileText } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Deal, Proposal } from "../types";
import { ProposalStatusBadge } from "./ProposalStatusBadge";

export const DealProposalsPanel = ({ deal }: { deal: Deal }) => {
  const translate = useTranslate();
  const { data: proposals = [] } = useGetList<Proposal>("proposals", {
    pagination: { page: 1, perPage: 25 },
    sort: { field: "updated_at", order: "DESC" },
    filter: { deal_id: deal.id },
  });

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">
            {translate("resources.proposals.name", { smart_count: 2 })}
          </h2>
        </div>
        <Button asChild size="sm">
          <Link to={`/proposals/create?deal_id=${deal.id}`}>
            {translate("resources.proposals.action.generate")}
          </Link>
        </Button>
      </div>
      <div className="divide-y">
        {proposals.map((proposal) => (
          <Link
            key={proposal.id}
            to={`/proposals/${proposal.id}/show`}
            className="flex items-center justify-between gap-3 py-3 text-sm hover:text-primary"
          >
            <span className="truncate">{proposal.title}</span>
            <ProposalStatusBadge proposal={proposal} />
          </Link>
        ))}
        {!proposals.length && (
          <div className="py-4 text-sm text-muted-foreground">
            {translate("resources.proposals.empty.for_deal")}
          </div>
        )}
      </div>
    </Card>
  );
};
```

- [x] **Step 2: Add panel to deal show**

In `DealShow.tsx`, import:

```tsx
import { DealProposalsPanel } from "../proposals/DealProposalsPanel";
```

Place `<DealProposalsPanel deal={record} />` near notes/tasks in the deal detail page after the main commercial summary. Use the existing `record` variable from `useRecordContext` or the show render context. If the file does not expose `record` in the section, wrap the panel in a child component:

```tsx
const DealProposalsSection = () => {
  const record = useRecordContext<Deal>();
  if (!record) return null;
  return <DealProposalsPanel deal={record} />;
};
```

- [x] **Step 3: Verify navigation manually**

Run the dev server if needed:

```bash
make start
```

Open:

```text
http://localhost:5174/#/deals
```

Expected: opening a deal shows a `Propostas` panel and a `Gerar proposta` button.

---

## Task 6: Configurable Automation Engine

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/automationEngine.test.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/automationEngine.ts`

- [x] **Step 1: Add failing tests for rules**

Append tests to `automationEngine.test.ts`:

```ts
it("does not run when the matching automation rule is disabled", async () => {
  const { provider, calls } = createProvider();
  provider.getList = async (resource: string) => {
    if (resource === "automation_rules") {
      return {
        data: [
          {
            id: 1,
            rule_key: "lead.first-contact",
            enabled: false,
            params: { dueInDays: 0, taskType: "call" },
          },
        ],
        total: 1,
      };
    }
    return { data: [], total: 0 };
  };

  const results = await runLeadCreatedAutomations(provider, {
    lead,
    now: new Date("2026-05-20T12:00:00.000Z"),
  });

  expect(results).toEqual([
    expect.objectContaining({
      ruleKey: "lead.first-contact",
      created: false,
      skippedReason: "disabled",
    }),
  ]);
  expect(calls).toEqual([]);
});

it("uses automation rule params to create proposal sent follow-up", async () => {
  const proposal = {
    id: 44,
    deal_id: 33,
    company_id: 21,
    contact_id: null,
    sales_id: 4,
    template_id: 1,
    number: "PROP-0044",
    title: "Proposta CRM",
    status: "sent",
    scope: "Escopo",
    terms: "Termos",
    currency: "BRL",
    subtotal: 1000,
    discount_amount: 0,
    total: 1000,
    valid_until: "2026-05-30",
    sent_at: "2026-05-20T12:00:00.000Z",
    accepted_at: null,
    rejected_at: null,
    created_at: "2026-05-20T12:00:00.000Z",
    updated_at: "2026-05-20T12:00:00.000Z",
  } as const;
  const { provider, calls } = createProvider();
  provider.getList = async (resource: string) => {
    if (resource === "automation_rules") {
      return {
        data: [
          {
            id: 4,
            rule_key: "proposal.sent-follow-up",
            enabled: true,
            params: {
              dueInDays: 3,
              taskType: "email",
              taskText: "Cobrar retorno da proposta {{proposal.title}}",
            },
          },
        ],
        total: 1,
      };
    }
    return { data: [], total: 0 };
  };

  await runProposalUpdatedAutomations(provider, {
    previousProposal: { ...proposal, status: "draft" },
    proposal,
    now: new Date("2026-05-20T12:00:00.000Z"),
  });

  expect(calls[1]).toEqual({
    resource: "tasks",
    params: {
      data: expect.objectContaining({
        deal_id: 33,
        type: "email",
        text: "Cobrar retorno da proposta Proposta CRM",
        due_date: "2026-05-23T12:00:00.000Z",
      }),
    },
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/providers/commons/automationEngine.test.ts
```

Expected: FAIL because `disabled` is not a supported skipped reason and `runProposalUpdatedAutomations` does not exist.

- [x] **Step 3: Extend engine types and rule loading**

In `automationEngine.ts`, import `AutomationRule` and `Proposal`, add skipped reason:

```ts
import type { AutomationRule, AutomationRun, Deal, Lead, Proposal, Task } from "../../types";

export type AutomationResult = {
  ruleKey: string;
  created: boolean;
  skippedReason?: "already-ran" | "not-applicable" | "disabled";
  taskId?: Identifier;
  automationRunId?: Identifier;
};
```

Add:

```ts
const getAutomationRule = async (
  dataProvider: DataProvider,
  ruleKey: string,
): Promise<AutomationRule | undefined> => {
  const { data } = await dataProvider.getList<AutomationRule>("automation_rules", {
    filter: { rule_key: ruleKey },
    pagination: { page: 1, perPage: 1 },
    sort: { field: "id", order: "ASC" },
  });
  return data[0];
};

const getRuleParams = async (
  dataProvider: DataProvider,
  ruleKey: string,
) => {
  const rule = await getAutomationRule(dataProvider, ruleKey);
  if (rule && !rule.enabled) {
    return { enabled: false as const, params: rule.params ?? {} };
  }
  return { enabled: true as const, params: rule?.params ?? {} };
};

const renderTemplate = (template: string, values: Record<string, string>) =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{{${key}}}`, value),
    template,
  );
```

- [x] **Step 4: Use rule params in existing automations**

In each run function, before creating a task:

```ts
const rule = await getRuleParams(dataProvider, FIRST_CONTACT_RULE);
if (!rule.enabled) {
  return [{ ruleKey: FIRST_CONTACT_RULE, created: false, skippedReason: "disabled" }];
}
```

Use `rule.params.dueInDays`, `rule.params.taskType`, and `rule.params.taskText` with existing hardcoded values as fallback.

- [x] **Step 5: Add proposal automation**

Add:

```ts
const PROPOSAL_SENT_RULE = "proposal.sent-follow-up";
const PROPOSAL_ACCEPTED_RULE = "proposal.accepted-action";

type ProposalUpdatedAutomationContext = AutomationContext & {
  proposal: Proposal;
  previousProposal: Proposal;
};

export const runProposalUpdatedAutomations = async (
  dataProvider: DataProvider,
  { proposal, previousProposal, now = new Date() }: ProposalUpdatedAutomationContext,
): Promise<AutomationResult[]> => {
  if (proposal.status === "sent" && previousProposal.status !== "sent") {
    const rule = await getRuleParams(dataProvider, PROPOSAL_SENT_RULE);
    if (!rule.enabled) {
      return [{ ruleKey: PROPOSAL_SENT_RULE, created: false, skippedReason: "disabled" }];
    }
    const dueInDays = rule.params.dueInDays ?? 2;
    const taskText = renderTemplate(
      rule.params.taskText ?? "Acompanhar proposta: {{proposal.title}}",
      { "proposal.title": proposal.title },
    );
    return [
      await runTaskAutomation(dataProvider, {
        ruleKey: PROPOSAL_SENT_RULE,
        triggerResource: "proposals",
        triggerRecordId: proposal.id,
        salesId: proposal.sales_id ?? null,
        message: "Proposta marcada como enviada",
        task: {
          contact_id: proposal.contact_id ?? null,
          lead_id: null,
          deal_id: proposal.deal_id,
          automation_run_id: null,
          type: rule.params.taskType ?? "follow-up",
          text: taskText,
          due_date: addDays(now, dueInDays).toISOString(),
          done_date: null,
          sales_id: proposal.sales_id ?? undefined,
        },
      }),
    ];
  }

  if (proposal.status === "accepted" && previousProposal.status !== "accepted") {
    return [{ ruleKey: PROPOSAL_ACCEPTED_RULE, created: false, skippedReason: "not-applicable" }];
  }

  return [{ ruleKey: PROPOSAL_SENT_RULE, created: false, skippedReason: "not-applicable" }];
};
```

- [x] **Step 6: Run automation tests**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/providers/commons/automationEngine.test.ts
```

Expected: PASS.

---

## Task 7: Provider Lifecycle For Proposals

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/supabase/dataProvider.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataProvider.ts`

- [x] **Step 1: Import proposal utilities and automation**

In both data providers:

```ts
import {
  calculateProposalTotals,
  buildProposalNumber,
  getNextProposalStatusData,
} from "../../proposals/proposalUtils";
import { runProposalUpdatedAutomations } from "../commons/automationEngine";
import type { Proposal, ProposalItem } from "../../types";
```

Adjust relative import paths in the Supabase provider if needed; from `providers/supabase/dataProvider.ts`, proposals utilities path is `../../proposals/proposalUtils`.

- [x] **Step 2: Add proposal create/update defaults**

Add helper:

```ts
const applyProposalDefaults = <
  T extends CreateParams<Proposal> | UpdateParams<Proposal>,
>(
  params: T,
  now = new Date().toISOString(),
): T => {
  const previousData =
    "previousData" in params ? (params.previousData as Proposal | undefined) : undefined;
  const status = (params.data.status ?? previousData?.status ?? "draft") as Proposal["status"];
  const statusData =
    previousData && previousData.status !== status
      ? getNextProposalStatusData(status, new Date(now))
      : { status };

  return {
    ...params,
    data: {
      ...params.data,
      ...statusData,
      currency: params.data.currency ?? previousData?.currency ?? "BRL",
      subtotal: params.data.subtotal ?? previousData?.subtotal ?? 0,
      discount_amount:
        params.data.discount_amount ?? previousData?.discount_amount ?? 0,
      total: params.data.total ?? previousData?.total ?? 0,
      created_at: params.data.created_at ?? previousData?.created_at ?? now,
      updated_at: now,
    },
  };
};
```

- [x] **Step 3: Add lifecycle callback for proposals**

In the `lifeCycleCallbacks` array:

```ts
let previousProposalForAutomation: Proposal | undefined;

{
  resource: "proposals",
  beforeCreate: async (params: CreateParams<Proposal>) => {
    const now = new Date().toISOString();
    return applyProposalDefaults({
      ...params,
      data: {
        number: params.data.number ?? buildProposalNumber(Date.now()),
        ...params.data,
        created_at: now,
        updated_at: now,
      },
    }, now);
  },
  beforeUpdate: async (params: UpdateParams<Proposal>) => {
    previousProposalForAutomation = params.previousData as Proposal | undefined;
    return applyProposalDefaults(params);
  },
  afterUpdate: async (result, dataProvider) => {
    if (previousProposalForAutomation) {
      await runProposalUpdatedAutomations(dataProvider, {
        previousProposal: previousProposalForAutomation,
        proposal: result.data,
      });
    }
    previousProposalForAutomation = undefined;
    return result;
  },
} satisfies ResourceCallbacks<Proposal>
```

Place `previousProposalForAutomation` near existing `previousDealForAutomation`.

- [x] **Step 4: Handle nested proposal items**

If `ProposalCreate/Edit` sends `items` nested in proposal data, implement custom methods instead of relying on nested REST. Add to custom data provider:

```ts
async saveProposalWithItems(input: {
  proposal: Partial<Proposal>;
  items: Array<Partial<ProposalItem>>;
  previousProposal?: Proposal;
}) {
  const totals = calculateProposalTotals(
    input.items.map((item, index) => ({
      id: item.id ?? index,
      proposal_id: item.proposal_id ?? input.proposal.id ?? 0,
      description: item.description ?? "",
      quantity: item.quantity ?? 1,
      unit_price: item.unit_price ?? 0,
      discount_amount: item.discount_amount ?? 0,
      total: item.total ?? 0,
      index,
    })),
  );
  const proposalPayload = {
    ...input.proposal,
    subtotal: totals.subtotal,
    discount_amount: totals.discountAmount,
    total: totals.total,
  };
  const savedProposal = input.proposal.id
    ? await dataProvider.update<Proposal>("proposals", {
        id: input.proposal.id,
        data: proposalPayload,
        previousData: input.previousProposal,
      })
    : await dataProvider.create<Proposal>("proposals", {
        data: proposalPayload,
      });
  await Promise.all(
    totals.items.map((item) =>
      item.id && Number(item.id) > 0
        ? dataProvider.update<ProposalItem>("proposal_items", {
            id: item.id,
            data: { ...item, proposal_id: savedProposal.data.id },
            previousData: item as ProposalItem,
          })
        : dataProvider.create<ProposalItem>("proposal_items", {
            data: { ...item, proposal_id: savedProposal.data.id },
          }),
    ),
  );
  return savedProposal.data;
}
```

Add this method to `CrmDataProvider` type if the provider type requires it.

- [x] **Step 5: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: pass after resolving custom method typing.

---

## Task 8: Automations Admin UI

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/index.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/automationRuleChoices.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/automationRuleUtils.test.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/automationRuleUtils.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/AutomationList.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/AutomationEdit.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/AutomationRuleForm.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/automations/AutomationRunsPanel.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/CRM.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/settings/SettingsPage.tsx`

- [x] **Step 1: Write failing utility tests**

Create `automationRuleUtils.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  normalizeAutomationParams,
  describeAutomationRule,
} from "./automationRuleUtils";

describe("automationRuleUtils", () => {
  it("normalizes invalid numeric params to safe defaults", () => {
    expect(
      normalizeAutomationParams("proposal.sent-follow-up", {
        dueInDays: -2,
        taskType: "",
        taskText: "",
      }),
    ).toEqual({
      dueInDays: 2,
      taskType: "follow-up",
      taskText: "Acompanhar proposta: {{proposal.title}}",
      assignee: "record_owner",
    });
  });

  it("describes a known rule in pt-BR", () => {
    expect(describeAutomationRule("proposal.sent-follow-up")).toEqual({
      trigger: "Proposta marcada como enviada",
      condition: "Status mudou para enviada",
      action: "Criar tarefa de follow-up",
    });
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/automations/automationRuleUtils.test.ts
```

Expected: FAIL because utility file does not exist.

- [x] **Step 3: Implement automation utils**

Create `automationRuleUtils.ts`:

```ts
import type { AutomationRuleParams } from "../types";

const defaults: Record<string, AutomationRuleParams> = {
  "lead.first-contact": {
    dueInDays: 0,
    taskType: "call",
    taskText: "Primeiro contato com {{lead.name}}",
    assignee: "record_owner",
  },
  "deal.follow-up-required": {
    dueInDays: 1,
    taskType: "follow-up",
    taskText: "Definir proximo passo: {{deal.name}}",
    assignee: "record_owner",
  },
  "deal.proposal-follow-up": {
    dueInDays: 2,
    taskType: "follow-up",
    taskText: "Retomar proposta enviada: {{deal.name}}",
    assignee: "record_owner",
  },
  "proposal.sent-follow-up": {
    dueInDays: 2,
    taskType: "follow-up",
    taskText: "Acompanhar proposta: {{proposal.title}}",
    assignee: "record_owner",
  },
  "proposal.accepted-action": {
    acceptedAction: "move_deal_won",
    taskType: "follow-up",
    taskText: "Concluir fechamento da proposta: {{proposal.title}}",
    assignee: "record_owner",
  },
};

export const normalizeAutomationParams = (
  ruleKey: string,
  params: AutomationRuleParams,
): AutomationRuleParams => {
  const fallback = defaults[ruleKey] ?? {};
  return {
    ...fallback,
    ...params,
    dueInDays:
      typeof params.dueInDays === "number" && params.dueInDays >= 0
        ? params.dueInDays
        : fallback.dueInDays,
    taskType: params.taskType || fallback.taskType,
    taskText: params.taskText || fallback.taskText,
    assignee: "record_owner",
  };
};

export const describeAutomationRule = (ruleKey: string) => {
  const descriptions: Record<
    string,
    { trigger: string; condition: string; action: string }
  > = {
    "lead.first-contact": {
      trigger: "Lead criado",
      condition: "Sem proxima acao",
      action: "Criar tarefa de primeiro contato",
    },
    "deal.follow-up-required": {
      trigger: "Negocio criado",
      condition: "Sem proxima acao",
      action: "Criar tarefa de follow-up",
    },
    "deal.proposal-follow-up": {
      trigger: "Negocio atualizado",
      condition: "Etapa mudou para Proposta enviada",
      action: "Criar tarefa de follow-up",
    },
    "proposal.sent-follow-up": {
      trigger: "Proposta marcada como enviada",
      condition: "Status mudou para enviada",
      action: "Criar tarefa de follow-up",
    },
    "proposal.accepted-action": {
      trigger: "Proposta marcada como aceita",
      condition: "Status mudou para aceita",
      action: "Executar acao de aceite",
    },
  };
  return descriptions[ruleKey] ?? {
    trigger: "Regra personalizada",
    condition: "Condicao configurada",
    action: "Acao configurada",
  };
};
```

- [x] **Step 4: Run utility tests**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/automations/automationRuleUtils.test.ts
```

Expected: PASS.

- [x] **Step 5: Create automations list**

Create `AutomationList.tsx`:

```tsx
import { Link } from "react-router";
import { List } from "@/components/admin/list";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useListContext, useTranslate, useUpdate } from "ra-core";
import type { AutomationRule } from "../types";
import { describeAutomationRule } from "./automationRuleUtils";

export const AutomationList = () => (
  <List
    title={false}
    sort={{ field: "id", order: "ASC" }}
    pagination={false}
  >
    <AutomationRows />
  </List>
);

const AutomationRows = () => {
  const { data = [] } = useListContext<AutomationRule>();
  const translate = useTranslate();
  const [update] = useUpdate();

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-4 text-2xl font-semibold">
        {translate("resources.automation_rules.name", { smart_count: 2 })}
      </h1>
      <Card className="py-0">
        <div className="divide-y">
          {data.map((rule) => {
            const description = describeAutomationRule(rule.rule_key);
            return (
              <div
                key={rule.id}
                className="grid gap-3 p-4 md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(enabled) =>
                    update("automation_rules", {
                      id: rule.id,
                      data: { enabled, updated_at: new Date().toISOString() },
                      previousData: rule,
                    })
                  }
                />
                <Link to={`/automation_rules/${rule.id}`} className="min-w-0">
                  <div className="font-medium">{rule.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {description.trigger} · {description.condition} ·{" "}
                    {description.action}
                  </div>
                </Link>
                <Link
                  to={`/automation_rules/${rule.id}`}
                  className="text-sm text-primary"
                >
                  {translate("ra.action.edit")}
                </Link>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
```

- [x] **Step 6: Create form and edit**

Create `AutomationRuleForm.tsx`:

```tsx
import { BooleanInput, NumberInput, SelectInput, TextInput } from "@/components/admin";
import { useRecordContext } from "ra-core";
import type { AutomationRule } from "../types";

const acceptedActionChoices = [
  { id: "move_deal_won", name: "Mover negocio para ganho" },
  { id: "create_closing_task", name: "Criar tarefa de fechamento" },
  { id: "none", name: "Nao fazer nada" },
];

export const AutomationRuleForm = () => {
  const record = useRecordContext<AutomationRule>();
  const isAcceptedRule = record?.rule_key === "proposal.accepted-action";

  return (
    <div className="grid gap-4">
      <BooleanInput source="enabled" />
      <TextInput source="name" disabled helperText={false} />
      <TextInput source="description" disabled multiline helperText={false} />
      {isAcceptedRule ? (
        <SelectInput
          source="params.acceptedAction"
          choices={acceptedActionChoices}
          optionText="name"
          optionValue="id"
          helperText={false}
        />
      ) : (
        <>
          <NumberInput source="params.dueInDays" helperText={false} />
          <TextInput source="params.taskType" helperText={false} />
          <TextInput source="params.taskText" multiline helperText={false} />
        </>
      )}
    </div>
  );
};
```

Create `AutomationEdit.tsx` using existing admin `Edit` and `SimpleForm` wrappers:

```tsx
import { Edit, SimpleForm } from "@/components/admin";
import { AutomationRuleForm } from "./AutomationRuleForm";
import { AutomationRunsPanel } from "./AutomationRunsPanel";

export const AutomationEdit = () => (
  <Edit redirect="list">
    <div className="grid gap-6 p-4 md:grid-cols-[1fr_24rem] md:p-6">
      <SimpleForm>
        <AutomationRuleForm />
      </SimpleForm>
      <AutomationRunsPanel />
    </div>
  </Edit>
);
```

If `Edit` or `SimpleForm` import names differ, use the same wrappers used by `SalesEdit.tsx`.

- [x] **Step 7: Create runs panel**

Create `AutomationRunsPanel.tsx`:

```tsx
import { useGetList, useRecordContext } from "ra-core";
import { Card } from "@/components/ui/card";
import type { AutomationRule, AutomationRun } from "../types";

export const AutomationRunsPanel = () => {
  const rule = useRecordContext<AutomationRule>();
  const { data = [] } = useGetList<AutomationRun>(
    "automation_runs",
    {
      pagination: { page: 1, perPage: 10 },
      sort: { field: "created_at", order: "DESC" },
      filter: { rule_key: rule?.rule_key },
    },
    { enabled: !!rule?.rule_key },
  );

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold">Ultimas execucoes</h2>
      <div className="space-y-3">
        {data.map((run) => (
          <div key={run.id} className="border-b pb-3 text-sm last:border-b-0">
            <div className="font-medium">{run.status}</div>
            <div className="text-muted-foreground">{run.message}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(run.created_at).toLocaleString()}
            </div>
          </div>
        ))}
        {!data.length && (
          <div className="text-sm text-muted-foreground">
            Nenhuma execucao registrada.
          </div>
        )}
      </div>
    </Card>
  );
};
```

- [x] **Step 8: Register resource and settings link**

Create `automations/index.ts`:

```ts
import { AutomationEdit } from "./AutomationEdit";
import { AutomationList } from "./AutomationList";
import type { AutomationRule } from "../types";

export default {
  list: AutomationList,
  edit: AutomationEdit,
  recordRepresentation: (rule: AutomationRule) => rule.name,
};
```

In `CRM.tsx`:

```tsx
import automations from "../automations";

<Resource name="automation_rules" {...automations} />
<Resource name="automation_runs" />
```

Add a link in `SettingsPage.tsx` to `/automation_rules` for admins. Use existing settings card/list patterns and label `crm.settings.automations`.

---

## Task 9: Agenda And Dashboard Proposal Metrics

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/agendaUtils.test.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/agendaUtils.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/AgendaList.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/AgendaItem.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/commercialDashboardUtils.test.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/commercialDashboardUtils.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/ProposalSummary.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/Dashboard.tsx`

- [x] **Step 1: Add failing agenda test**

In `agendaUtils.test.ts`, add:

```ts
it("puts expired sent proposals into risk section", () => {
  const sections = buildAgendaSections(
    {
      tasks: [],
      leads: [],
      deals: [],
      proposals: [
        {
          id: 51,
          deal_id: 21,
          company_id: 1,
          contact_id: null,
          sales_id: 4,
          template_id: 1,
          number: "PROP-0051",
          title: "Proposta vencida",
          status: "sent",
          scope: "",
          terms: "",
          currency: "BRL",
          subtotal: 1000,
          discount_amount: 0,
          total: 1000,
          valid_until: "2026-05-19",
          sent_at: "2026-05-18T12:00:00.000Z",
          accepted_at: null,
          rejected_at: null,
          created_at: "2026-05-18T12:00:00.000Z",
          updated_at: "2026-05-18T12:00:00.000Z",
        },
      ],
    },
    now,
  );

  expect(sections.risks.map((item) => item.id)).toEqual(["proposal-51"]);
});
```

- [x] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/agenda/agendaUtils.test.ts
```

Expected: FAIL because `proposals` is not accepted by `buildAgendaSections`.

- [x] **Step 3: Extend agenda utilities**

In `agendaUtils.ts`, update types:

```ts
import type { Deal, Lead, Proposal, Task } from "../types";

export type AgendaItemKind = "task" | "lead" | "deal" | "proposal";
```

Add `proposals: Proposal[]` parameter with default at call sites.

Add proposal builder:

```ts
const buildProposalItem = (
  proposal: Proposal,
  now: Date,
): AgendaItem | null => {
  if (proposal.status !== "sent" || !proposal.valid_until) return null;
  const validUntil = new Date(`${proposal.valid_until}T23:59:59.999`);
  if (validUntil >= now) return null;
  return {
    id: `proposal-${proposal.id}`,
    kind: "proposal",
    recordId: proposal.id,
    title: proposal.title,
    context: proposal.number,
    dueAt: proposal.valid_until,
    salesId: proposal.sales_id ?? undefined,
    state: "stale",
    href: `/proposals/${proposal.id}/show`,
  };
};
```

Include proposal items in `items`.

- [x] **Step 4: Update Agenda UI fetch**

In `AgendaList.tsx`, fetch proposals:

```ts
const { data: proposals, isPending: isProposalsPending } = useGetList<Proposal>(
  "proposals",
  {
    pagination: { page: 1, perPage: PAGE_SIZE },
    sort: { field: "valid_until", order: "ASC" },
    filter: { ...filter, status: "sent" },
  },
  { enabled },
);
```

Pass `proposals: proposals ?? []` to `buildAgendaSections`. Include `isProposalsPending` in `isPending`.

In `AgendaItem.tsx`, add proposal icon:

```ts
proposal: FileText,
```

- [x] **Step 5: Add failing dashboard metrics test**

In `commercialDashboardUtils.test.ts`, add:

```ts
it("summarizes proposal metrics", () => {
  expect(
    summarizeProposals([
      proposal(1, "sent", 1000, "2026-05-19"),
      proposal(2, "accepted", 2000, "2026-05-30"),
      proposal(3, "rejected", 3000, "2026-05-30"),
    ], new Date("2026-05-20T12:00:00.000Z")),
  ).toEqual({
    openCount: 1,
    openAmount: 1000,
    acceptedCount: 1,
    acceptedAmount: 2000,
    expiredCount: 1,
    expiredAmount: 1000,
    acceptanceRate: 33,
  });
});
```

Add a local `proposal` test helper matching the `Proposal` type.

- [x] **Step 6: Implement proposal summary**

In `commercialDashboardUtils.ts`, add:

```ts
import type { Deal, Lead, Proposal, LeadStatus, Sale } from "../types";

export type ProposalSummary = {
  openCount: number;
  openAmount: number;
  acceptedCount: number;
  acceptedAmount: number;
  expiredCount: number;
  expiredAmount: number;
  acceptanceRate: number;
};

export const summarizeProposals = (
  proposals: readonly Proposal[],
  now = new Date(),
): ProposalSummary => {
  const summary: ProposalSummary = {
    openCount: 0,
    openAmount: 0,
    acceptedCount: 0,
    acceptedAmount: 0,
    expiredCount: 0,
    expiredAmount: 0,
    acceptanceRate: 0,
  };

  for (const proposal of proposals) {
    if (proposal.status === "sent") {
      summary.openCount += 1;
      summary.openAmount += proposal.total;
      if (
        proposal.valid_until &&
        new Date(`${proposal.valid_until}T23:59:59.999`) < now
      ) {
        summary.expiredCount += 1;
        summary.expiredAmount += proposal.total;
      }
    }
    if (proposal.status === "accepted") {
      summary.acceptedCount += 1;
      summary.acceptedAmount += proposal.total;
    }
  }

  const decided = proposals.filter((proposal) =>
    ["accepted", "rejected"].includes(proposal.status),
  ).length;
  summary.acceptanceRate =
    decided === 0 ? 0 : Math.round((summary.acceptedCount / decided) * 100);

  return summary;
};
```

- [x] **Step 7: Create dashboard component**

Create `ProposalSummary.tsx` using `useGetList<Proposal>("proposals")`, `summarizeProposals`, and the same compact card pattern as `LeadFunnelSummary`. Metrics:

- propostas abertas;
- valor em aberto;
- propostas aceitas;
- taxa de aceite;
- propostas vencidas;
- valor vencido.

Add `<ProposalSummary />` to `Dashboard.tsx` under `<LeadFunnelSummary />`.

- [x] **Step 8: Run focused tests**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/agenda/agendaUtils.test.ts src/components/atomic-crm/dashboard/commercialDashboardUtils.test.ts
```

Expected: PASS.

---

## Task 10: i18n

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/portugueseCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/i18nProvider.test.ts`

- [x] **Step 1: Add failing i18n test**

In `i18nProvider.test.ts`, add:

```ts
it("translates proposals and automation rules in pt-BR", async () => {
  await i18nProvider.changeLocale("pt-BR");

  expect(i18nProvider.translate("resources.proposals.name", { smart_count: 2 }))
    .toBe("Propostas");
  expect(i18nProvider.translate("resources.automation_rules.name", { smart_count: 2 }))
    .toBe("Automações");
});
```

- [x] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/providers/commons/i18nProvider.test.ts
```

Expected: FAIL because keys do not exist.

- [x] **Step 3: Add pt-BR keys**

In `portugueseCrmMessages.ts`, add under `resources`:

```ts
proposals: {
  name: "Proposta |||| Propostas",
  fields: {
    deal_id: "Negócio",
    company_id: "Empresa",
    contact_id: "Contato",
    sales_id: "Responsável",
    template_id: "Template",
    number: "Número",
    title: "Título",
    status: "Status",
    scope: "Escopo",
    terms: "Condições comerciais",
    currency: "Moeda",
    subtotal: "Subtotal",
    discount_amount: "Desconto",
    total: "Total",
    valid_until: "Validade",
    sent_at: "Enviada em",
    accepted_at: "Aceita em",
    rejected_at: "Recusada em",
    items: "Itens",
  },
  statuses: {
    draft: "Rascunho",
    sent: "Enviada",
    accepted: "Aceita",
    rejected: "Recusada",
    expired: "Expirada",
  },
  action: {
    new: "Nova proposta",
    generate: "Gerar proposta",
  },
  empty: {
    for_deal: "Nenhuma proposta neste negócio.",
  },
},
proposal_items: {
  fields: {
    description: "Descrição",
    quantity: "Quantidade",
    unit_price: "Valor unitário",
    discount_amount: "Desconto",
    total: "Total",
  },
},
automation_rules: {
  name: "Automação |||| Automações",
  fields: {
    enabled: "Ativa",
    name: "Nome",
    description: "Descrição",
    params: "Parâmetros",
  },
},
automation_runs: {
  name: "Execução |||| Execuções",
},
```

Add dashboard keys under `crm.dashboard`:

```ts
proposals: {
  title: "Propostas",
  open_count: "Abertas",
  open_amount: "Valor aberto",
  accepted_count: "Aceitas",
  acceptance_rate: "Taxa de aceite",
  expired_count: "Vencidas",
  expired_amount: "Valor vencido",
},
```

Add settings key:

```ts
settings: {
  automations: "Automações",
}
```

Merge with existing `settings` object instead of replacing it.

- [x] **Step 4: Add en/fr equivalents**

Add the same key structure in English and French. Use direct translations:

English:

- `Proposal |||| Proposals`
- `Automation |||| Automations`
- `Proposal items`
- `Proposal dashboard`

French:

- `Proposition |||| Propositions`
- `Automatisation |||| Automatisations`
- `Articles`
- `Propositions`

- [x] **Step 5: Run i18n test**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/providers/commons/i18nProvider.test.ts
```

Expected: PASS.

---

## Task 11: Verification And Smoke

**Files:**

- No new files.

- [x] **Step 1: Apply database migration**

Run:

```bash
npx supabase migration up --local
```

Expected: `Local database is up to date.`

- [x] **Step 2: Run app unit tests**

Run:

```bash
make test
```

Expected: all app and function tests pass.

- [x] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: exit code 0.

- [x] **Step 4: Run lint and prettier**

Run:

```bash
npm run lint
npm run prettier
```

Expected: lint exits 0. Prettier reports all files use Prettier style. Existing `.eslintignore` warning is acceptable if unchanged.

- [x] **Step 5: Build**

Run:

```bash
npm run build
```

Expected: build succeeds. Existing Vite chunk-size warning is acceptable if unchanged.

- [x] **Step 6: Browser smoke for proposal flow**

Use the current local app:

```text
http://localhost:5174/
```

Manual path:

1. Sign in with a local test user.
2. Open `/#/deals`.
3. Open an existing deal.
4. Click `Gerar proposta`.
5. Fill at least one item.
6. Save proposal.
7. Open proposal preview.
8. Mark proposal as `Enviada`.
9. Confirm a task was created from automation.

Database confirmation query:

```bash
docker exec supabase_db_atomic-crm-demo psql -U postgres -d postgres -Atc "select p.id,p.title,p.status,t.text,ar.rule_key from proposals p left join tasks t on t.deal_id=p.deal_id left join automation_runs ar on ar.id=t.automation_run_id where p.status='sent' order by p.id desc limit 5;"
```

Expected: a sent proposal appears with a task from `proposal.sent-follow-up`.

- [x] **Step 7: Browser smoke for automation screen**

Manual path:

1. Open settings.
2. Open `Automações`.
3. Disable `Proposta enviada`.
4. Send a second proposal.
5. Confirm no new `proposal.sent-follow-up` task is created.
6. Re-enable the rule.

Database confirmation query:

```bash
docker exec supabase_db_atomic-crm-demo psql -U postgres -d postgres -Atc "select rule_key,enabled,params from automation_rules order by id;"
```

Expected: edited rule persists and `enabled` reflects the UI.

- [x] **Step 8: Browser smoke for Agenda and Dashboard**

Manual path:

1. Create or update a sent proposal with `valid_until` before today.
2. Open `/#/agenda`.
3. Confirm the proposal appears in `Riscos`.
4. Open `/#/`.
5. Confirm the proposal dashboard shows open, accepted, and expired metrics.

Expected: no console errors and no untranslated keys such as `resources.proposals`.

## Self-Review Checklist

- Spec coverage: proposals, proposal items, proposal preview, automation rules, automation runs, Agenda, Dashboard, Supabase, FakeRest, i18n, and verification all have tasks.
- Placeholder scan: avoid unfinished markers and vague implementation steps.
- Type consistency: proposal field names match database schema and TypeScript types; automation rule params match engine usage.
- Scope: PDF export, campaign actions, WhatsApp/email sending, cron jobs, visual workflow builder, and product catalog remain outside this phase.
