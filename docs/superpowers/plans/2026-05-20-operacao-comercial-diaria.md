# Operacao Comercial Diaria Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Agenda Comercial, stronger commercial dashboard, and MVP internal automations for Atomic CRM.

**Architecture:** Extend the existing `tasks`, `leads`, and `deals` resources instead of creating a parallel activity system. Add a small automation engine in shared provider utilities, trigger it from Supabase/FakeRest lifecycle hooks, and expose agenda/dashboard data through focused frontend utility functions and React components. Keep automation rules internal/static in this phase, while storing `automation_runs` for traceability and duplicate prevention.

**Tech Stack:** React 19, TypeScript, Vite, ra-core, shadcn-admin-kit, shadcn/ui, Tailwind CSS v4, Supabase/Postgres, FakeRest, Vitest.

---

## Scope

Included:

- `tasks` can point to contacts, leads, or deals;
- new `automation_runs` table;
- automatic first-contact/follow-up tasks;
- Agenda page with commercial work items;
- stronger dashboard sections for seller and manager;
- FakeRest support;
- pt-BR/en/fr i18n;
- tests for agenda grouping, dashboard metrics, and automations.

Not included:

- proposal entities;
- user-editable automation builder;
- background cron jobs;
- email/WhatsApp/campaign actions;
- advanced SQL aggregate views.

---

## File Structure

Modify:

- `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/01_tables.sql`
- `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/04_triggers.sql`
- `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/05_policies.sql`
- `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/06_grants.sql`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/types.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/supabase/dataProvider.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataProvider.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/types.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/index.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/tasks.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/tasks/Task.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/tasks/TaskFormContent.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/tasks/TasksListByDueDate.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/Dashboard.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/SellerDailyCockpit.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/SalesManagerSummary.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/CRM.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/layout/Header.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/layout/MobileNavigation.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/portugueseCrmMessages.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`

Create:

- `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/migrations/20260520013000_commercial_agenda_automations.sql`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/automationEngine.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/automationEngine.test.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/agendaUtils.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/agendaUtils.test.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/AgendaList.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/AgendaItem.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/index.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/commercialDashboardUtils.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/commercialDashboardUtils.test.ts`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/LeadFunnelSummary.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/DealRiskSummary.tsx`
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/automationRuns.ts`

---

## Task 1: Database Model

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/01_tables.sql`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/05_policies.sql`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/06_grants.sql`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/migrations/20260520013000_commercial_agenda_automations.sql`

- [ ] **Step 1: Update declarative schema**

Change `tasks`:

```sql
create table public.tasks (
    id bigint generated by default as identity primary key,
    contact_id bigint,
    lead_id bigint,
    deal_id bigint,
    automation_run_id bigint,
    type text,
    text text,
    due_date timestamp with time zone,
    done_date timestamp with time zone,
    sales_id bigint,
    constraint tasks_has_context_check check (
        contact_id is not null
        or lead_id is not null
        or deal_id is not null
    )
);
```

Add `automation_runs` before `tasks` foreign keys:

```sql
create table public.automation_runs (
    id bigint generated by default as identity primary key,
    created_at timestamp with time zone not null default now(),
    rule_key text not null,
    trigger_resource text not null,
    trigger_record_id bigint not null,
    action_resource text,
    action_record_id bigint,
    status text not null default 'success',
    message text,
    sales_id bigint,
    constraint automation_runs_status_check check (status in ('success', 'skipped', 'failed'))
);

create unique index automation_runs_rule_trigger_idx
    on public.automation_runs using btree (rule_key, trigger_resource, trigger_record_id);
```

Add foreign keys:

```sql
alter table public.automation_runs
    add constraint automation_runs_sales_id_fkey foreign key (sales_id) references public.sales(id);

alter table public.tasks
    add constraint tasks_lead_id_fkey foreign key (lead_id) references public.leads(id) on update cascade on delete cascade;

alter table public.tasks
    add constraint tasks_deal_id_fkey foreign key (deal_id) references public.deals(id) on update cascade on delete cascade;

alter table public.tasks
    add constraint tasks_automation_run_id_fkey foreign key (automation_run_id) references public.automation_runs(id);
```

- [ ] **Step 2: Add RLS and grants**

Add RLS:

