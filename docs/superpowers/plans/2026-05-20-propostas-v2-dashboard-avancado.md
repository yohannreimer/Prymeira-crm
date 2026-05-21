# Propostas V2 e Dashboard Comercial Avancado Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add proposal templates, duplication, printable proposal output, deal proposal history, sales goals, and an advanced commercial dashboard for Atomic CRM.

**Architecture:** Keep proposals, templates, goals, and dashboard metrics as normal CRM resources backed by Supabase and mirrored in FakeRest. Put business rules in pure tested utilities before wiring UI, then keep UI components focused on orchestration and display. Implement Fase 4A first, because templates and richer proposals feed the Fase 4B dashboard metrics.

**Tech Stack:** React 19, TypeScript, Vite, ra-core, shadcn-admin-kit, shadcn/ui, Tailwind CSS v4, Supabase/PostgreSQL, FakeRest, Vitest, Playwright/browser smoke.

---

## Source Spec

- `/Users/yohannreimer/Downloads/atomic-crm-main/docs/superpowers/specs/2026-05-20-propostas-v2-dashboard-avancado-design.md`

## Execution Notes

- The current workspace copy has no `.git` directory. Each task includes a checkpoint command that commits only when `.git` exists and otherwise prints a checkpoint marker.
- Use schema files in `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/` as the source of truth. The migration is created manually for this local plan because prior work already used a hand-authored migration.
- Keep all user-facing strings in pt-BR in `portugueseCrmMessages.ts`, and keep English/French message keys populated enough to avoid raw key rendering.
- Run focused tests at the end of each task. Run the full verification in Task 14.

## File Structure

### Database

- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/01_tables.sql`
  - Add `proposal_template_items`.
  - Add `sales_goals`.
  - Add richer proposal fields: `internal_notes`, `delivery_time`, `payment_terms`, `tax_amount`.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/05_policies.sql`
  - Add RLS for template items and sales goals.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/06_grants.sql`
  - Add grants for new tables and sequences.
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/migrations/20260520040000_proposals_v2_dashboard.sql`
  - Apply the same schema changes to local databases.

### Types And FakeRest

- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/types.ts`
  - Add `ProposalTemplateItem`, `SalesGoal`, and new proposal fields.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/types.ts`
  - Add `proposal_template_items` and `sales_goals`.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/index.ts`
  - Seed new generated resources.
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/proposalTemplateItems.ts`
  - Seed default items for proposal templates.
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/salesGoals.ts`
  - Seed monthly goals for demo users.

### Proposal V2 Utilities

- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/proposalUtils.ts`
  - Add tax-aware totals.
  - Add template application.
  - Add duplication payload builder.
  - Add print URL helper.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/proposalUtils.test.ts`
  - Cover new totals, template application, and duplication.

### Proposal Templates UI

- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposal-templates/index.ts`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposal-templates/ProposalTemplateList.tsx`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposal-templates/ProposalTemplateCreate.tsx`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposal-templates/ProposalTemplateEdit.tsx`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposal-templates/ProposalTemplateInputs.tsx`
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/CRM.tsx`
  - Register `proposal_templates` and `proposal_template_items`.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/settings/SettingsPage.tsx`
  - Link to proposal templates from settings.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/canAccess.ts`
  - Restrict proposal template management to admins.

### Proposal Form, Duplicate, And Print

- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalInputs.tsx`
  - Add template selector and richer commercial fields.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalItemsInput.tsx`
  - Keep item editing stable with template-filled rows.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalCreate.tsx`
  - Apply selected template.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalEdit.tsx`
  - Persist richer fields and tax-aware totals.
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalActions.tsx`
  - Shared duplicate and print/export actions.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalShow.tsx`
  - Add actions and route-aware print mode.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalPreview.tsx`
  - Improve commercial layout and print CSS.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/DealProposalsPanel.tsx`
  - Upgrade proposal history inside deals.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealShow.tsx`
  - Keep the panel visible and action rich.

### Dashboard Advanced

- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/sales-goals/index.ts`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/sales-goals/SalesGoalList.tsx`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/sales-goals/SalesGoalCreate.tsx`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/sales-goals/SalesGoalEdit.tsx`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/sales-goals/SalesGoalInputs.tsx`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/advancedCommercialDashboardUtils.ts`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/advancedCommercialDashboardUtils.test.ts`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/GoalProgressSummary.tsx`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/RevenueForecastSummary.tsx`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/FunnelConversionSummary.tsx`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/PipelineAgingSummary.tsx`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/AdvancedSellerRanking.tsx`
- Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/LossReasonSummary.tsx`
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/Dashboard.tsx`
  - Compose the advanced widgets.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/CRM.tsx`
  - Register `sales_goals`.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/settings/SettingsPage.tsx`
  - Link to sales goals from settings.
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/canAccess.ts`
  - Restrict sales goal management to admins.

### I18n And Test Harness

- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/portugueseCrmMessages.ts`
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/i18nProvider.test.ts`
- Modify `/Users/yohannreimer/Downloads/atomic-crm-main/src/test/StoryWrapper.tsx`

---

## Task 1: Database Model For Proposal Templates V2 And Sales Goals

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/01_tables.sql`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/05_policies.sql`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/06_grants.sql`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/migrations/20260520040000_proposals_v2_dashboard.sql`

- [ ] **Step 1: Update declarative tables**

In `01_tables.sql`, add these fields to `public.proposals` after `terms`:

```sql
    internal_notes text,
    delivery_time text,
    payment_terms text,
```

Add this field after `discount_amount`:

```sql
    tax_amount bigint not null default 0,
```

Replace the proposal amount check with:

```sql
    constraint proposals_amounts_check check (subtotal >= 0 and discount_amount >= 0 and tax_amount >= 0 and total >= 0)
```

Add `proposal_template_items` after `proposal_templates`:

```sql
create table public.proposal_template_items (
    id bigint generated by default as identity primary key,
    template_id bigint not null,
    description text not null,
    quantity numeric not null default 1,
    unit_price bigint not null default 0,
    discount_amount bigint not null default 0,
    index smallint not null default 0,
    constraint proposal_template_items_amounts_check check (quantity > 0 and unit_price >= 0 and discount_amount >= 0)
);
```

Add `sales_goals` after `sales` or before `tags`:

```sql
create table public.sales_goals (
    id bigint generated by default as identity primary key,
    sales_id bigint not null,
    period_start date not null,
    revenue_goal bigint not null default 0,
    won_deals_goal integer not null default 0,
    sent_proposals_goal integer not null default 0,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint sales_goals_values_check check (revenue_goal >= 0 and won_deals_goal >= 0 and sent_proposals_goal >= 0),
    constraint sales_goals_month_start_check check (period_start = date_trunc('month', period_start)::date)
);
```

- [ ] **Step 2: Add foreign keys and indexes**

In the foreign key section of `01_tables.sql`, add:

```sql
alter table public.proposal_template_items
    add constraint proposal_template_items_template_id_fkey foreign key (template_id) references public.proposal_templates(id) on update cascade on delete cascade;

alter table public.sales_goals
    add constraint sales_goals_sales_id_fkey foreign key (sales_id) references public.sales(id) on update cascade on delete cascade;
```

In the index section of `01_tables.sql`, add:

```sql
create index proposal_template_items_template_id_idx on public.proposal_template_items using btree (template_id);
create index sales_goals_sales_id_idx on public.sales_goals using btree (sales_id);
create unique index sales_goals_sales_period_idx on public.sales_goals using btree (sales_id, period_start);
```

- [ ] **Step 3: Add RLS policies**

In `05_policies.sql`, enable RLS:

```sql
alter table public.proposal_template_items enable row level security;
alter table public.sales_goals enable row level security;
```

Add policies:

```sql
create policy "Enable read access for authenticated users" on public.proposal_template_items for select to authenticated using (true);
create policy "Enable insert for admins" on public.proposal_template_items for insert to authenticated with check (public.is_admin());
create policy "Enable update for admins" on public.proposal_template_items for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Proposal Template Items Delete Policy" on public.proposal_template_items for delete to authenticated using (public.is_admin());

create policy "Enable read access for authenticated users" on public.sales_goals for select to authenticated using (true);
create policy "Enable insert for admins" on public.sales_goals for insert to authenticated with check (public.is_admin());
create policy "Enable update for admins" on public.sales_goals for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Sales Goals Delete Policy" on public.sales_goals for delete to authenticated using (public.is_admin());
```

- [ ] **Step 4: Add grants**

In `06_grants.sql`, add table grants:

```sql
grant all on table public.proposal_template_items to anon;
grant all on table public.proposal_template_items to authenticated;
grant all on table public.proposal_template_items to service_role;

grant all on table public.sales_goals to anon;
grant all on table public.sales_goals to authenticated;
grant all on table public.sales_goals to service_role;
```

Add sequence grants:

```sql
grant all on sequence public.proposal_template_items_id_seq to anon;
grant all on sequence public.proposal_template_items_id_seq to authenticated;
grant all on sequence public.proposal_template_items_id_seq to service_role;

grant all on sequence public.sales_goals_id_seq to anon;
grant all on sequence public.sales_goals_id_seq to authenticated;
grant all on sequence public.sales_goals_id_seq to service_role;
```

- [ ] **Step 5: Create matching migration**

Create `20260520040000_proposals_v2_dashboard.sql` with:

```sql
alter table public.proposals
    add column if not exists internal_notes text,
    add column if not exists delivery_time text,
    add column if not exists payment_terms text,
    add column if not exists tax_amount bigint not null default 0;

