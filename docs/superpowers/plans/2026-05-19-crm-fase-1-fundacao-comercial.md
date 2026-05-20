# CRM Fase 1 Fundacao Comercial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current Atomic CRM deals area into a stronger sales operating system with richer deal metadata, better pipeline visibility, a daily seller cockpit, and basic manager metrics.

**Architecture:** Keep the existing Atomic CRM structure. Extend the current `deals` resource, configuration context, FakeRest demo data, and dashboard components instead of creating a parallel CRM module. Compute first-pass sales insights in focused frontend utilities; add database columns now and defer heavier summary views until later phases.

**Tech Stack:** React 19, TypeScript, Vite, ra-core, shadcn-admin-kit, shadcn/ui, Tailwind CSS v4, Supabase/Postgres declarative schemas, FakeRest demo provider, Vitest.

---

## Scope

This plan implements only Fase 1 from:

`/Users/yohannreimer/Downloads/atomic-crm-main/docs/superpowers/specs/2026-05-19-crm-nivel-2-design.md`

Included:

- richer deal fields: sale type, probability, source, lost reason, next action, last activity;
- configurable deal types and lost reasons;
- weighted pipeline value;
- deal risk helpers;
- stronger deal form/card/show UI;
- seller daily cockpit on dashboard;
- basic manager sales metrics;
- FakeRest/demo support;
- unit tests for reusable calculation logic.

Not included:

- separate Leads module;
- Proposals module;
- automation rule builder;
- WhatsApp/email/inbox/campaigns;
- advanced workflow canvas;
- generated Supabase migration committed by hand. Update schemas first, then generate migration using Supabase CLI.

---

## File Structure

Modify these files:

- `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/01_tables.sql`
  - Add commercial deal columns.
- `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/03_views.sql`
  - Keep `activity_log` compatible. No change required unless generated diff detects order-sensitive output.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/types.ts`
  - Extend `Deal` and configuration-related type aliases.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/ConfigurationContext.tsx`
  - Add `dealTypes` and `dealLostReasons`.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/defaultConfiguration.ts`
  - Add default sale types and lost reasons.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/CRM.tsx`
  - Seed new configuration fields.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/settings/SettingsPage.tsx`
  - Make deal types and lost reasons editable.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/settings/SettingsPage.test.ts`
  - Cover validation for new configurable lists.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`
  - Add labels.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`
  - Add labels with clear English fallback if translation is not available.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/deals.ts`
  - Generate demo values for new fields.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealInputs.tsx`
  - Add commercial fields to create/edit form.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealCard.tsx`
  - Show weighted amount, probability, type, and stale/no-next-action state.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealColumn.tsx`
  - Show total and weighted pipeline value.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealList.tsx`
  - Add filters for deal type, source, and risk.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealShow.tsx`
  - Show new commercial fields.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/Dashboard.tsx`
  - Replace part of the current dashboard with sales cockpit widgets.

Create these files:

- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/dealCommercialUtils.ts`
  - Shared deal metrics/risk logic.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/dealCommercialUtils.test.ts`
  - Unit tests for deal metrics/risk logic.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/SellerDailyCockpit.tsx`
  - Seller-facing daily work widget.
- `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/SalesManagerSummary.tsx`
  - Manager-facing metrics widget.

Generated by command, not manually edited:

- A new file in `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/migrations/` ending with `_commercial_deal_fields.sql`, created by `npx supabase db diff --local -f commercial_deal_fields`.

---

## Task 1: Add Commercial Deal Utility Tests

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/dealCommercialUtils.test.ts`
- Create after failing test: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/dealCommercialUtils.ts`

- [ ] **Step 1: Write the failing tests**

Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/dealCommercialUtils.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { Deal } from "../types";
import {
  getWeightedAmount,
  isDealMissingNextAction,
  isDealStale,
  getDealRiskState,
  summarizeDeals,
} from "./dealCommercialUtils";

const baseDeal = (overrides: Partial<Deal> = {}): Deal => ({
  id: 1,
  name: "Website redesign",
  company_id: 1,
  contact_ids: [1],
  category: "website-design",
  stage: "proposal-sent",
  description: "Project scope",
  amount: 10000,
  created_at: "2026-05-01T10:00:00.000Z",
  updated_at: "2026-05-01T10:00:00.000Z",
  expected_closing_date: "2026-06-01",
  sales_id: 1,
  index: 0,
  deal_type: "consultative",
  probability: 40,
  source: "referral",
  lost_reason: null,
  next_action_at: "2026-05-19T13:00:00.000Z",
  last_activity_at: "2026-05-18T13:00:00.000Z",
  ...overrides,
});