```sql
alter table public.automation_runs enable row level security;

create policy "Enable read access for authenticated users" on public.automation_runs for select to authenticated using (true);
create policy "Enable insert for authenticated users only" on public.automation_runs for insert to authenticated with check (true);
create policy "Enable update for authenticated users only" on public.automation_runs for update to authenticated using (true) with check (true);
```

Add grants:

```sql
grant all on table public.automation_runs to anon;
grant all on table public.automation_runs to authenticated;
grant all on table public.automation_runs to service_role;

grant all on sequence public.automation_runs_id_seq to anon;
grant all on sequence public.automation_runs_id_seq to authenticated;
grant all on sequence public.automation_runs_id_seq to service_role;
```

- [ ] **Step 3: Create migration**

Create a manual migration mirroring the schema changes. Include:

```sql
alter table "public"."tasks" alter column "contact_id" drop not null;
alter table "public"."tasks" add column "lead_id" bigint;
alter table "public"."tasks" add column "deal_id" bigint;
alter table "public"."tasks" add column "automation_run_id" bigint;
```

Then add the table, constraints, indexes, RLS, policies, and grants above.

- [ ] **Step 4: Apply migration**

Run:

```bash
npx supabase migration up --local
```

Expected: local database is up to date.

---

## Task 2: Types And FakeRest Data

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/types.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/types.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/automationRuns.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/index.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/tasks.ts`

- [ ] **Step 1: Extend task and add automation types**

In `types.ts`, update `Task`:

```ts
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
} & Pick<RaRecord, "id">;
```

Add:

```ts
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
} & Pick<RaRecord, "id">;
```

- [ ] **Step 2: Update FakeRest DB shape**

Add `automation_runs: AutomationRun[]` to `Db`.

- [ ] **Step 3: Seed automation runs**

Create `automationRuns.ts`:

```ts
import type { AutomationRun } from "../../../types";

export const generateAutomationRuns = (): AutomationRun[] => [];
```

- [ ] **Step 4: Update task generator**

Keep most tasks contact-based, but allow occasional lead/deal tasks:

```ts
const lead = datatype.boolean() ? random.arrayElement(db.leads) : null;
const deal = !lead && datatype.boolean() ? random.arrayElement(db.deals) : null;
const contact = !lead && !deal ? random.arrayElement(db.contacts) : null;
```

Set:

```ts
contact_id: contact?.id ?? null,
lead_id: lead?.id ?? null,
deal_id: deal?.id ?? null,
automation_run_id: null,
sales_id: contact?.sales_id ?? lead?.sales_id ?? deal?.sales_id ?? 0,
```

---

## Task 3: Automation Engine Tests

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/automationEngine.test.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/automationEngine.ts`

- [ ] **Step 1: Write tests**

Test these behaviors:

```ts
it("creates a first contact task when a new lead has no next action");
it("does not create duplicate task when an automation run already exists");
it("creates a deal follow-up task when a deal has no next action");
it("creates a proposal follow-up when a deal moves to proposal-sent");
```

Use a mocked `dataProvider` with `getList`, `create`, and `update`.

- [ ] **Step 2: Implement engine API**

Create:

```ts
export type AutomationContext = {
  dataProvider: Pick<DataProvider, "getList" | "create" | "update">;
  now?: Date;
};

export const runLeadCreatedAutomations = async (
  lead: Lead,
  context: AutomationContext,
) => {};

export const runDealCreatedAutomations = async (
  deal: Deal,
  context: AutomationContext,
) => {};

export const runDealUpdatedAutomations = async (
  deal: Deal,
  previousDeal: Deal,
  context: AutomationContext,
) => {};
```

- [ ] **Step 3: Add duplicate guard**

Implement:

```ts
const hasAutomationRun = async (dataProvider, ruleKey, resource, recordId) => {
  const { total } = await dataProvider.getList("automation_runs", {
    filter: {
      rule_key: ruleKey,
      trigger_resource: resource,
      trigger_record_id: recordId,
    },
    pagination: { page: 1, perPage: 1 },
    sort: { field: "id", order: "ASC" },
  });
  return Boolean(total);
};
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/providers/commons/automationEngine.test.ts
```

Expected: all automation tests pass.

---