alter table public.proposals drop constraint if exists proposals_amounts_check;
alter table public.proposals
    add constraint proposals_amounts_check check (subtotal >= 0 and discount_amount >= 0 and tax_amount >= 0 and total >= 0);

create table if not exists public.proposal_template_items (
    id bigint generated by default as identity primary key,
    template_id bigint not null,
    description text not null,
    quantity numeric not null default 1,
    unit_price bigint not null default 0,
    discount_amount bigint not null default 0,
    index smallint not null default 0,
    constraint proposal_template_items_amounts_check check (quantity > 0 and unit_price >= 0 and discount_amount >= 0)
);

alter table public.proposal_template_items drop constraint if exists proposal_template_items_template_id_fkey;
alter table public.proposal_template_items
    add constraint proposal_template_items_template_id_fkey foreign key (template_id) references public.proposal_templates(id) on update cascade on delete cascade;

create index if not exists proposal_template_items_template_id_idx on public.proposal_template_items using btree (template_id);

create table if not exists public.sales_goals (
    id bigint generated by default as identity primary key,
    sales_id bigint not null,
    period_start date not null,
    revenue_goal bigint not null default 0,
    won_deals_goal integer not null default 0,
    sent_proposals_goal integer not null default 0,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint sales_goals_values_check check (revenue_goal >= 0 and won_deals_goal >= 0 and sent_proposals_goal >= 0),
    constraint sales_goals_month_start_check check (period_start = date_trunc('month', period_start)::date)
);

alter table public.sales_goals drop constraint if exists sales_goals_sales_id_fkey;
alter table public.sales_goals
    add constraint sales_goals_sales_id_fkey foreign key (sales_id) references public.sales(id) on update cascade on delete cascade;

create index if not exists sales_goals_sales_id_idx on public.sales_goals using btree (sales_id);
create unique index if not exists sales_goals_sales_period_idx on public.sales_goals using btree (sales_id, period_start);

alter table public.proposal_template_items enable row level security;
alter table public.sales_goals enable row level security;

drop policy if exists "Enable read access for authenticated users" on public.proposal_template_items;
drop policy if exists "Enable insert for admins" on public.proposal_template_items;
drop policy if exists "Enable update for admins" on public.proposal_template_items;
drop policy if exists "Proposal Template Items Delete Policy" on public.proposal_template_items;

create policy "Enable read access for authenticated users" on public.proposal_template_items for select to authenticated using (true);
create policy "Enable insert for admins" on public.proposal_template_items for insert to authenticated with check (public.is_admin());
create policy "Enable update for admins" on public.proposal_template_items for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Proposal Template Items Delete Policy" on public.proposal_template_items for delete to authenticated using (public.is_admin());

drop policy if exists "Enable read access for authenticated users" on public.sales_goals;
drop policy if exists "Enable insert for admins" on public.sales_goals;
drop policy if exists "Enable update for admins" on public.sales_goals;
drop policy if exists "Sales Goals Delete Policy" on public.sales_goals;

create policy "Enable read access for authenticated users" on public.sales_goals for select to authenticated using (true);
create policy "Enable insert for admins" on public.sales_goals for insert to authenticated with check (public.is_admin());
create policy "Enable update for admins" on public.sales_goals for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Sales Goals Delete Policy" on public.sales_goals for delete to authenticated using (public.is_admin());

grant all on table public.proposal_template_items to anon;
grant all on table public.proposal_template_items to authenticated;
grant all on table public.proposal_template_items to service_role;
grant all on table public.sales_goals to anon;
grant all on table public.sales_goals to authenticated;
grant all on table public.sales_goals to service_role;
grant all on sequence public.proposal_template_items_id_seq to anon;
grant all on sequence public.proposal_template_items_id_seq to authenticated;
grant all on sequence public.proposal_template_items_id_seq to service_role;
grant all on sequence public.sales_goals_id_seq to anon;
grant all on sequence public.sales_goals_id_seq to authenticated;
grant all on sequence public.sales_goals_id_seq to service_role;
```

- [ ] **Step 6: Apply migration locally**

Run:

```bash
npx supabase migration up --local
```

Expected: exits 0 and says local database is up to date after applying the new migration.

- [ ] **Step 7: Verify database shape**

Run:

```bash
docker exec supabase_db_atomic-crm-demo psql -U postgres -d postgres -Atc "select column_name from information_schema.columns where table_schema='public' and table_name='proposals' and column_name in ('internal_notes','delivery_time','payment_terms','tax_amount') order by column_name; select table_name from information_schema.tables where table_schema='public' and table_name in ('proposal_template_items','sales_goals') order by table_name;"
```

Expected output includes:

```text
delivery_time
internal_notes
payment_terms
tax_amount
proposal_template_items
sales_goals
```

- [ ] **Step 8: Checkpoint**

Run:

```bash
if test -d .git; then git add supabase/schemas supabase/migrations/20260520040000_proposals_v2_dashboard.sql && git commit -m "feat: add proposal v2 and goal tables"; else printf "checkpoint: database model for proposals v2 and goals\n"; fi
```

Expected: commit is created when this is a git repo; otherwise prints the checkpoint marker.

---

## Task 2: Types And FakeRest Seeds

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/types.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/types.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/index.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/proposalTemplateItems.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/salesGoals.ts`

- [ ] **Step 1: Extend TypeScript domain types**

In `types.ts`, add `ProposalTemplateItem` after `ProposalTemplate`:

```ts
export type ProposalTemplateItem = {
  template_id: Identifier;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  index: number;
} & Pick<RaRecord, "id">;
```

Extend `Proposal` with:

```ts
  internal_notes?: string | null;
  delivery_time?: string | null;
  payment_terms?: string | null;
  tax_amount: number;
```

Add `SalesGoal` after `Sale`:

```ts
export type SalesGoal = {
  sales_id: Identifier;
  period_start: string;
  revenue_goal: number;
  won_deals_goal: number;
  sent_proposals_goal: number;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id">;
```

- [ ] **Step 2: Extend FakeRest DB type**

In `dataGenerator/types.ts`, import `ProposalTemplateItem` and `SalesGoal`, then add:

```ts
  proposal_template_items: ProposalTemplateItem[];
  sales_goals: SalesGoal[];
```

- [ ] **Step 3: Seed proposal template items**

Create `proposalTemplateItems.ts`:

```ts
import type { ProposalTemplateItem } from "../../../types";

export const generateProposalTemplateItems = (): ProposalTemplateItem[] => [
  {
    id: 1,
    template_id: 1,
    description: "Diagnostico comercial e configuracao inicial",
    quantity: 1,
    unit_price: 350000,
    discount_amount: 0,
    index: 0,
  },
  {
    id: 2,
    template_id: 1,
    description: "Treinamento da equipe",
    quantity: 1,
    unit_price: 180000,
    discount_amount: 0,
    index: 1,
  },
];
```

- [ ] **Step 4: Seed sales goals**

Create `salesGoals.ts`:

```ts
import type { SalesGoal } from "../../../types";

export const generateSalesGoals = (): SalesGoal[] => [
  {
    id: 1,
    sales_id: 1,
    period_start: "2026-05-01",
    revenue_goal: 5000000,
    won_deals_goal: 5,
    sent_proposals_goal: 10,
    created_at: "2026-05-20T00:00:00.000Z",
    updated_at: "2026-05-20T00:00:00.000Z",
  },
];
```

- [ ] **Step 5: Wire generators**

In `dataGenerator/index.ts`, import:

```ts
import { generateProposalTemplateItems } from "./proposalTemplateItems";
import { generateSalesGoals } from "./salesGoals";
```

Set the generated collections next to proposals/templates:

```ts
  db.proposal_template_items = generateProposalTemplateItems();
  db.sales_goals = generateSalesGoals();
```

- [ ] **Step 6: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: exits 0.

- [ ] **Step 7: Checkpoint**

Run:

```bash
if test -d .git; then git add src/components/atomic-crm/types.ts src/components/atomic-crm/providers/fakerest/dataGenerator && git commit -m "feat: seed proposal templates and sales goals"; else printf "checkpoint: types and fakerest seeds\n"; fi
```

---

## Task 3: Proposal Utility Tests And Implementation

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/proposalUtils.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/proposalUtils.test.ts`

- [ ] **Step 1: Write failing tests for tax-aware totals**

Append tests to `proposalUtils.test.ts`:

```ts
it("adds tax amount after item discounts", () => {
  const result = calculateProposalTotals([item(1, 1, 10000, 1000)], 900);

  expect(result).toEqual({
    items: [
      expect.objectContaining({
        total: 9000,
      }),
    ],
    subtotal: 10000,
    discountAmount: 1000,
    taxAmount: 900,
    total: 9900,
  });
});

it("clamps negative tax to zero", () => {
  expect(calculateProposalTotals([item(1, 1, 10000)], -500).taxAmount).toBe(0);
});
```

- [ ] **Step 2: Write failing tests for template application**

Add imports for `ProposalTemplate` and `ProposalTemplateItem`, then add:

```ts
const template = (): ProposalTemplate => ({
  id: 1,
  name: "Implantacao",
  description: "Template",
  default_scope: "Escopo padrao",
  default_terms: "Condicoes padrao",
  active: true,
  created_at: "2026-05-20T00:00:00.000Z",
  updated_at: "2026-05-20T00:00:00.000Z",
});