describe("dealCommercialUtils", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-05-19T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("computes weighted amount from amount and probability", () => {
    expect(getWeightedAmount(baseDeal({ amount: 10000, probability: 25 }))).toBe(
      2500,
    );
  });

  it("treats missing probability as zero weighted amount", () => {
    expect(getWeightedAmount(baseDeal({ probability: null }))).toBe(0);
  });

  it("detects deals missing a next action", () => {
    expect(isDealMissingNextAction(baseDeal({ next_action_at: null }))).toBe(
      true,
    );
    expect(isDealMissingNextAction(baseDeal())).toBe(false);
  });

  it("detects deals stale for at least the configured number of days", () => {
    expect(
      isDealStale(baseDeal({ last_activity_at: "2026-05-15T12:00:00.000Z" }), 3),
    ).toBe(true);
    expect(
      isDealStale(baseDeal({ last_activity_at: "2026-05-18T12:00:00.000Z" }), 3),
    ).toBe(false);
  });

  it("classifies missing next action before stale state", () => {
    expect(
      getDealRiskState(
        baseDeal({
          next_action_at: null,
          last_activity_at: "2026-05-10T12:00:00.000Z",
        }),
      ),
    ).toBe("missing_next_action");
  });

  it("summarizes open deals for manager dashboard", () => {
    const summary = summarizeDeals([
      baseDeal({ id: 1, amount: 10000, probability: 50, stage: "proposal-sent" }),
      baseDeal({ id: 2, amount: 20000, probability: 25, stage: "won" }),
      baseDeal({ id: 3, amount: 30000, probability: 10, stage: "lost" }),
    ]);

    expect(summary.openCount).toBe(1);
    expect(summary.openAmount).toBe(10000);
    expect(summary.weightedOpenAmount).toBe(5000);
    expect(summary.wonAmount).toBe(20000);
    expect(summary.lostAmount).toBe(30000);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/deals/dealCommercialUtils.test.ts
```

Expected: FAIL because `./dealCommercialUtils` does not exist.

- [ ] **Step 3: Create the utility implementation**

Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/dealCommercialUtils.ts`:

```ts
import type { Deal } from "../types";

export type DealRiskState = "healthy" | "missing_next_action" | "stale";

export type DealSummary = {
  openCount: number;
  openAmount: number;
  weightedOpenAmount: number;
  wonAmount: number;
  lostAmount: number;
};

const CLOSED_STAGES = new Set(["won", "lost"]);

export const getWeightedAmount = (deal: Pick<Deal, "amount" | "probability">) =>
  Math.round((deal.amount ?? 0) * ((deal.probability ?? 0) / 100));

export const isDealMissingNextAction = (
  deal: Pick<Deal, "next_action_at" | "stage">,
) => !CLOSED_STAGES.has(deal.stage) && !deal.next_action_at;

export const isDealStale = (
  deal: Pick<Deal, "last_activity_at" | "stage">,
  staleAfterDays = 3,
) => {
  if (CLOSED_STAGES.has(deal.stage)) return false;
  if (!deal.last_activity_at) return true;

  const staleAt = new Date(deal.last_activity_at);
  staleAt.setDate(staleAt.getDate() + staleAfterDays);
  return staleAt <= new Date();
};

export const getDealRiskState = (deal: Deal): DealRiskState => {
  if (isDealMissingNextAction(deal)) return "missing_next_action";
  if (isDealStale(deal)) return "stale";
  return "healthy";
};

export const summarizeDeals = (deals: Deal[]): DealSummary =>
  deals.reduce<DealSummary>(
    (summary, deal) => {
      if (deal.stage === "won") {
        summary.wonAmount += deal.amount ?? 0;
        return summary;
      }
      if (deal.stage === "lost") {
        summary.lostAmount += deal.amount ?? 0;
        return summary;
      }
      summary.openCount += 1;
      summary.openAmount += deal.amount ?? 0;
      summary.weightedOpenAmount += getWeightedAmount(deal);
      return summary;
    },
    {
      openCount: 0,
      openAmount: 0,
      weightedOpenAmount: 0,
      wonAmount: 0,
      lostAmount: 0,
    },
  );
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/deals/dealCommercialUtils.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit if this is a Git repo**

Run:

```bash
git add src/components/atomic-crm/deals/dealCommercialUtils.ts src/components/atomic-crm/deals/dealCommercialUtils.test.ts
git commit -m "test: add commercial deal utilities"
```

Expected: commit succeeds. If `git status` reports this directory is not a repository, skip commit and continue.

---

## Task 2: Extend Deal Types And Configuration Defaults

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/types.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/ConfigurationContext.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/defaultConfiguration.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/CRM.tsx`

- [ ] **Step 1: Update shared types**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/types.ts`, update `Deal` and add type aliases near the existing `DealStage` export:

```ts
export type Deal = {
  name: string;
  company_id: Identifier;
  contact_ids: Identifier[];
  category: string;
  stage: string;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  expected_closing_date: string;
  sales_id: Identifier;
  index: number;
  deal_type: string;
  probability: number | null;
  source: string | null;
  lost_reason: string | null;
  next_action_at: string | null;
  last_activity_at: string | null;
} & Pick<RaRecord, "id">;
```

Add below `export type DealStage = LabeledValue;`:

```ts
export type DealType = LabeledValue;
export type DealLostReason = LabeledValue;
```

- [ ] **Step 2: Update configuration context shape**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/ConfigurationContext.tsx`, change the type import:

```ts
import type {
  DealLostReason,
  DealStage,
  DealType,
  LabeledValue,
  NoteStatus,
} from "../types";
```

Add these fields to `ConfigurationContextValue`:

```ts
  dealTypes: DealType[];
  dealLostReasons: DealLostReason[];
```

- [ ] **Step 3: Add default commercial configuration**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/defaultConfiguration.ts`, add:

```ts
export const defaultDealTypes = [
  { value: "quick", label: "Quick Sale" },
  { value: "consultative", label: "Consultative Sale" },
  { value: "recurring", label: "Recurring Sale" },
];

export const defaultDealLostReasons = [
  { value: "price", label: "Price" },
  { value: "no-budget", label: "No Budget" },
  { value: "no-decision", label: "No Decision" },
  { value: "competitor", label: "Competitor" },
  { value: "bad-fit", label: "Bad Fit" },
  { value: "timing", label: "Timing" },
];
```

Add both fields to `defaultConfiguration`:

```ts
  dealTypes: defaultDealTypes,
  dealLostReasons: defaultDealLostReasons,
```

- [ ] **Step 4: Seed the new configuration fields**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/root/CRM.tsx`, import defaults:

```ts
  defaultDealLostReasons,
  defaultDealTypes,
```

Add props defaults in `CRM` destructuring:

```ts
  dealTypes = defaultDealTypes,
  dealLostReasons = defaultDealLostReasons,
```

Add them to the seeded store object:

```ts
        dealTypes,
        dealLostReasons,
```

- [ ] **Step 5: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit if possible**

```bash
git add src/components/atomic-crm/types.ts src/components/atomic-crm/root/ConfigurationContext.tsx src/components/atomic-crm/root/defaultConfiguration.ts src/components/atomic-crm/root/CRM.tsx
git commit -m "feat: add commercial deal configuration"
```

Expected: commit succeeds, or skip if no Git repo is available.

---

## Task 3: Add Deal Commercial Fields To Supabase Schema And FakeRest

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/01_tables.sql`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/deals.ts`
- Generated: a new `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/migrations/*_commercial_deal_fields.sql` file created by Supabase CLI

- [ ] **Step 1: Update the declarative schema**

In `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/schemas/01_tables.sql`, inside `create table public.deals`, after `index smallint`, change the end of the table to:

```sql
    index smallint,
    deal_type text not null default 'consultative',
    probability smallint default 25,
    source text,
    lost_reason text,
    next_action_at timestamp with time zone,
    last_activity_at timestamp with time zone,
    constraint deals_probability_range check (
        probability is null or (probability >= 0 and probability <= 100)
    )
);
```

- [ ] **Step 2: Update FakeRest deal generation**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/fakerest/dataGenerator/deals.ts`, update imports:

```ts
import {
  defaultDealCategories,
  defaultDealStages,
  defaultDealTypes,
} from "../../../root/defaultConfiguration";
```

Inside the generated object, after `index: 0,`, add:

```ts
      deal_type: random.arrayElement(defaultDealTypes).value,
      probability: datatype.number({ min: 10, max: 90 }),
      source: random.arrayElement([
        "referral",
        "website",
        "outbound",
        "event",
        "partner",
      ]),
      lost_reason: null,
      next_action_at: add(new Date(), {
        days: datatype.number({ min: -2, max: 7 }),
      }).toISOString(),
      last_activity_at: randomDate(new Date(created_at), new Date()).toISOString(),
```

After the stage indexes are computed, add this block before `return deals;`:

```ts
  deals.forEach((deal) => {
    if (deal.stage === "lost") {
      deal.lost_reason = random.arrayElement([
        "price",
        "no-budget",
        "no-decision",
        "competitor",
        "bad-fit",
        "timing",
      ]);
      deal.probability = 0;
    }
    if (deal.stage === "won") {
      deal.probability = 100;
    }
  });
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 4: Generate the migration**

Start local Supabase if needed:

```bash
npx supabase start
```

Generate migration:

```bash
npx supabase db diff --local -f commercial_deal_fields
```

Expected: a new SQL file appears in `/Users/yohannreimer/Downloads/atomic-crm-main/supabase/migrations/` and contains `alter table public.deals add column` statements for `deal_type`, `probability`, `source`, `lost_reason`, `next_action_at`, `last_activity_at`, plus the `deals_probability_range` constraint.

- [ ] **Step 5: Apply migration locally**

Run:

```bash
npx supabase migration up --local
```

Expected: migration applies successfully.

- [ ] **Step 6: Commit if possible**

```bash
git add supabase/schemas/01_tables.sql supabase/migrations src/components/atomic-crm/providers/fakerest/dataGenerator/deals.ts
git commit -m "feat: add commercial fields to deals"
```

Expected: commit succeeds, or skip if no Git repo is available.

---

## Task 4: Expose Commercial Settings

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/settings/SettingsPage.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/settings/SettingsPage.test.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`

- [ ] **Step 1: Extend settings validation tests**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/settings/SettingsPage.test.ts`, update the `deals` fixture:

```ts
  const deals: RaRecord[] = [
    {
      id: 1,
      stage: "won",
      category: "ui-design",
      deal_type: "consultative",
      lost_reason: null,
    },
    {
      id: 2,
      stage: "lost",
      category: "copywriting",
      deal_type: "quick",
      lost_reason: "price",
    },
    {
      id: 3,
      stage: "opportunity",
      category: "ui-design",
      deal_type: "recurring",
      lost_reason: null,
    },
  ];
```

Add tests:

```ts
  it("works with the deal_type field", () => {
    const items = [{ value: "consultative", label: "Consultative Sale" }];
    expect(
      validateItemsInUse(items, deals, "deal_type", "deal types"),
    ).toContain("quick");
  });

  it("works with the lost_reason field and ignores null values", () => {
    const items = [{ value: "timing", label: "Timing" }];
    expect(
      validateItemsInUse(items, deals, "lost_reason", "lost reasons"),
    ).toContain("price");
  });
```

- [ ] **Step 2: Run settings tests and verify they pass before UI edit**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/settings/SettingsPage.test.ts
```

Expected: PASS. The reusable validation already supports arbitrary fields.

- [ ] **Step 3: Include new fields in settings transform and defaults**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/settings/SettingsPage.tsx`, add to `transformFormValues` config:

```ts
    dealTypes: ensureValues(data.dealTypes),
    dealLostReasons: ensureValues(data.dealLostReasons),
```

Add to `defaultValues`:

```ts
      dealTypes: config.dealTypes,
      dealLostReasons: config.dealLostReasons,
```

Inside `SettingsFormFields`, after `categoryDisplayName`, add:

```ts
  const dealTypeDisplayName = translate(
    "crm.settings.validation.entities.deal_types",
  );
  const lostReasonDisplayName = translate(
    "crm.settings.validation.entities.lost_reasons",
  );
```

Add validators:

```ts
  const validateDealTypes = useCallback(
    (dealTypes: { value: string; label: string }[] | undefined) =>
      validateItemsInUse(dealTypes, deals, "deal_type", dealTypeDisplayName, {
        duplicate: (displayName, duplicates) =>
          translate("crm.settings.validation.duplicate", {
            display_name: displayName,
            items: duplicates.join(", "),
          }),
        inUse: (displayName, inUse) =>
          translate("crm.settings.validation.in_use", {
            display_name: displayName,
            items: inUse.join(", "),
          }),
        validating: translate("crm.settings.validation.validating"),
      }),
    [deals, dealTypeDisplayName, translate],
  );

  const validateDealLostReasons = useCallback(
    (lostReasons: { value: string; label: string }[] | undefined) =>
      validateItemsInUse(
        lostReasons,
        deals,
        "lost_reason",
        lostReasonDisplayName,
        {
          duplicate: (displayName, duplicates) =>
            translate("crm.settings.validation.duplicate", {
              display_name: displayName,
              items: duplicates.join(", "),
            }),
          inUse: (displayName, inUse) =>
            translate("crm.settings.validation.in_use", {
              display_name: displayName,
              items: inUse.join(", "),
            }),
          validating: translate("crm.settings.validation.validating"),
        },
      ),
    [deals, lostReasonDisplayName, translate],
  );
```

In the deals settings section, add two `ArrayInput` blocks matching the existing `dealStages` and `dealCategories` pattern:

```tsx
          <ArrayInput
            source="dealTypes"
            label="crm.settings.deals.types"
            validate={validateDealTypes}
          >
            <SimpleFormIterator>
              <TextInput source="label" helperText={false} />
              <TextInput source="value" helperText={false} />
            </SimpleFormIterator>
          </ArrayInput>

          <ArrayInput
            source="dealLostReasons"
            label="crm.settings.deals.lost_reasons"
            validate={validateDealLostReasons}
          >
            <SimpleFormIterator>
              <TextInput source="label" helperText={false} />
              <TextInput source="value" helperText={false} />
            </SimpleFormIterator>
          </ArrayInput>
```

- [ ] **Step 4: Add messages**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`, under `crm.settings.deals`, add:

```ts
        types: "Deal Types",
        lost_reasons: "Lost Reasons",
```

Under `crm.settings.validation.entities`, add:

```ts
          deal_types: "deal types",
          lost_reasons: "lost reasons",
```

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`, add the same keys. Use these strings if no French copy is desired yet:

```ts
        types: "Deal Types",
        lost_reasons: "Lost Reasons",
```

and:

```ts
          deal_types: "deal types",
          lost_reasons: "lost reasons",
```

- [ ] **Step 5: Run checks**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/settings/SettingsPage.test.ts
npm run typecheck
```

Expected: both PASS.

- [ ] **Step 6: Commit if possible**

```bash
git add src/components/atomic-crm/settings/SettingsPage.tsx src/components/atomic-crm/settings/SettingsPage.test.ts src/components/atomic-crm/providers/commons/englishCrmMessages.ts src/components/atomic-crm/providers/commons/frenchCrmMessages.ts
git commit -m "feat: expose commercial deal settings"
```

Expected: commit succeeds, or skip if no Git repo is available.

---

## Task 5: Update Deal Forms

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealInputs.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`

- [ ] **Step 1: Add commercial inputs**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealInputs.tsx`, update the config destructuring in `DealMiscInputs`:

```ts
  const { dealStages, dealCategories, dealTypes, dealLostReasons } =
    useConfigurationContext();
```

After the category input, add:

```tsx
      <SelectInput
        source="deal_type"
        choices={dealTypes}
        optionText="label"
        optionValue="value"
        defaultValue="consultative"
        helperText={false}
        validate={required()}
      />
```

After the amount input, add:

```tsx
      <NumberInput
        source="probability"
        defaultValue={25}
        helperText={false}
        min={0}
        max={100}
      />
```

After the expected closing date input, add:

```tsx
      <DateInput source="next_action_at" helperText={false} />
      <TextInput source="source" helperText={false} />
```

After the stage input, add:

```tsx
      <SelectInput
        source="lost_reason"
        choices={dealLostReasons}
        optionText="label"
        optionValue="value"
        helperText={false}
      />
```

- [ ] **Step 2: Add field labels**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`, under `resources.deals.fields`, add:

```ts
        deal_type: "Deal type",
        probability: "Probability",
        source: "Source",
        lost_reason: "Lost reason",
        next_action_at: "Next action",
        last_activity_at: "Last activity",
        weighted_amount: "Weighted value",
```

Add the same keys to `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`, using English fallback labels if needed.

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit if possible**

```bash
git add src/components/atomic-crm/deals/DealInputs.tsx src/components/atomic-crm/providers/commons/englishCrmMessages.ts src/components/atomic-crm/providers/commons/frenchCrmMessages.ts
git commit -m "feat: add commercial fields to deal forms"
```

Expected: commit succeeds, or skip if no Git repo is available.

---

## Task 6: Improve Pipeline Cards And Columns

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealCard.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealColumn.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`

- [ ] **Step 1: Update DealColumn weighted totals**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealColumn.tsx`, add import:

```ts
import { getWeightedAmount } from "./dealCommercialUtils";
```

After `totalAmount`, add:

```ts
  const weightedAmount = deals.reduce(
    (sum, deal) => sum + getWeightedAmount(deal),
    0,
  );
```

Replace the amount paragraph with:

```tsx
        <p className="text-sm text-muted-foreground">
          {totalAmount.toLocaleString("en-US", {
            notation: "compact",
            style: "currency",
            currency,
            currencyDisplay: "narrowSymbol",
            minimumSignificantDigits: 3,
          })}
          {" / "}
          {weightedAmount.toLocaleString("en-US", {
            notation: "compact",
            style: "currency",
            currency,
            currencyDisplay: "narrowSymbol",
            minimumSignificantDigits: 3,
          })}
        </p>
```

- [ ] **Step 2: Update DealCard commercial summary**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealCard.tsx`, add imports:

```ts
import { AlertCircle, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getDealRiskState,
  getWeightedAmount,
} from "./dealCommercialUtils";
```

Update config destructuring:

```ts
  const { dealCategories, dealTypes, currency } = useConfigurationContext();
```

Before `return`, add:

```ts
  const riskState = getDealRiskState(deal);
  const weightedAmount = getWeightedAmount(deal);
```

After the existing amount/category paragraph, add:

```tsx
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {deal.deal_type ? (
                <Badge variant="secondary">
                  {dealTypes.find((type) => type.value === deal.deal_type)
                    ?.label ?? deal.deal_type}
                </Badge>
              ) : null}
              {typeof deal.probability === "number" ? (
                <Badge variant="outline">{deal.probability}%</Badge>
              ) : null}
              <Badge variant="outline">
                {weightedAmount.toLocaleString("en-US", {
                  notation: "compact",
                  style: "currency",
                  currency,
                  currencyDisplay: "narrowSymbol",
                  minimumSignificantDigits: 3,
                })}
              </Badge>
              {riskState === "missing_next_action" ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  No next action
                </Badge>
              ) : null}
              {riskState === "stale" ? (
                <Badge variant="destructive" className="gap-1">
                  <CalendarClock className="h-3 w-3" />
                  Stale
                </Badge>
              ) : null}
            </div>
```

- [ ] **Step 3: Run targeted test and typecheck**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/deals/dealCommercialUtils.test.ts
npm run typecheck
```

Expected: both PASS.

- [ ] **Step 4: Commit if possible**

```bash
git add src/components/atomic-crm/deals/DealCard.tsx src/components/atomic-crm/deals/DealColumn.tsx
git commit -m "feat: show commercial pipeline signals"
```

Expected: commit succeeds, or skip if no Git repo is available.

---

## Task 7: Update Deal Show And Filters

**Files:**

- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealShow.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealList.tsx`

- [ ] **Step 1: Add deal filters**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealList.tsx`, update config destructuring:

```ts
  const { dealCategories, dealTypes } = useConfigurationContext();
```

After the category filter wrapper, add:

```tsx
    <WrapperField source="deal_type" label="resources.deals.fields.deal_type">
      <SelectInput
        source="deal_type"
        label={false}
        emptyText="resources.deals.fields.deal_type"
        choices={dealTypes}
        optionText="label"
        optionValue="value"
      />
    </WrapperField>,
```

Add source filter before `OnlyMineInput`:

```tsx
    <SearchInput
      source="source"
      placeholder={translate("resources.deals.fields.source")}
    />,
```

- [ ] **Step 2: Show commercial fields in DealShow**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/deals/DealShow.tsx`, add imports:

```ts
import { getWeightedAmount } from "./dealCommercialUtils";
```

Update config destructuring:

```ts
  const {
    dealStages,
    dealCategories,
    dealTypes,
    dealLostReasons,
    currency,
  } = useConfigurationContext();
```

After the amount block, insert:

```tsx
            <div className="flex flex-col mr-10">
              <span className="text-xs text-muted-foreground tracking-wide">
                {translate("resources.deals.fields.weighted_amount")}
              </span>
              <span className="text-sm">
                {getWeightedAmount(record).toLocaleString("en-US", {
                  notation: "compact",
                  style: "currency",
                  currency,
                  currencyDisplay: "narrowSymbol",
                  minimumSignificantDigits: 3,
                })}
              </span>
            </div>

            <div className="flex flex-col mr-10">
              <span className="text-xs text-muted-foreground tracking-wide">
                {translate("resources.deals.fields.probability")}
              </span>
              <span className="text-sm">{record.probability ?? 0}%</span>
            </div>
```

After the category block, insert:

```tsx
            {record.deal_type && (
              <div className="flex flex-col mr-10">
                <span className="text-xs text-muted-foreground tracking-wide">
                  {translate("resources.deals.fields.deal_type")}
                </span>
                <span className="text-sm">
                  {dealTypes.find((type) => type.value === record.deal_type)
                    ?.label ?? record.deal_type}
                </span>
              </div>
            )}

            {record.source && (
              <div className="flex flex-col mr-10">
                <span className="text-xs text-muted-foreground tracking-wide">
                  {translate("resources.deals.fields.source")}
                </span>
                <span className="text-sm">{record.source}</span>
              </div>
            )}
```

After the stage block, insert:

```tsx
            {record.lost_reason && (
              <div className="flex flex-col mr-10">
                <span className="text-xs text-muted-foreground tracking-wide">
                  {translate("resources.deals.fields.lost_reason")}
                </span>
                <span className="text-sm">
                  {dealLostReasons.find(
                    (reason) => reason.value === record.lost_reason,
                  )?.label ?? record.lost_reason}
                </span>
              </div>
            )}
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit if possible**

```bash
git add src/components/atomic-crm/deals/DealShow.tsx src/components/atomic-crm/deals/DealList.tsx
git commit -m "feat: expose commercial deal details"
```

Expected: commit succeeds, or skip if no Git repo is available.

---

## Task 8: Add Seller Daily Cockpit

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/SellerDailyCockpit.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/Dashboard.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`

- [ ] **Step 1: Create seller cockpit component**

Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/SellerDailyCockpit.tsx`:

```tsx
import { AlertCircle, CalendarCheck2, Target } from "lucide-react";
import { useGetIdentity, useGetList, useTranslate } from "ra-core";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Deal, Task } from "../types";
import { getDealRiskState } from "../deals/dealCommercialUtils";

export const SellerDailyCockpit = () => {
  const translate = useTranslate();
  const { identity } = useGetIdentity();
  const enabled = Number.isInteger(identity?.id);

  const { data: tasks = [] } = useGetList<Task>(
    "tasks",
    {
      pagination: { page: 1, perPage: 50 },
      sort: { field: "due_date", order: "ASC" },
      filter: {
        done_date: null,
        sales_id: identity?.id,
      },
    },
    { enabled },
  );

  const { data: deals = [] } = useGetList<Deal>(
    "deals",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "expected_closing_date", order: "ASC" },
      filter: {
        "archived_at@is": null,
        sales_id: identity?.id,
      },
    },
    { enabled },
  );

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const dueToday = tasks.filter(
    (task) => task.due_date && new Date(task.due_date) <= today,
  );
  const missingNextAction = deals.filter(
    (deal) => getDealRiskState(deal) === "missing_next_action",
  );
  const staleDeals = deals.filter((deal) => getDealRiskState(deal) === "stale");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" />
          {translate("crm.dashboard.seller_cockpit.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <CockpitRow
          icon={<CalendarCheck2 className="h-4 w-4" />}
          label={translate("crm.dashboard.seller_cockpit.due_today")}
          value={dueToday.length}
          to="/tasks"
        />
        <CockpitRow
          icon={<AlertCircle className="h-4 w-4" />}
          label={translate("crm.dashboard.seller_cockpit.no_next_action")}
          value={missingNextAction.length}
          to="/deals"
          urgent={missingNextAction.length > 0}
        />
        <CockpitRow
          icon={<AlertCircle className="h-4 w-4" />}
          label={translate("crm.dashboard.seller_cockpit.stale_deals")}
          value={staleDeals.length}
          to="/deals"
          urgent={staleDeals.length > 0}
        />
      </CardContent>
    </Card>
  );
};

const CockpitRow = ({
  icon,
  label,
  value,
  to,
  urgent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  to: string;
  urgent?: boolean;
}) => (
  <Link
    to={to}
    className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted"
  >
    <div className="text-muted-foreground">{icon}</div>
    <span className="flex-1 text-sm font-medium">{label}</span>
    <Badge variant={urgent ? "destructive" : "secondary"}>{value}</Badge>
  </Link>
);
```

- [ ] **Step 2: Add dashboard messages**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`, under `crm.dashboard`, add:

```ts
      seller_cockpit: {
        title: "Today in Sales",
        due_today: "Tasks due today",
        no_next_action: "Deals without next action",
        stale_deals: "Stale deals",
      },
```

Add the same keys to `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`, using English fallback labels if needed.

- [ ] **Step 3: Render cockpit on dashboard**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/Dashboard.tsx`, add import:

```ts
import { SellerDailyCockpit } from "./SellerDailyCockpit";
```

In the right column, render above `TasksList`:

```tsx
        <div className="flex flex-col gap-4">
          <SellerDailyCockpit />
          <TasksList />
        </div>
```

Replace the existing right column body:

```tsx
      <div className="md:col-span-3">
        <TasksList />
      </div>
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit if possible**

```bash
git add src/components/atomic-crm/dashboard/SellerDailyCockpit.tsx src/components/atomic-crm/dashboard/Dashboard.tsx src/components/atomic-crm/providers/commons/englishCrmMessages.ts src/components/atomic-crm/providers/commons/frenchCrmMessages.ts
git commit -m "feat: add seller daily cockpit"
```

Expected: commit succeeds, or skip if no Git repo is available.

---

## Task 9: Add Manager Sales Summary

**Files:**

- Create: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/SalesManagerSummary.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/Dashboard.tsx`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`
- Modify: `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`

- [ ] **Step 1: Create manager summary component**

Create `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/SalesManagerSummary.tsx`:

```tsx
import { BarChart3 } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Deal } from "../types";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { summarizeDeals } from "../deals/dealCommercialUtils";

export const SalesManagerSummary = () => {
  const translate = useTranslate();
  const { currency } = useConfigurationContext();
  const { data: deals = [] } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "expected_closing_date", order: "ASC" },
    filter: { "archived_at@is": null },
  });

  const summary = summarizeDeals(deals);
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-US", {
      notation: "compact",
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumSignificantDigits: 3,
    });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          {translate("crm.dashboard.sales_summary.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Metric
          label={translate("crm.dashboard.sales_summary.open_deals")}
          value={String(summary.openCount)}
        />
        <Metric
          label={translate("crm.dashboard.sales_summary.open_amount")}
          value={formatCurrency(summary.openAmount)}
        />
        <Metric
          label={translate("crm.dashboard.sales_summary.weighted_amount")}
          value={formatCurrency(summary.weightedOpenAmount)}
        />
        <Metric
          label={translate("crm.dashboard.sales_summary.won_amount")}
          value={formatCurrency(summary.wonAmount)}
        />
      </CardContent>
    </Card>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 text-lg font-semibold">{value}</p>
  </div>
);
```

- [ ] **Step 2: Add dashboard messages**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/englishCrmMessages.ts`, under `crm.dashboard`, add:

```ts
      sales_summary: {
        title: "Sales Summary",
        open_deals: "Open deals",
        open_amount: "Open value",
        weighted_amount: "Weighted value",
        won_amount: "Won value",
      },
```

Add the same keys to `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/providers/commons/frenchCrmMessages.ts`, using English fallback labels if needed.

- [ ] **Step 3: Render manager summary**

In `/Users/yohannreimer/Downloads/atomic-crm-main/src/components/atomic-crm/dashboard/Dashboard.tsx`, add import:

```ts
import { SalesManagerSummary } from "./SalesManagerSummary";
```

In the center column, render the summary before `DealsChart`:

```tsx
          <SalesManagerSummary />
          {totalDeal ? <DealsChart /> : null}
```

- [ ] **Step 4: Run utility tests and typecheck**

Run:

```bash
npm run test:unit:app -- src/components/atomic-crm/deals/dealCommercialUtils.test.ts
npm run typecheck
```

Expected: both PASS.

- [ ] **Step 5: Commit if possible**

```bash
git add src/components/atomic-crm/dashboard/SalesManagerSummary.tsx src/components/atomic-crm/dashboard/Dashboard.tsx src/components/atomic-crm/providers/commons/englishCrmMessages.ts src/components/atomic-crm/providers/commons/frenchCrmMessages.ts
git commit -m "feat: add sales manager summary"
```

Expected: commit succeeds, or skip if no Git repo is available.

---

## Task 10: Final Verification

**Files:**

- No new files. Verify all changed files.

- [ ] **Step 1: Run unit tests**

Run:

```bash
make test
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
make typecheck
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
make lint
```

Expected: PASS.

- [ ] **Step 4: Run build**

Run:

```bash
make build
```

Expected: PASS.

- [ ] **Step 5: Start demo app for manual QA**

Run:

```bash
make start-demo
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 6: Manual QA in browser**

Open `http://localhost:5173/` and verify:

- dashboard shows Today in Sales;
- dashboard shows Sales Summary;
- deals board shows weighted column totals;
- deal cards show probability and weighted value;
- creating a deal includes deal type, probability, next action, source, and lost reason;
- editing a deal preserves the new fields;
- settings page lets admins edit deal types and lost reasons;
- no text overlaps on desktop width around 1440px;
- no obvious broken layout on mobile width around 390px.

- [ ] **Step 7: Stop demo app**

Stop the Vite process with `Ctrl+C`.

- [ ] **Step 8: Final commit if possible**

```bash
git status --short
git add .
git commit -m "feat: deliver commercial CRM foundation"
```

Expected: commit succeeds, or skip if no Git repo is available.

---

## Self-Review Checklist

- Spec coverage:
  - Fase 1 richer deals: Tasks 2, 3, 5, 6, 7.
  - Seller daily cockpit: Task 8.
  - Basic manager metrics: Task 9.
  - Commercial settings: Task 4.
  - FakeRest/demo support: Task 3.
  - Tests and verification: Tasks 1, 4, 10.
- Placeholder scan:
  - No unresolved markers or unspecified implementation blocks.
- Type consistency:
  - New `Deal` fields use snake_case to match Supabase and existing code style.
  - `dealTypes` and `dealLostReasons` are configuration arrays using `{ value, label }`, matching existing stage/category patterns.
  - Utility names used by UI tasks match the definitions in Task 1.