## Task 4: Wire Automations Into Providers

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/supabase/dataProvider.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataProvider.ts`

- [ ] **Step 1: Import automation functions**

```ts
import {
  runDealCreatedAutomations,
  runDealUpdatedAutomations,
  runLeadCreatedAutomations,
} from "../commons/automationEngine";
```

- [ ] **Step 2: Supabase lifecycle**

Add to `leads` callbacks:

```ts
afterCreate: async (result, dataProvider) => {
  await runLeadCreatedAutomations(result.data, { dataProvider });
  return result;
},
```

Add to `deals` callbacks:

```ts
afterCreate: async (result, dataProvider) => {
  await runDealCreatedAutomations(result.data, { dataProvider });
  return result;
},
afterUpdate: async (result, dataProvider) => {
  await runDealUpdatedAutomations(result.data, result.previousData, { dataProvider });
  return result;
},
```

- [ ] **Step 3: FakeRest lifecycle**

Add the same callbacks in FakeRest. Preserve existing company count updates for deals by running both operations.

- [ ] **Step 4: Verify no duplicate tasks**

Create a lead without `next_action_at`, then save it twice. Confirm only one automation task exists for the lead.

---

## Task 5: Agenda Utilities

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/agendaUtils.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/agendaUtils.test.ts`

- [ ] **Step 1: Define agenda item type**

```ts
export type AgendaItemKind = "task" | "lead" | "deal";
export type AgendaItemUrgency = "overdue" | "today" | "upcoming" | "missing_next_action" | "stale";

export type AgendaItem = {
  id: string;
  kind: AgendaItemKind;
  urgency: AgendaItemUrgency;
  title: string;
  subtitle?: string;
  dueDate?: string | null;
  href: string;
  salesId?: Identifier;
};
```

- [ ] **Step 2: Test grouping**

Test:

```ts
expect(groupAgendaItems(items).overdue).toHaveLength(1);
expect(groupAgendaItems(items).today).toHaveLength(1);
expect(groupAgendaItems(items).risks).toHaveLength(2);
expect(groupAgendaItems(items).upcoming).toHaveLength(1);
```

- [ ] **Step 3: Implement builders**

Implement:

```ts
export const buildTaskAgendaItems = (tasks: Task[], now = new Date()): AgendaItem[] => {};
export const buildLeadAgendaItems = (leads: Lead[], now = new Date()): AgendaItem[] => {};
export const buildDealAgendaItems = (deals: Deal[], now = new Date()): AgendaItem[] => {};
export const groupAgendaItems = (items: AgendaItem[]) => ({ overdue: [], today: [], risks: [], upcoming: [] });
```

Use same closed stages as deal utilities: `won`, `lost`.

---

## Task 6: Agenda Page

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/AgendaList.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/AgendaItem.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/agenda/index.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/CRM.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/layout/Header.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/layout/MobileNavigation.tsx`

- [ ] **Step 1: Fetch agenda data**

In `AgendaList.tsx`, call:

```ts
useGetList<Task>("tasks", { filter: { "done_date@is": null, sales_id: identity?.id }, pagination: { page: 1, perPage: 500 }, sort: { field: "due_date", order: "ASC" } });
useGetList<Lead>("leads", { filter: { sales_id: identity?.id }, pagination: { page: 1, perPage: 500 }, sort: { field: "updated_at", order: "DESC" } });
useGetList<Deal>("deals", { filter: { "archived_at@is": null, sales_id: identity?.id }, pagination: { page: 1, perPage: 500 }, sort: { field: "updated_at", order: "DESC" } });
```

- [ ] **Step 2: Render sections**

Sections:

- atrasados;
- hoje;
- riscos;
- proximos.

Each section uses `AgendaItem`.

- [ ] **Step 3: Register resource/route**

Register:

```tsx
<Resource name="agenda" list={AgendaList} />
```

Add navigation links to `/#/agenda`.

---

## Task 7: Task UI Supports Lead/Deal Context

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/tasks/TaskFormContent.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/tasks/Task.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/tasks/TasksListByDueDate.tsx`

- [ ] **Step 1: Make contact optional**

Remove `required()` from contact selection when `selectContact` is true.

- [ ] **Step 2: Add optional lead/deal selectors**

Add:

```tsx
<ReferenceInput source="lead_id" reference="leads">
  <AutocompleteInput label="resources.tasks.fields.lead_id" optionText={leadOptionText} helperText={false} modal />
</ReferenceInput>

<ReferenceInput source="deal_id" reference="deals">
  <AutocompleteInput label="resources.tasks.fields.deal_id" helperText={false} modal />