const templateItem = (
  id: number,
  description: string,
): ProposalTemplateItem => ({
  id,
  template_id: 1,
  description,
  quantity: 1,
  unit_price: 10000,
  discount_amount: 0,
  index: id - 1,
});

it("builds proposal defaults from a template", () => {
  expect(
    buildProposalDefaultsFromTemplate(template(), [
      templateItem(1, "Setup"),
      templateItem(2, "Treinamento"),
    ]),
  ).toEqual({
    template_id: 1,
    scope: "Escopo padrao",
    terms: "Condicoes padrao",
    items: [
      {
        description: "Setup",
        quantity: 1,
        unit_price: 10000,
        discount_amount: 0,
      },
      {
        description: "Treinamento",
        quantity: 1,
        unit_price: 10000,
        discount_amount: 0,
      },
    ],
  });
});
```

- [ ] **Step 3: Write failing tests for duplication**

Add:

```ts
it("builds a draft duplicate payload and clears lifecycle dates", () => {
  const duplicated = buildDuplicateProposalPayload(
    proposal({
      id: 12,
      title: "Proposta Original",
      number: "PROP-0012",
      status: "accepted",
      sent_at: "2026-05-20T10:00:00.000Z",
      accepted_at: "2026-05-21T10:00:00.000Z",
      rejected_at: null,
    }),
    [item(1, 1, 10000)],
    "PROP-0013",
  );

  expect(duplicated.proposal).toEqual(
    expect.objectContaining({
      title: "Proposta Original - copia",
      number: "PROP-0013",
      status: "draft",
      sent_at: null,
      accepted_at: null,
      rejected_at: null,
    }),
  );
  expect(duplicated.items).toEqual([
    expect.objectContaining({
      description: "Item 1",
      proposal_id: 0,
      index: 0,
    }),
  ]);
});
```

- [ ] **Step 4: Run tests to confirm failure**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/proposals/proposalUtils.test.ts
```

Expected: FAIL because the new functions and tax argument do not exist.

- [ ] **Step 5: Implement utility changes**

In `proposalUtils.ts`, update types and exports:

```ts
import type {
  Proposal,
  ProposalItem,
  ProposalStatus,
  ProposalTemplate,
  ProposalTemplateItem,
} from "../types";

type ProposalTotals = {
  items: ProposalItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
};
```

Change `calculateProposalTotals` signature:

```ts
export const calculateProposalTotals = (
  items: ProposalItem[],
  taxAmount = 0,
): ProposalTotals => {
```

Set final tax and total:

```ts
  const normalizedTaxAmount = Math.max(0, Math.round(taxAmount));
  const total =
    calculatedItems.reduce((sum, item) => sum + item.total, 0) +
    normalizedTaxAmount;

  return {
    items: calculatedItems,
    subtotal,
    discountAmount,
    taxAmount: normalizedTaxAmount,
    total,
  };
```

Add:

```ts
export const buildProposalDefaultsFromTemplate = (
  template: ProposalTemplate,
  items: ProposalTemplateItem[],
) => ({
  template_id: template.id,
  scope: template.default_scope ?? "",
  terms: template.default_terms ?? "",
  items: [...items]
    .sort((a, b) => a.index - b.index)
    .map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
    })),
});

export const buildDuplicateProposalPayload = (
  proposal: Proposal,
  items: ProposalItem[],
  nextNumber: string,
) => ({
  proposal: {
    deal_id: proposal.deal_id,
    company_id: proposal.company_id,
    contact_id: proposal.contact_id ?? null,
    sales_id: proposal.sales_id ?? null,
    template_id: proposal.template_id ?? null,
    number: nextNumber,
    title: `${proposal.title} - copia`,
    status: "draft" as ProposalStatus,
    scope: proposal.scope ?? null,
    terms: proposal.terms ?? null,
    internal_notes: proposal.internal_notes ?? null,
    delivery_time: proposal.delivery_time ?? null,
    payment_terms: proposal.payment_terms ?? null,
    currency: proposal.currency,
    subtotal: proposal.subtotal,
    discount_amount: proposal.discount_amount,
    tax_amount: proposal.tax_amount,
    total: proposal.total,
    valid_until: proposal.valid_until ?? null,
    sent_at: null,
    accepted_at: null,
    rejected_at: null,
  },
  items: [...items]
    .sort((a, b) => a.index - b.index)
    .map((item, index) => ({
      proposal_id: 0,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
      total: item.total,
      index,
    })),
});

export const getProposalPrintPath = (id: Proposal["id"]) =>
  `/proposals/${id}/show?print=1`;
```

- [ ] **Step 6: Update create/edit total calls**

In both `ProposalCreate.tsx` and `ProposalEdit.tsx`, change:

```ts
  const totals = calculateProposalTotals(normalizedItems);
```

to:

```ts
  const totals = calculateProposalTotals(
    normalizedItems,
    proposal.tax_amount ?? 0,
  );
```

Add `tax_amount: totals.taxAmount` in the returned proposal payload.

- [ ] **Step 7: Run focused tests**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/proposals/proposalUtils.test.ts
```

Expected: PASS.

- [ ] **Step 8: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: exits 0.

- [ ] **Step 9: Checkpoint**

Run:

```bash
if test -d .git; then git add src/components/atomic-crm/proposals src/components/atomic-crm/types.ts && git commit -m "feat: add proposal v2 utilities"; else printf "checkpoint: proposal v2 utilities\n"; fi
```

---

## Task 4: Proposal Template Resource UI

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposal-templates/index.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposal-templates/ProposalTemplateList.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposal-templates/ProposalTemplateCreate.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposal-templates/ProposalTemplateEdit.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposal-templates/ProposalTemplateInputs.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/CRM.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/settings/SettingsPage.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/canAccess.ts`

- [ ] **Step 1: Create template inputs**

Create `ProposalTemplateInputs.tsx`:

```tsx
import { required } from "ra-core";
import { ArrayInput } from "@/components/admin/array-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { NumberInput } from "@/components/admin/number-input";
import { SimpleFormIterator } from "@/components/admin/simple-form-iterator";
import { TextInput } from "@/components/admin/text-input";

export const ProposalTemplateInputs = () => (
  <div className="flex flex-col gap-6">
    <div className="grid gap-4 md:grid-cols-2">
      <TextInput source="name" validate={required()} helperText={false} />
      <BooleanInput source="active" defaultValue helperText={false} />
    </div>
    <TextInput source="description" multiline rows={3} helperText={false} />
    <div className="grid gap-4 md:grid-cols-2">
      <TextInput
        source="default_scope"
        multiline
        rows={6}
        helperText={false}
      />
      <TextInput
        source="default_terms"
        multiline
        rows={6}
        helperText={false}
      />
    </div>
    <ArrayInput
      source="items"
      label="resources.proposal_template_items.name"
    >
      <SimpleFormIterator
        inline
        getItemLabel={(index) => `#${index + 1}`}
        className="[&_li>section]:grid [&_li>section]:gap-3 [&_li>section]:md:grid-cols-[minmax(14rem,1fr)_7rem_8rem_8rem]"
      >
        <TextInput
          source="description"
          label="resources.proposal_template_items.fields.description"
          validate={required()}
          helperText={false}
        />
        <NumberInput
          source="quantity"
          label="resources.proposal_template_items.fields.quantity"
          defaultValue={1}
          min={0.01}
          step={0.01}
          validate={required()}
          helperText={false}
        />
        <NumberInput
          source="unit_price"
          label="resources.proposal_template_items.fields.unit_price"
          defaultValue={0}
          min={0}
          validate={required()}
          helperText={false}
        />
        <NumberInput
          source="discount_amount"
          label="resources.proposal_template_items.fields.discount_amount"
          defaultValue={0}
          min={0}
          helperText={false}
        />
      </SimpleFormIterator>
    </ArrayInput>
  </div>
);
```

- [ ] **Step 2: Create template list**

Create `ProposalTemplateList.tsx`:

```tsx
import { useListContext, useTranslate } from "ra-core";
import { Link } from "react-router";
import { CreateButton } from "@/components/admin/create-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { TopToolbar } from "../layout/TopToolbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProposalTemplate } from "../types";

export const ProposalTemplateList = () => (
  <List
    title={false}
    perPage={25}
    sort={{ field: "name", order: "ASC" }}
    actions={
      <TopToolbar>
        <CreateButton label="resources.proposal_templates.action.new" />
      </TopToolbar>
    }
    pagination={<ListPagination rowsPerPageOptions={[10, 25, 50]} />}
  >
    <ProposalTemplateListContent />
  </List>
);

const ProposalTemplateListContent = () => {
  const translate = useTranslate();
  const { data, isPending } = useListContext<ProposalTemplate>();

  if (isPending) return <Skeleton className="h-12 w-full" />;

  return (
    <Card className="py-0">
      <div className="divide-y">
        {(data ?? []).map((template) => (
          <Link
            key={template.id}
            to={`/proposal_templates/${template.id}`}
            className="grid gap-3 p-4 transition-colors hover:bg-muted md:grid-cols-[1fr_auto]"
          >
            <div className="min-w-0">
              <div className="font-medium">{template.name}</div>
              <div className="text-sm text-muted-foreground">
                {template.description ||
                  translate("resources.proposal_templates.empty_description")}
              </div>
            </div>
            <Badge variant={template.active ? "default" : "secondary"}>
              {template.active
                ? translate("resources.proposal_templates.status.active")
                : translate("resources.proposal_templates.status.inactive")}
            </Badge>
          </Link>
        ))}
      </div>
    </Card>
  );
};
```

- [ ] **Step 3: Create template create/edit forms**

Create `ProposalTemplateCreate.tsx` and `ProposalTemplateEdit.tsx` following the existing manual proposal item persistence pattern:

```tsx
// ProposalTemplateCreate.tsx
import { Form, useDataProvider, useNotify, useRedirect } from "ra-core";
import type { SubmitHandler } from "react-hook-form";
import { Create } from "@/components/admin/create";
import { Card, CardContent } from "@/components/ui/card";
import { FormToolbar } from "../layout/FormToolbar";
import type { ProposalTemplate, ProposalTemplateItem } from "../types";
import { ProposalTemplateInputs } from "./ProposalTemplateInputs";

type TemplateFormData = Partial<ProposalTemplate> & {
  items?: Partial<ProposalTemplateItem>[];
};

export const ProposalTemplateCreate = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();

  const handleSubmit: SubmitHandler<TemplateFormData> = async ({
    items = [],
    ...template
  }) => {
    const { data: savedTemplate } =
      await dataProvider.create<ProposalTemplate>("proposal_templates", {
        data: template,
      });
    await Promise.all(
      items
        .filter((item) => item.description)
        .map((item, index) =>
          dataProvider.create("proposal_template_items", {
            data: {
              description: item.description,
              quantity: item.quantity ?? 1,
              unit_price: item.unit_price ?? 0,
              discount_amount: item.discount_amount ?? 0,
              template_id: savedTemplate.id,
              index,
            },
          }),
        ),
    );
    notify("ra.notification.created", {
      type: "info",
      messageArgs: { smart_count: 1 },
    });
    redirect("list", "proposal_templates");
  };

  return (
    <Create redirect="list">
      <Card>
        <CardContent>
          <Form
            defaultValues={{ active: true, items: [] }}
            onSubmit={handleSubmit as SubmitHandler<any>}
          >
            <ProposalTemplateInputs />
            <FormToolbar />
          </Form>
        </CardContent>
      </Card>
    </Create>
  );
};
```

For `ProposalTemplateEdit.tsx`, use `useGetList("proposal_template_items")`, `SimpleForm`, update existing items, create new items, and delete removed items exactly like `ProposalEdit.tsx` does for `proposal_items`.

- [ ] **Step 4: Register resource**

Create `index.ts`:

```ts
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
```

In `CRM.tsx`, import and register:

```ts
import proposalTemplates from "../proposal-templates";
```

Desktop resources:

```tsx
<Resource name="proposal_templates" {...proposalTemplates} />
<Resource name="proposal_template_items" />
```

Mobile resources:

```tsx
<Resource name="proposal_templates" {...proposalTemplates} />
<Resource name="proposal_template_items" />
```

- [ ] **Step 5: Restrict management to admins**

In `canAccess.ts`, add:

```ts
  if (
    params.resource === "proposal_templates" ||
    params.resource === "proposal_template_items"
  ) {
    return false;
  }
```

Place it after the automation rule block. Admins still pass because the function returns early for admin.

- [ ] **Step 6: Add settings link**

In `SettingsPage.tsx`, add a card or row near the Automations link:

```tsx
<Link to="/proposal_templates">
  {translate("resources.proposal_templates.name", { smart_count: 2 })}
</Link>
```

Use the existing settings section pattern and avoid introducing a new layout style.

- [ ] **Step 7: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: exits 0.

- [ ] **Step 8: Checkpoint**

Run:

```bash
if test -d .git; then git add src/components/atomic-crm/proposal-templates src/components/atomic-crm/root/CRM.tsx src/components/atomic-crm/settings/SettingsPage.tsx src/components/atomic-crm/providers/commons/canAccess.ts && git commit -m "feat: add proposal template management"; else printf "checkpoint: proposal template resource ui\n"; fi
```

---

## Task 5: Proposal Form Template Application And Commercial Fields

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalInputs.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalCreate.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalEdit.tsx`

- [ ] **Step 1: Add template selector to proposal inputs**

In `ProposalInputs.tsx`, import:

```ts
import { useGetList } from "ra-core";
import { useFormContext, useWatch } from "react-hook-form";
import type { ProposalTemplate, ProposalTemplateItem } from "../types";
import { buildProposalDefaultsFromTemplate } from "./proposalUtils";
```

Add a component:

```tsx
const ProposalTemplateInput = () => {
  const { setValue } = useFormContext();
  const selectedTemplateId = useWatch({ name: "template_id" });
  const { data: templates = [] } = useGetList<ProposalTemplate>(
    "proposal_templates",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "name", order: "ASC" },
      filter: { active: true },
    },
  );
  const { data: templateItems = [] } = useGetList<ProposalTemplateItem>(
    "proposal_template_items",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "index", order: "ASC" },
      filter: { template_id: selectedTemplateId },
    },
    { enabled: Boolean(selectedTemplateId) },
  );

  useEffect(() => {
    if (!selectedTemplateId) return;
    const template = templates.find(
      (candidate) => String(candidate.id) === String(selectedTemplateId),
    );
    if (!template) return;

    const defaults = buildProposalDefaultsFromTemplate(template, templateItems);
    setValue("scope", defaults.scope, { shouldDirty: true });
    setValue("terms", defaults.terms, { shouldDirty: true });
    if (defaults.items.length > 0) {
      setValue("items", defaults.items, { shouldDirty: true });
    }
  }, [selectedTemplateId, setValue, templateItems, templates]);

  return (
    <ReferenceInput source="template_id" reference="proposal_templates">
      <SelectInput
        label="resources.proposals.fields.template_id"
        optionText="name"
        helperText={false}
      />
    </ReferenceInput>
  );
};
```

Add `<ProposalTemplateInput />` under the title/number inputs.

- [ ] **Step 2: Add richer commercial fields**

In `ProposalCommercialInputs`, add:

```tsx
      <NumberInput
        source="tax_amount"
        defaultValue={0}
        min={0}
        helperText={false}
      />
      <TextInput source="delivery_time" helperText={false} />
      <TextInput source="payment_terms" helperText={false} />
```

In `ProposalTextInputs`, add internal notes:

```tsx
<TextInput
  source="internal_notes"
  multiline
  rows={4}
  helperText={false}
/>
```

- [ ] **Step 3: Ensure default values include tax**

In `ProposalCreate.tsx`, add:

```ts
      tax_amount: 0,
```

to `defaultValues`.

- [ ] **Step 4: Ensure payload includes new fields**

In `ProposalCreate.tsx` and `ProposalEdit.tsx`, keep destructuring broad as-is, but confirm the returned proposal object includes:

```ts
      tax_amount: totals.taxAmount,
```

- [ ] **Step 5: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: exits 0.

- [ ] **Step 6: Browser smoke**

Run the app if not running:

```bash
make start
```

Open `http://localhost:5174/#/proposals/create?deal_id=1`. Verify:

- template selector appears;
- choosing the default template fills escopo, condicoes and items;
- tax field is visible;
- proposal saves.

- [ ] **Step 7: Checkpoint**

Run:

```bash
if test -d .git; then git add src/components/atomic-crm/proposals && git commit -m "feat: apply templates in proposal forms"; else printf "checkpoint: proposal template application\n"; fi
```

---

## Task 6: Duplicate Proposal And Quick Actions

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalActions.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalShow.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/DealProposalsPanel.tsx`

- [ ] **Step 1: Create shared proposal actions**

Create `ProposalActions.tsx`:

```tsx
import { Copy, FileText } from "lucide-react";
import {
  useDataProvider,
  useGetList,
  useNotify,
  useRedirect,
  useTranslate,
} from "ra-core";
import { Button } from "@/components/ui/button";
import type { Proposal, ProposalItem } from "../types";
import {
  buildDuplicateProposalPayload,
  buildProposalNumber,
  getProposalPrintPath,
} from "./proposalUtils";

export const ProposalActions = ({ proposal }: { proposal: Proposal }) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const translate = useTranslate();
  const { data: items = [] } = useGetList<ProposalItem>(
    "proposal_items",
    {
      filter: { proposal_id: proposal.id },
      sort: { field: "index", order: "ASC" },
      pagination: { page: 1, perPage: 100 },
    },
    { enabled: Boolean(proposal.id) },
  );

  const duplicateProposal = async () => {
    const nextNumber = buildProposalNumber(Date.now());
    const payload = buildDuplicateProposalPayload(proposal, items, nextNumber);
    const { data: savedProposal } = await dataProvider.create<Proposal>(
      "proposals",
      { data: payload.proposal },
    );
    await Promise.all(
      payload.items.map((item, index) =>
        dataProvider.create("proposal_items", {
          data: { ...item, proposal_id: savedProposal.id, index },
        }),
      ),
    );
    notify("resources.proposals.notifications.duplicated", {
      type: "info",
    });
    redirect("show", "proposals", savedProposal.id);
  };

  const printProposal = () => {
    window.open(`#${getProposalPrintPath(proposal.id)}`, "_blank");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" onClick={duplicateProposal}>
        <Copy className="mr-2 size-4" />
        {translate("resources.proposals.action.duplicate")}
      </Button>
      <Button type="button" variant="outline" onClick={printProposal}>
        <FileText className="mr-2 size-4" />
        {translate("resources.proposals.action.export_pdf")}
      </Button>
    </div>
  );
};
```

- [ ] **Step 2: Add actions to proposal show**

In `ProposalShow.tsx`, render:

```tsx
<ProposalActions proposal={record} />
```

above `<ProposalPreview />`.

- [ ] **Step 3: Add quick actions in deal proposal panel**

In `DealProposalsPanel.tsx`, add visible links/buttons for:

```tsx
<Link to={`/proposals/${proposal.id}/show`}>
  {translate("resources.proposals.action.view")}