</ReferenceInput>
```

- [ ] **Step 3: Render task context**

In `Task.tsx`, show:

- `Ref.: contato` when `contact_id`;
- `Lead: nome` when `lead_id`;
- `Negocio: nome` when `deal_id`.

Use `ReferenceField` and link to the related record.

---

## Task 8: Dashboard Metrics Utilities

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/commercialDashboardUtils.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/commercialDashboardUtils.test.ts`

- [ ] **Step 1: Test metrics**

Test:

```ts
expect(summarizeLeads(leads).newCount).toBe(2);
expect(summarizeLeads(leads).conversionRate).toBe(50);
expect(summarizeDealsByStage(deals).find(stage => stage.stage === "proposal-sent")?.staleCount).toBe(1);
expect(rankSalesByDeals(deals).at(0)?.salesId).toBe(2);
```

- [ ] **Step 2: Implement**

Exports:

```ts
export const summarizeLeads = (leads: Lead[]) => {};
export const summarizeDealsByStage = (deals: Deal[]) => {};
export const summarizeLostReasons = (deals: Deal[]) => {};
export const rankSalesByDeals = (deals: Deal[]) => {};
```

Reuse `getWeightedAmount` and `isDealStale` from `dealCommercialUtils`.

---

## Task 9: Dashboard Components

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/LeadFunnelSummary.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/DealRiskSummary.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/SellerDailyCockpit.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/SalesManagerSummary.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/Dashboard.tsx`

- [ ] **Step 1: Lead funnel component**

Show:

- novos;
- contatados;
- qualificados;
- convertidos;
- taxa de conversao.

- [ ] **Step 2: Deal risk component**

Show:

- sem proxima acao;
- parados;
- por etapa;
- principais motivos de perda.

- [ ] **Step 3: Seller cockpit uses agenda counts**

Update seller cockpit to include:

- leads sem proxima acao;
- leads quentes;
- follow-ups vencidos.

- [ ] **Step 4: Dashboard layout**

Keep three-column operational layout. Replace `HotContacts` prominence with lead/deal operational widgets.

---

## Task 10: i18n

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/portugueseCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`

- [ ] **Step 1: Add agenda keys**

Add:

```ts
agenda: {
  title: "Agenda Comercial",
  sections: {
    overdue: "Atrasados",
    today: "Hoje",
    risks: "Riscos",
    upcoming: "Proximos",
  },
  empty: "Nada pendente por agora",
}
```

- [ ] **Step 2: Add automation/dashboard keys**

Add labels for:

- leads pendentes;
- leads quentes;
- taxa de conversao;
- negocios parados por etapa;
- motivos de perda;
- ranking por vendedor;
- automacao criada.

- [ ] **Step 3: Run i18n test**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/providers/commons/i18nProvider.test.ts
```

---

## Task 11: Verification

- [ ] **Step 1: Unit tests**

Run:

```bash
npm run test:unit:app -- \
  src/components/atomic-crm/providers/commons/automationEngine.test.ts \
  src/components/atomic-crm/agenda/agendaUtils.test.ts \
  src/components/atomic-crm/dashboard/commercialDashboardUtils.test.ts \
  src/components/atomic-crm/providers/commons/i18nProvider.test.ts
```

- [ ] **Step 2: Full checks**

Run:

```bash
npm run typecheck
npm run lint
npm run prettier
npm run build
```

- [ ] **Step 3: Local Supabase smoke**

Run:

```bash
npx supabase migration up --local
```

Then manually verify:

- create lead without `next_action_at`;
- confirm first-contact task exists;
- open `http://localhost:5174/#/agenda`;
- create deal without `next_action_at`;
- confirm follow-up task exists;
- move deal to `proposal-sent`;
- confirm proposal follow-up task exists;
- open dashboard and confirm lead/deal metrics changed.

---

## Risk Notes

- `tasks.contact_id` becoming nullable touches existing code that assumes contact tasks. Review `Task.tsx`, `TaskCreateSheet`, `AddTask`, and FakeRest callbacks carefully.
- Automation duplicate prevention depends on `automation_runs_rule_trigger_idx`.
- Event-based automations do not replace future cron jobs for “stale after 3 days”; agenda/dashboard can still surface stale records based on dates.
- Because this directory is not a Git repo, commit steps cannot be executed unless the project is initialized or moved into Git.