</Link>
<Link to={`/proposals/${proposal.id}`}>
  {translate("resources.proposals.action.edit")}
</Link>
```

Render `<ProposalActions proposal={proposal} />` for each row on desktop. On mobile, keep the buttons below the row text so they do not overflow.

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: exits 0.

- [ ] **Step 5: Browser smoke**

In the browser:

1. Open an existing proposal.
2. Click `Duplicar`.
3. Confirm the new proposal opens as `Rascunho`.
4. Confirm the duplicated items appear.
5. Open the original deal and confirm both proposals are visible.

- [ ] **Step 6: Checkpoint**

Run:

```bash
if test -d .git; then git add src/components/atomic-crm/proposals && git commit -m "feat: duplicate proposals"; else printf "checkpoint: proposal duplication actions\n"; fi
```

---

## Task 7: Printable Proposal Preview

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalShow.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/proposals/ProposalPreview.tsx`

- [ ] **Step 1: Detect print mode**

In `ProposalShow.tsx`, import `useLocation` and add:

```ts
const location = useLocation();
const printMode = new URLSearchParams(location.search).get("print") === "1";
```

Pass it:

```tsx
<ProposalPreview
  proposal={record}
  company={company}
  items={items}
  printMode={printMode}
/>
```

Hide navigation actions when `printMode` is true:

```tsx
{!printMode && <ProposalActions proposal={record} />}
```

Add:

```tsx
{printMode ? (
  <button
    className="fixed right-4 top-4 rounded-md bg-primary px-4 py-2 text-primary-foreground print:hidden"
    onClick={() => window.print()}
    type="button"
  >
    {translate("resources.proposals.action.print")}
  </button>
) : null}
```

- [ ] **Step 2: Upgrade preview layout**

In `ProposalPreview.tsx`, change props:

```ts
  printMode?: boolean;
```

Add a print class on the root card:

```tsx
<Card className={printMode ? "border-0 shadow-none print:border-0" : ""}>
```

Add commercial sections for:

```tsx
<PreviewText title={translate("resources.proposals.fields.delivery_time")}>
  {proposal.delivery_time}
</PreviewText>
<PreviewText title={translate("resources.proposals.fields.payment_terms")}>
  {proposal.payment_terms}
</PreviewText>
```

Add tax to amount summary:

```tsx
<AmountRow
  label={translate("resources.proposals.fields.tax_amount")}
  value={formatter.format(proposal.tax_amount / 100)}
/>
```

Add final acceptance block:

```tsx
<div className="mt-10 grid gap-8 text-sm md:grid-cols-2 print:grid-cols-2">
  <div className="border-t pt-3">
    {translate("resources.proposals.print.client_acceptance")}
  </div>
  <div className="border-t pt-3">
    {translate("resources.proposals.print.seller_signature")}
  </div>
</div>
```

- [ ] **Step 3: Add print CSS through Tailwind classes**

Ensure all buttons and non-print actions use `print:hidden`. Ensure the preview container uses:

```tsx
className="mx-auto max-w-5xl print:max-w-none print:p-0"
```

No global CSS file is required.

- [ ] **Step 4: Browser smoke**

Open:

```text
http://localhost:5174/#/proposals/2/show?print=1
```

Expected:

- no app sidebar/header in the printable content area;
- print button visible on screen but hidden in print media;
- proposal has header, client, items, totals, terms, and signature area.

- [ ] **Step 5: Checkpoint**

Run:

```bash
if test -d .git; then git add src/components/atomic-crm/proposals && git commit -m "feat: add printable proposal preview"; else printf "checkpoint: printable proposal preview\n"; fi
```

---

## Task 8: I18n For Proposals V2 And Template Resources

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/portugueseCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/i18nProvider.test.ts`

- [ ] **Step 1: Add i18n test**

In `i18nProvider.test.ts`, extend the Portuguese test with:

```ts
expect(
  i18nProvider.translate("resources.proposal_templates.name", {
    smart_count: 2,
  }),
).toBe("Templates de proposta");
expect(
  i18nProvider.translate("resources.proposals.action.duplicate"),
).toBe("Duplicar");
expect(
  i18nProvider.translate("resources.proposals.action.export_pdf"),
).toBe("Exportar PDF");
expect(
  i18nProvider.translate("resources.sales_goals.name", { smart_count: 2 }),
).toBe("Metas comerciais");
```

- [ ] **Step 2: Run test to confirm failure**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/providers/commons/i18nProvider.test.ts
```

Expected: FAIL because new message keys are missing.

- [ ] **Step 3: Add Portuguese messages**

In `portugueseCrmMessages.ts`, add:

```ts
proposal_templates: {
  name: "Template de proposta |||| Templates de proposta",
  empty_description: "Sem descricao",
  status: {
    active: "Ativo",
    inactive: "Inativo",
  },
  action: {
    new: "Novo template",
  },
  fields: {
    name: "Nome",
    description: "Descricao interna",
    default_scope: "Escopo padrao",
    default_terms: "Condicoes padrao",
    active: "Ativo",
    items: "Itens padrao",
  },
},
proposal_template_items: {
  name: "Item padrao |||| Itens padrao",
  fields: {
    description: "Descricao",
    quantity: "Quantidade",
    unit_price: "Valor unitario",
    discount_amount: "Desconto",
  },
},
sales_goals: {
  name: "Meta comercial |||| Metas comerciais",
  action: {
    new: "Nova meta",
  },
  fields: {
    sales_id: "Vendedor",
    period_start: "Mes",
    revenue_goal: "Meta de receita",
    won_deals_goal: "Meta de negocios ganhos",
    sent_proposals_goal: "Meta de propostas enviadas",
  },
},
```

Extend existing `proposals` messages with:

```ts
action: {
  duplicate: "Duplicar",
  export_pdf: "Exportar PDF",
  print: "Imprimir",
  view: "Ver",
  edit: "Editar",
},
notifications: {
  duplicated: "Proposta duplicada",
},
print: {
  client_acceptance: "Aceite do cliente",
  seller_signature: "Responsavel comercial",
},
fields: {
  template_id: "Template",
  internal_notes: "Observacoes internas",
  delivery_time: "Prazo de entrega",
  payment_terms: "Forma de pagamento",
  tax_amount: "Impostos e ajustes",
}
```

Merge with existing objects instead of replacing existing keys.

- [ ] **Step 4: Add English and French fallback keys**

Add equivalent object paths in `englishCrmMessages.ts` and `frenchCrmMessages.ts`. Literal translations can be simple:

```ts
proposal_templates: {
  name: "Proposal template |||| Proposal templates",
  empty_description: "No description",
  status: { active: "Active", inactive: "Inactive" },
  action: { new: "New template" },
  fields: {
    name: "Name",
    description: "Internal description",
    default_scope: "Default scope",
    default_terms: "Default terms",
    active: "Active",
    items: "Default items",
  },
},
```

For French, use:

```ts
proposal_templates: {
  name: "Modele de proposition |||| Modeles de proposition",
  empty_description: "Sans description",
  status: { active: "Actif", inactive: "Inactif" },
  action: { new: "Nouveau modele" },
  fields: {
    name: "Nom",
    description: "Description interne",
    default_scope: "Portee par defaut",
    default_terms: "Conditions par defaut",
    active: "Actif",
    items: "Articles par defaut",
  },
},
```

- [ ] **Step 5: Run i18n test**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/providers/commons/i18nProvider.test.ts
```

Expected: PASS.

- [ ] **Step 6: Checkpoint**

Run:

```bash
if test -d .git; then git add src/components/atomic-crm/providers/commons && git commit -m "feat: translate proposal v2 resources"; else printf "checkpoint: proposal v2 i18n\n"; fi
```

---

## Task 9: Sales Goals Resource

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/sales-goals/index.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/sales-goals/SalesGoalList.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/sales-goals/SalesGoalCreate.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/sales-goals/SalesGoalEdit.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/sales-goals/SalesGoalInputs.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/CRM.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/settings/SettingsPage.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/canAccess.ts`

- [ ] **Step 1: Create sales goal inputs**

Create `SalesGoalInputs.tsx`:

```tsx
import { required } from "ra-core";
import { DateInput } from "@/components/admin/date-input";
import { NumberInput } from "@/components/admin/number-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SelectInput } from "@/components/admin/select-input";

export const SalesGoalInputs = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <ReferenceInput source="sales_id" reference="sales">
      <SelectInput
        label="resources.sales_goals.fields.sales_id"
        optionText={(record) =>
          [record.first_name, record.last_name].filter(Boolean).join(" ")
        }
        validate={required()}
        helperText={false}
      />
    </ReferenceInput>
    <DateInput
      source="period_start"
      validate={required()}
      helperText="resources.sales_goals.help.period_start"
    />
    <NumberInput
      source="revenue_goal"
      min={0}
      validate={required()}
      helperText={false}
    />
    <NumberInput
      source="won_deals_goal"
      min={0}
      validate={required()}
      helperText={false}
    />
    <NumberInput
      source="sent_proposals_goal"
      min={0}
      validate={required()}
      helperText={false}
    />
  </div>
);
```

- [ ] **Step 2: Create list/create/edit resources**

Create `SalesGoalList.tsx`:

```tsx
import { useListContext } from "ra-core";
import { Link } from "react-router";
import { CreateButton } from "@/components/admin/create-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { Card } from "@/components/ui/card";
import { TopToolbar } from "../layout/TopToolbar";
import type { SalesGoal } from "../types";

export const SalesGoalList = () => (
  <List
    title={false}
    perPage={25}
    sort={{ field: "period_start", order: "DESC" }}
    actions={
      <TopToolbar>
        <CreateButton label="resources.sales_goals.action.new" />
      </TopToolbar>
    }
    pagination={<ListPagination rowsPerPageOptions={[10, 25, 50]} />}
  >
    <SalesGoalListContent />
  </List>
);

const SalesGoalListContent = () => {
  const { data = [] } = useListContext<SalesGoal>();

  return (
    <Card className="divide-y py-0">
      {data.map((goal) => (
        <Link
          key={goal.id}
          to={`/sales_goals/${goal.id}`}
          className="grid gap-2 p-4 hover:bg-muted md:grid-cols-4"
        >
          <span>{goal.period_start}</span>
          <span>R$ {(goal.revenue_goal / 100).toLocaleString("pt-BR")}</span>
          <span>{goal.won_deals_goal} negocios</span>
          <span>{goal.sent_proposals_goal} propostas</span>
        </Link>
      ))}
    </Card>
  );
};
```

Create `SalesGoalCreate.tsx` and `SalesGoalEdit.tsx` with existing `Create`/`Edit` + `SimpleForm` patterns used in sales/proposals.

- [ ] **Step 3: Create resource index**

Create `index.ts`:

```ts
import type { SalesGoal } from "../types";
import { SalesGoalCreate } from "./SalesGoalCreate";
import { SalesGoalEdit } from "./SalesGoalEdit";
import { SalesGoalList } from "./SalesGoalList";

export default {
  list: SalesGoalList,
  create: SalesGoalCreate,
  edit: SalesGoalEdit,
  recordRepresentation: (goal: SalesGoal) => goal.period_start,
};
```

- [ ] **Step 4: Register resource and settings link**

In `CRM.tsx`, import:

```ts
import salesGoals from "../sales-goals";
```

Add resources:

```tsx
<Resource name="sales_goals" {...salesGoals} />
```

In `SettingsPage.tsx`, add a link to `/sales_goals` near the commercial/admin settings.

- [ ] **Step 5: Restrict management to admins**

In `canAccess.ts`, add:

```ts
  if (params.resource === "sales_goals") {
    return false;
  }
```

- [ ] **Step 6: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: exits 0.

- [ ] **Step 7: Browser smoke**

Open `/sales_goals`. Verify:

- list loads for admin;
- create form opens;
- non-admin access is blocked by `canAccess` behavior.

- [ ] **Step 8: Checkpoint**

Run:

```bash
if test -d .git; then git add src/components/atomic-crm/sales-goals src/components/atomic-crm/root/CRM.tsx src/components/atomic-crm/settings/SettingsPage.tsx src/components/atomic-crm/providers/commons/canAccess.ts && git commit -m "feat: add sales goal management"; else printf "checkpoint: sales goals resource\n"; fi
```

---

## Task 10: Advanced Dashboard Metric Utilities

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/advancedCommercialDashboardUtils.ts`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/advancedCommercialDashboardUtils.test.ts`

- [ ] **Step 1: Write failing tests**

Create `advancedCommercialDashboardUtils.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { Deal, Lead, Proposal, Sale, SalesGoal, Task } from "../types";
import {
  calculateFunnelConversion,
  calculateGoalProgress,
  calculateLossReasons,
  calculatePipelineAging,
  calculateRevenueForecast,
  calculateSellerRanking,
} from "./advancedCommercialDashboardUtils";

const sale = (id: number, firstName: string): Sale => ({
  id,
  first_name: firstName,
  last_name: "Comercial",
  administrator: id === 1,
  disabled: false,
  user_id: `user-${id}`,
  email: `${firstName}@example.com`,
});

const deal = (overrides: Partial<Deal>): Deal =>
  ({
    id: overrides.id ?? 1,
    name: "Negocio",
    company_id: 1,
    contact_ids: [],
    amount: 100000,
    stage: "proposal-sent",
    probability: 50,
    expected_closing_date: "2026-05-30",
    sales_id: 1,
    index: 0,
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-10T00:00:00.000Z",
    last_activity_at: "2026-05-10T00:00:00.000Z",
    next_action_at: null,
    archived_at: null,
    lost_reason: null,
    ...overrides,
  }) as Deal;

const proposal = (overrides: Partial<Proposal>): Proposal => ({
  id: overrides.id ?? 1,
  deal_id: 1,
  company_id: 1,
  contact_id: null,
  sales_id: 1,
  template_id: null,
  number: "PROP-0001",
  title: "Proposta",
  status: "sent",
  scope: null,
  terms: null,
  internal_notes: null,
  delivery_time: null,
  payment_terms: null,
  currency: "BRL",
  subtotal: 100000,
  discount_amount: 0,
  tax_amount: 0,
  total: 100000,
  valid_until: "2026-05-30",
  sent_at: "2026-05-05T00:00:00.000Z",
  accepted_at: null,
  rejected_at: null,
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-05T00:00:00.000Z",
  ...overrides,
});

describe("advanced dashboard metrics", () => {
  it("calculates goal progress for a seller", () => {
    const result = calculateGoalProgress(
      [sale(1, "Ana")],
      [
        {
          id: 1,
          sales_id: 1,
          period_start: "2026-05-01",
          revenue_goal: 200000,
          won_deals_goal: 2,
          sent_proposals_goal: 3,
          created_at: "2026-05-01T00:00:00.000Z",
          updated_at: "2026-05-01T00:00:00.000Z",
        } satisfies SalesGoal,
      ],
      [deal({ id: 1, stage: "won", amount: 100000 })],
      [
        proposal({ id: 1, status: "sent" }),
        proposal({ id: 2, status: "accepted" }),
      ],
      "2026-05-15",
    );

    expect(result[0]).toEqual(
      expect.objectContaining({
        salesId: 1,
        revenueProgress: 50,
        wonDealsProgress: 50,
        sentProposalsProgress: 67,
      }),
    );
  });

  it("calculates revenue forecast from open deals and sent proposals", () => {
    expect(
      calculateRevenueForecast(
        [deal({ id: 1, amount: 100000, probability: 40 })],
        [proposal({ id: 1, total: 200000, status: "sent" })],
      ),
    ).toEqual({
      dealWeightedAmount: 40000,
      proposalOpenAmount: 200000,
      forecastAmount: 240000,
    });
  });

  it("calculates funnel conversion", () => {
    const leads = [
      { status: "new" },
      { status: "converted" },
    ] as Lead[];
    expect(
      calculateFunnelConversion(
        leads,
        [deal({ id: 1 }), deal({ id: 2, stage: "won" })],
        [proposal({ id: 1, status: "accepted" })],
      ),
    ).toEqual(
      expect.objectContaining({
        leads: 2,
        convertedLeads: 1,
        deals: 2,
        proposalsAccepted: 1,
        wonDeals: 1,
      }),
    );
  });

  it("calculates pipeline aging", () => {
    expect(
      calculatePipelineAging(
        [deal({ id: 1, created_at: "2026-05-01T00:00:00.000Z" })],
        [proposal({ id: 1, sent_at: "2026-05-10T00:00:00.000Z" })],
        new Date("2026-05-20T00:00:00.000Z"),
      ),
    ).toEqual(
      expect.objectContaining({
        averageOpenDealAgeDays: 19,
        averageSentProposalAgeDays: 10,
      }),
    );
  });

  it("calculates seller ranking with tasks", () => {
    const tasks = [
      {
        id: 1,
        text: "Vencida",
        type: "follow-up",
        due_date: "2026-05-10T00:00:00.000Z",
        done_date: null,
        sales_id: 1,
      } satisfies Task,
    ];
    expect(
      calculateSellerRanking(
        [sale(1, "Ana")],
        [deal({ id: 1, stage: "won" })],
        [proposal({ id: 1, status: "accepted" })],
        tasks,
        new Date("2026-05-20T00:00:00.000Z"),
      )[0],
    ).toEqual(
      expect.objectContaining({
        salesId: 1,
        wonAmount: 100000,
        acceptedProposals: 1,
        overdueTasks: 1,
      }),
    );
  });

  it("sorts loss reasons by lost amount", () => {
    expect(
      calculateLossReasons([
        deal({ id: 1, stage: "lost", lost_reason: "price", amount: 50000 }),
        deal({ id: 2, stage: "lost", lost_reason: "price", amount: 100000 }),
      ]),
    ).toEqual([{ reason: "price", count: 2, amount: 150000 }]);
  });
});
```

- [ ] **Step 2: Run test to confirm failure**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/dashboard/advancedCommercialDashboardUtils.test.ts
```

Expected: FAIL because the utility file does not exist.

- [ ] **Step 3: Implement advanced metric utilities**

Create `advancedCommercialDashboardUtils.ts`:

```ts
import type { Deal, Lead, Proposal, Sale, SalesGoal, Task } from "../types";
import { getWeightedAmount } from "../deals/dealCommercialUtils";

const CLOSED_DEAL_STAGES = new Set(["won", "lost"]);
const DAY_MS = 1000 * 60 * 60 * 24;

const getSellerName = (sale: Sale) =>
  [sale.first_name, sale.last_name].filter(Boolean).join(" ");

const sameMonth = (date: string | null | undefined, periodStart: string) =>
  Boolean(date?.startsWith(periodStart.slice(0, 7)));

const percentage = (value: number, goal: number) =>
  goal <= 0 ? 0 : Math.min(999, Math.round((value / goal) * 100));

export const calculateGoalProgress = (
  sales: readonly Sale[],
  goals: readonly SalesGoal[],
  deals: readonly Deal[],
  proposals: readonly Proposal[],
  nowIso: string,
) => {
  const periodStart = `${nowIso.slice(0, 7)}-01`;
  return sales.map((sale) => {
    const goal = goals.find(
      (candidate) =>
        String(candidate.sales_id) === String(sale.id) &&
        candidate.period_start === periodStart,
    );
    const sellerWonDeals = deals.filter(
      (deal) =>
        String(deal.sales_id) === String(sale.id) &&
        deal.stage === "won" &&
        sameMonth(deal.updated_at, periodStart),
    );
    const sellerSentProposals = proposals.filter(
      (proposal) =>
        String(proposal.sales_id) === String(sale.id) &&
        ["sent", "accepted", "rejected"].includes(proposal.status) &&
        sameMonth(proposal.sent_at ?? proposal.updated_at, periodStart),
    );
    const wonAmount = sellerWonDeals.reduce((sum, deal) => sum + deal.amount, 0);

    return {
      salesId: sale.id,
      name: getSellerName(sale),
      revenueGoal: goal?.revenue_goal ?? 0,
      revenueActual: wonAmount,
      revenueProgress: percentage(wonAmount, goal?.revenue_goal ?? 0),
      wonDealsGoal: goal?.won_deals_goal ?? 0,
      wonDealsActual: sellerWonDeals.length,
      wonDealsProgress: percentage(
        sellerWonDeals.length,
        goal?.won_deals_goal ?? 0,
      ),
      sentProposalsGoal: goal?.sent_proposals_goal ?? 0,
      sentProposalsActual: sellerSentProposals.length,
      sentProposalsProgress: percentage(
        sellerSentProposals.length,
        goal?.sent_proposals_goal ?? 0,
      ),
    };
  });
};

export const calculateRevenueForecast = (
  deals: readonly Deal[],
  proposals: readonly Proposal[],
) => {
  const dealWeightedAmount = deals
    .filter((deal) => !CLOSED_DEAL_STAGES.has(deal.stage))
    .reduce((sum, deal) => sum + getWeightedAmount(deal), 0);
  const proposalOpenAmount = proposals
    .filter((proposal) => proposal.status === "sent")
    .reduce((sum, proposal) => sum + proposal.total, 0);

  return {
    dealWeightedAmount,
    proposalOpenAmount,
    forecastAmount: dealWeightedAmount + proposalOpenAmount,
  };
};

export const calculateFunnelConversion = (
  leads: readonly Lead[],
  deals: readonly Deal[],
  proposals: readonly Proposal[],
) => {
  const convertedLeads = leads.filter((lead) => lead.status === "converted").length;
  const dealsWithProposal = new Set(proposals.map((proposal) => proposal.deal_id));
  const proposalsAccepted = proposals.filter(
    (proposal) => proposal.status === "accepted",
  ).length;
  const wonDeals = deals.filter((deal) => deal.stage === "won").length;

  return {
    leads: leads.length,
    convertedLeads,
    leadToDealRate: percentage(convertedLeads, leads.length),
    deals: deals.length,
    dealsWithProposal: dealsWithProposal.size,
    dealToProposalRate: percentage(dealsWithProposal.size, deals.length),
    proposalsAccepted,
    proposalAcceptanceRate: percentage(proposalsAccepted, proposals.length),
    wonDeals,
    dealWinRate: percentage(wonDeals, deals.length),
  };
};

const ageInDays = (date: string, now: Date) =>
  Math.max(0, Math.floor((now.getTime() - new Date(date).getTime()) / DAY_MS));

const average = (values: number[]) =>
  values.length === 0
    ? 0
    : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

export const calculatePipelineAging = (
  deals: readonly Deal[],
  proposals: readonly Proposal[],
  now = new Date(),
) => {
  const openDealAges = deals
    .filter((deal) => !CLOSED_DEAL_STAGES.has(deal.stage))
    .map((deal) => ageInDays(deal.created_at, now));
  const staleDeals = deals.filter(
    (deal) =>
      !CLOSED_DEAL_STAGES.has(deal.stage) &&
      deal.last_activity_at &&
      ageInDays(deal.last_activity_at, now) >= 7,
  ).length;
  const sentProposalAges = proposals
    .filter((proposal) => proposal.status === "sent" && proposal.sent_at)
    .map((proposal) => ageInDays(proposal.sent_at as string, now));

  return {
    averageOpenDealAgeDays: average(openDealAges),
    staleDeals,
    averageSentProposalAgeDays: average(sentProposalAges),
  };
};

export const calculateSellerRanking = (
  sales: readonly Sale[],
  deals: readonly Deal[],
  proposals: readonly Proposal[],
  tasks: readonly Task[],
  now = new Date(),
) =>
  sales
    .map((sale) => {
      const sellerDeals = deals.filter(
        (deal) => String(deal.sales_id) === String(sale.id),
      );
      const sellerProposals = proposals.filter(
        (proposal) => String(proposal.sales_id) === String(sale.id),
      );
      const wonAmount = sellerDeals
        .filter((deal) => deal.stage === "won")
        .reduce((sum, deal) => sum + deal.amount, 0);
      const openAmount = sellerDeals
        .filter((deal) => !CLOSED_DEAL_STAGES.has(deal.stage))
        .reduce((sum, deal) => sum + deal.amount, 0);
      const weightedAmount = sellerDeals
        .filter((deal) => !CLOSED_DEAL_STAGES.has(deal.stage))
        .reduce((sum, deal) => sum + getWeightedAmount(deal), 0);
      const overdueTasks = tasks.filter(
        (task) =>
          String(task.sales_id) === String(sale.id) &&
          !task.done_date &&
          new Date(task.due_date) < now,
      ).length;

      return {
        salesId: sale.id,
        name: getSellerName(sale),
        wonAmount,
        openAmount,
        weightedAmount,
        sentProposals: sellerProposals.filter((proposal) =>
          ["sent", "accepted", "rejected"].includes(proposal.status),
        ).length,
        acceptedProposals: sellerProposals.filter(
          (proposal) => proposal.status === "accepted",
        ).length,
        overdueTasks,
      };
    })
    .sort((a, b) => b.wonAmount - a.wonAmount || b.weightedAmount - a.weightedAmount);

export const calculateLossReasons = (deals: readonly Deal[]) => {
  const byReason = new Map<string, { reason: string; count: number; amount: number }>();

  for (const deal of deals) {
    if (deal.stage !== "lost" || !deal.lost_reason) continue;
    const current = byReason.get(deal.lost_reason) ?? {
      reason: deal.lost_reason,
      count: 0,
      amount: 0,
    };
    current.count += 1;
    current.amount += deal.amount;
    byReason.set(deal.lost_reason, current);
  }

  return [...byReason.values()].sort((a, b) => b.amount - a.amount);
};
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/dashboard/advancedCommercialDashboardUtils.test.ts
```

Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run:

```bash
if test -d .git; then git add src/components/atomic-crm/dashboard/advancedCommercialDashboardUtils.ts src/components/atomic-crm/dashboard/advancedCommercialDashboardUtils.test.ts && git commit -m "feat: add advanced dashboard metrics"; else printf "checkpoint: advanced dashboard metric utilities\n"; fi
```

---

## Task 11: Advanced Dashboard Components

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/GoalProgressSummary.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/RevenueForecastSummary.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/FunnelConversionSummary.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/PipelineAgingSummary.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/AdvancedSellerRanking.tsx`
- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/LossReasonSummary.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/Dashboard.tsx`

- [ ] **Step 1: Create shared formatter pattern**

In each component, use:

```ts
const LOCALE = "pt-BR";

const formatCurrency = (amount: number, currency: string) =>
  (amount / 100).toLocaleString(LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
```

- [ ] **Step 2: Build `RevenueForecastSummary`**

Create component that fetches deals/proposals and renders:

```tsx
<Card className="p-4">
  <h2 className="text-sm font-medium text-muted-foreground">
    {translate("crm.dashboard.advanced.forecast.title")}
  </h2>
  <div className="mt-3 grid gap-3 md:grid-cols-3">
    <Metric label="Negocios ponderados" value={formatCurrency(result.dealWeightedAmount, currency)} />
    <Metric label="Propostas abertas" value={formatCurrency(result.proposalOpenAmount, currency)} />
    <Metric label="Previsao total" value={formatCurrency(result.forecastAmount, currency)} />
  </div>
</Card>
```

Use `calculateRevenueForecast`.

- [ ] **Step 3: Build `GoalProgressSummary`**

Fetch:

- `sales`;
- `sales_goals`;
- `deals`;
- `proposals`.

Use identity:

- admin: show all sales rows;
- non-admin: show only current identity id.

Render compact rows with progress percentages for revenue, won deals, and sent proposals. Use a simple `<div className="h-2 rounded-full bg-muted">` bar with inner width `Math.min(100, progress)`.

- [ ] **Step 4: Build funnel, aging, ranking, and loss widgets**

Create each component with one card:

- `FunnelConversionSummary`: leads, converted leads, deals with proposal, accepted proposals, won deals.
- `PipelineAgingSummary`: average open deal age, stale deals, average sent proposal age.
- `AdvancedSellerRanking`: seller rows with won amount, weighted amount, accepted proposals, overdue tasks.
- `LossReasonSummary`: reason rows with count and amount.

Each component must:

- use existing `useGetList`;
- pass `pagination: { page: 1, perPage: 500 }`;
- return `null` while pending;
- avoid raw JSON on screen;
- use translated headings.

- [ ] **Step 5: Compose dashboard**

In `Dashboard.tsx`, add components in this order after the current top summaries:

```tsx
<RevenueForecastSummary />
<GoalProgressSummary />
<FunnelConversionSummary />
<PipelineAgingSummary />
<AdvancedSellerRanking />
<LossReasonSummary />
```

Keep cards in the existing dashboard grid. Do not create a hero section.

- [ ] **Step 6: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: exits 0.

- [ ] **Step 7: Browser smoke**

Open `/`. Verify:

- forecast card appears;
- goals card appears;
- funnel card appears;
- ranking card appears;
- loss reasons card appears;
- no raw translation keys are visible.

- [ ] **Step 8: Checkpoint**

Run:

```bash
if test -d .git; then git add src/components/atomic-crm/dashboard && git commit -m "feat: add advanced commercial dashboard"; else printf "checkpoint: advanced dashboard components\n"; fi
```

---

## Task 12: Dashboard I18n And Permissions

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/portugueseCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/i18nProvider.test.ts`
- Modify: dashboard components created in Task 11 if permission behavior needs adjustment.

- [ ] **Step 1: Add i18n test for dashboard keys**

In `i18nProvider.test.ts`, add:

```ts
expect(i18nProvider.translate("crm.dashboard.advanced.forecast.title")).toBe(
  "Previsao de receita",
);
expect(i18nProvider.translate("crm.dashboard.advanced.goals.title")).toBe(
  "Metas comerciais",
);
expect(i18nProvider.translate("crm.dashboard.advanced.funnel.title")).toBe(
  "Conversao do funil",
);
expect(i18nProvider.translate("crm.dashboard.advanced.losses.title")).toBe(
  "Motivos de perda",
);
```

- [ ] **Step 2: Add dashboard message keys**

In Portuguese messages under `crm.dashboard`, add:

```ts
advanced: {
  forecast: {
    title: "Previsao de receita",
    weighted_deals: "Negocios ponderados",
    open_proposals: "Propostas abertas",
    total: "Previsao total",
  },
  goals: {
    title: "Metas comerciais",
    revenue: "Receita",
    won_deals: "Negocios ganhos",
    sent_proposals: "Propostas enviadas",
  },
  funnel: {
    title: "Conversao do funil",
    leads: "Leads",
    converted_leads: "Leads convertidos",
    deals: "Negocios",
    deals_with_proposal: "Com proposta",
    accepted_proposals: "Propostas aceitas",
    won_deals: "Negocios ganhos",
  },
  aging: {
    title: "Tempo no pipeline",
    open_deal_age: "Idade media dos negocios",
    stale_deals: "Negocios parados",
    sent_proposal_age: "Idade media das propostas enviadas",
  },
  ranking: {
    title: "Ranking comercial",
    won_amount: "Valor ganho",
    weighted_amount: "Valor ponderado",
    accepted_proposals: "Propostas aceitas",
    overdue_tasks: "Tarefas vencidas",
  },
  losses: {
    title: "Motivos de perda",
    empty: "Nenhum motivo de perda registrado",
  },
},
```

Add equivalent English and French keys.

- [ ] **Step 3: Verify seller/admin filtering**

In components that show team-level data:

- use `useGetIdentity`;
- use `identity?.administrator` when available;
- for non-admin, add filters with `sales_id: identity.id` to deals, proposals, leads, tasks, and goals where the resource supports it;
- for sales list, non-admin should use only `[identity]` converted to a `Sale`-like object when a full sales record is not available.

- [ ] **Step 4: Run tests**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/providers/commons/i18nProvider.test.ts src/components/atomic-crm/dashboard/advancedCommercialDashboardUtils.test.ts
```

Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run:

```bash
if test -d .git; then git add src/components/atomic-crm/providers/commons src/components/atomic-crm/dashboard && git commit -m "feat: translate advanced dashboard"; else printf "checkpoint: dashboard i18n and permissions\n"; fi
```

---

## Task 13: FakeRest And Story Wrapper Integration

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/test/StoryWrapper.tsx`
- Modify: FakeRest generator files from Task 2 if missing fields appear during testing.

- [ ] **Step 1: Register new resources in StoryWrapper**

In `StoryWrapper.tsx`, ensure the in-memory data provider includes:

```ts
proposal_template_items: [],
sales_goals: [],
```

Use generated defaults if `StoryWrapper` imports the FakeRest generator.

- [ ] **Step 2: Run all app tests**

Run:

```bash
npm run test:unit:app
```

Expected: all app tests pass.

- [ ] **Step 3: Fix any missing FakeRest resource handling**

If FakeRest throws `Unknown resource proposal_template_items` or `Unknown resource sales_goals`, add those resource arrays to the FakeRest DB initialization and ensure the adapter receives them through the same path as existing resources.

- [ ] **Step 4: Checkpoint**

Run:

```bash
if test -d .git; then git add src/test src/components/atomic-crm/providers/fakerest && git commit -m "test: wire new resources into fakerest"; else printf "checkpoint: fakerest and story wrapper integration\n"; fi
```

---

## Task 14: Full Verification And Browser Smoke

**Files:**

- No planned source edits. Fix only issues found by verification.

- [ ] **Step 1: Run database verification**

Run:

```bash
npx supabase migration up --local
```

Expected: exits 0.

- [ ] **Step 2: Run full tests**

Run:

```bash
make test
```

Expected: all app and function tests pass.

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: exits 0.

- [ ] **Step 4: Run lint**

Run:

```bash
npm run lint
```

Expected: exits 0. The existing `.eslintignore` warning is acceptable unless ESLint exits non-zero.

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: exits 0. The existing Vite chunk-size warning is acceptable unless build exits non-zero.

- [ ] **Step 6: Run prettier check**

Run:

```bash
npm run prettier
```

Expected: exits 0.

- [ ] **Step 7: Browser smoke for Propostas V2**

With the app running at `http://localhost:5174/`:

1. Log in as an admin.
2. Open `/proposal_templates`.
3. Create or edit a template with two items.
4. Open `/deals/1/show`.
5. Click `Gerar proposta`.
6. Select the template.
7. Confirm escopo, condicoes, and items are filled.
8. Add tax and payment terms.
9. Save the proposal.
10. Click `Duplicar` and confirm a new draft opens.
11. Open print/export and confirm printable proposal has no broken layout.
12. Return to the deal and confirm proposal history shows original and duplicate.

- [ ] **Step 8: Browser smoke for dashboard**

1. Open `/sales_goals`.
2. Create/edit current-month goal for a seller.
3. Open `/`.
4. Confirm advanced widgets render:
   - Previsao de receita;
   - Metas comerciais;
   - Conversao do funil;
   - Tempo no pipeline;
   - Ranking comercial;
   - Motivos de perda.
5. Confirm no text contains `resources.`, `crm.dashboard.`, or `%{smart_count}`.
6. Confirm date/month/currency formatting is pt-BR.

- [ ] **Step 9: Final checkpoint**

Run:

```bash
if test -d .git; then git status --short; else printf "final checkpoint: no git repository in this workspace\n"; fi
```

Expected: either a clean or reviewed git status, or the no-git marker.

---

## Self-Review

- Spec coverage: templates, template items, duplication, printable preview, commercial fields, deal history, sales goals, revenue forecast, funnel conversion, pipeline aging, seller ranking, loss reasons, permissions, pt-BR, tests, and smoke are covered.
- Scope order: Fase 4A tasks are Tasks 1-8; Fase 4B tasks are Tasks 9-13; Task 14 verifies both.
- Type consistency: plan uses `ProposalTemplateItem`, `SalesGoal`, `tax_amount`, `internal_notes`, `delivery_time`, `payment_terms`, `proposal_template_items`, and `sales_goals` consistently across DB, types, FakeRest, and UI.
- Completion scan: every task has concrete files, commands, and expected verification.
