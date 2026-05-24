import type { DataProvider } from "ra-core";
import { describe, expect, it } from "vitest";

import type { AutomationRule, Deal, Lead, Proposal } from "../../types";
import {
  runDealCreatedAutomations,
  runDealUpdatedAutomations,
  runLeadCreatedAutomations,
  runProposalUpdatedAutomations,
} from "./automationEngine";

const lead: Lead = {
  id: 12,
  first_name: "Ana",
  last_name: "Silva",
  email: "ana@example.com",
  phone_number: "+55 51 99999-0000",
  company_name: "Acme Brasil",
  source: "Indicação",
  interest: "CRM",
  temperature: "hot",
  status: "new",
  next_action_at: null,
  discard_reason: null,
  converted_at: null,
  discarded_at: null,
  created_at: "2026-05-20T10:00:00.000Z",
  updated_at: "2026-05-20T10:00:00.000Z",
  sales_id: 4,
};

const deal: Deal = {
  id: 33,
  name: "Implantação CRM",
  company_id: 21,
  contact_ids: [31],
  category: "new-business",
  deal_type: "consultative",
  probability: 50,
  source: "Indicação",
  lost_reason: null,
  next_action_at: null,
  last_activity_at: "2026-05-20T10:00:00.000Z",
  stage: "opportunity",
  description: "Projeto inicial",
  amount: 15000,
  created_at: "2026-05-20T10:00:00.000Z",
  updated_at: "2026-05-20T10:00:00.000Z",
  expected_closing_date: "2026-06-20",
  sales_id: 4,
  index: 1,
};

const proposal: Proposal = {
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
  tax_amount: 0,
  total: 1000,
  valid_until: "2026-05-30",
  sent_at: "2026-05-20T12:00:00.000Z",
  accepted_at: null,
  rejected_at: null,
  created_at: "2026-05-20T12:00:00.000Z",
  updated_at: "2026-05-20T12:00:00.000Z",
};

const createProvider = (
  existingRuns: unknown[] = [],
  automationRules: Partial<AutomationRule>[] = [],
) => {
  const calls: Array<{ resource: string; params: unknown }> = [];
  const provider = {
    getList: async (resource: string) => {
      if (resource === "automation_rules") {
        return { data: automationRules, total: automationRules.length };
      }
      return { data: existingRuns, total: existingRuns.length };
    },
    getOne: async (resource: string) => {
      if (resource === "deals") {
        return { data: deal };
      }
      throw new Error(`Unexpected getOne resource: ${resource}`);
    },
    create: async (resource: string, params: any) => {
      calls.push({ resource, params });
      if (resource === "automation_runs") {
        return { data: { id: 91, ...params.data } };
      }
      return { data: { id: 101, ...params.data } };
    },
    update: async (resource: string, params: any) => {
      calls.push({ resource, params });
      return { data: { id: params.id, ...params.data } };
    },
  } as unknown as DataProvider;
  return { provider, calls };
};

describe("automationEngine", () => {
  it("creates first-contact task when a new lead has no next action", async () => {
    const { provider, calls } = createProvider();

    const results = await runLeadCreatedAutomations(provider, {
      lead,
      now: new Date("2026-05-20T12:00:00.000Z"),
    });

    expect(results).toEqual([
      expect.objectContaining({
        ruleKey: "lead.first-contact",
        created: true,
      }),
    ]);
    expect(calls).toEqual([
      {
        resource: "automation_runs",
        params: {
          data: expect.objectContaining({
            rule_key: "lead.first-contact",
            trigger_resource: "leads",
            trigger_record_id: 12,
            sales_id: 4,
          }),
        },
      },
      {
        resource: "tasks",
        params: {
          data: expect.objectContaining({
            lead_id: 12,
            contact_id: null,
            deal_id: null,
            automation_run_id: 91,
            sales_id: 4,
            due_date: "2026-05-20T12:00:00.000Z",
          }),
        },
      },
      {
        resource: "automation_runs",
        params: expect.objectContaining({
          id: 91,
          data: expect.objectContaining({
            action_resource: "tasks",
            action_record_id: 101,
          }),
        }),
      },
    ]);
  });

  it("does not create a duplicate task when the automation already ran", async () => {
    const { provider, calls } = createProvider([{ id: 91 }]);

    const results = await runLeadCreatedAutomations(provider, {
      lead,
      now: new Date("2026-05-20T12:00:00.000Z"),
    });

    expect(results).toEqual([
      expect.objectContaining({
        ruleKey: "lead.first-contact",
        created: false,
        skippedReason: "already-ran",
      }),
    ]);
    expect(calls).toEqual([]);
  });

  it("handles a concurrent automation run as already ran", async () => {
    const calls: Array<{ resource: string; params: unknown }> = [];
    let automationRuns: unknown[] = [];
    const provider = {
      getList: async (resource: string) => {
        if (resource === "automation_rules") {
          return { data: [], total: 0 };
        }
        return { data: automationRuns, total: automationRuns.length };
      },
      create: async (resource: string, params: any) => {
        calls.push({ resource, params });
        if (resource === "automation_runs") {
          automationRuns = [{ id: 91 }];
          throw new Error("duplicate key value violates unique constraint");
        }
        return { data: { id: 101, ...params.data } };
      },
      update: async (resource: string, params: any) => {
        calls.push({ resource, params });
        return { data: { id: params.id, ...params.data } };
      },
    } as unknown as DataProvider;

    const results = await runLeadCreatedAutomations(provider, {
      lead,
      now: new Date("2026-05-20T12:00:00.000Z"),
    });

    expect(results).toEqual([
      expect.objectContaining({
        ruleKey: "lead.first-contact",
        created: false,
        skippedReason: "already-ran",
        automationRunId: 91,
      }),
    ]);
    expect(calls).toEqual([
      {
        resource: "automation_runs",
        params: {
          data: expect.objectContaining({
            rule_key: "lead.first-contact",
            trigger_resource: "leads",
            trigger_record_id: 12,
          }),
        },
      },
    ]);
  });

  it("does not run when the matching automation rule is disabled", async () => {
    const { provider, calls } = createProvider(
      [],
      [
        {
          id: 1,
          rule_key: "lead.first-contact",
          enabled: false,
          params: { dueInDays: 0, taskType: "call" },
        },
      ],
    );

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

  it("creates a deal follow-up task when a deal is created without next action", async () => {
    const { provider, calls } = createProvider();

    await runDealCreatedAutomations(provider, {
      deal,
      now: new Date("2026-05-20T12:00:00.000Z"),
    });

    expect(calls[1]).toEqual({
      resource: "tasks",
      params: {
        data: expect.objectContaining({
          lead_id: null,
          contact_id: null,
          deal_id: 33,
          due_date: "2026-05-21T12:00:00.000Z",
        }),
      },
    });
  });

  it("creates a two-day follow-up when a deal moves to proposal-sent", async () => {
    const { provider, calls } = createProvider();

    await runDealUpdatedAutomations(provider, {
      previousDeal: { ...deal, stage: "opportunity" },
      deal: { ...deal, stage: "proposal-sent", next_action_at: null },
      now: new Date("2026-05-20T12:00:00.000Z"),
    });

    expect(calls[1]).toEqual({
      resource: "tasks",
      params: {
        data: expect.objectContaining({
          type: "follow-up",
          text: "Retomar proposta enviada: Implantação CRM",
          deal_id: 33,
          due_date: "2026-05-22T12:00:00.000Z",
        }),
      },
    });
  });

  it("creates automatic stage template tasks when a deal enters a configured stage", async () => {
    const calls: Array<{ resource: string; params: unknown }> = [];
    const listCalls: Array<{ resource: string; params: unknown }> = [];
    const provider = {
      getList: async (resource: string, params: unknown) => {
        listCalls.push({ resource, params });
        if (resource === "automation_rules") {
          return { data: [], total: 0 };
        }
        if (resource === "automation_runs") {
          return { data: [], total: 0 };
        }
        if (resource === "stage_task_templates") {
          return {
            data: [
              {
                id: 77,
                workspace_id: "workspace-1",
                pipeline_id: 1,
                stage: "proposal-sent",
                name: "Follow-up automatico",
                task_text: "Retomar {{deal.name}}",
                task_type: "follow-up",
                due_in_days: 2,
                mode: "automatic",
                enabled: true,
                instructions: null,
                assignee: "record_owner",
                index: 0,
                created_at: "2026-05-24T00:00:00.000Z",
                updated_at: "2026-05-24T00:00:00.000Z",
              },
            ],
            total: 1,
          };
        }
        return { data: [], total: 0 };
      },
      create: async (resource: string, params: any) => {
        calls.push({ resource, params });
        if (resource === "automation_runs") {
          return { data: { id: 91, ...params.data } };
        }
        return { data: { id: 101, ...params.data } };
      },
      update: async (resource: string, params: any) => {
        calls.push({ resource, params });
        return { data: { id: params.id, ...params.data } };
      },
    } as unknown as DataProvider;

    const previousDeal = {
      ...deal,
      pipeline_id: 1,
      stage: "opportunity",
    } satisfies Deal;
    const updatedDeal = {
      ...deal,
      pipeline_id: 1,
      stage: "proposal-sent",
    } satisfies Deal;

    const result = await runDealUpdatedAutomations(provider, {
      previousDeal,
      deal: updatedDeal,
      now: new Date("2026-05-24T10:00:00.000Z"),
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleKey: "stage-task-template.77.proposal-sent",
          created: true,
        }),
      ]),
    );
    expect(listCalls).toContainEqual({
      resource: "stage_task_templates",
      params: {
        filter: {
          "pipeline_id@eq": 1,
          "stage@eq": "proposal-sent",
          "mode@eq": "automatic",
          "enabled@eq": true,
        },
        pagination: { page: 1, perPage: 100 },
        sort: { field: "index", order: "ASC" },
      },
    });
    expect(calls).toContainEqual({
      resource: "tasks",
      params: {
        data: expect.objectContaining({
          deal_id: 33,
          text: "Retomar Implantação CRM",
          due_date: "2026-05-26T10:00:00.000Z",
        }),
      },
    });
  });

  it("keeps proposal follow-up running when stage templates fail to load", async () => {
    const calls: Array<{ resource: string; params: unknown }> = [];
    const provider = {
      getList: async (resource: string) => {
        if (resource === "stage_task_templates") {
          throw new Error("missing stage_task_templates collection");
        }
        if (resource === "automation_rules") {
          return { data: [], total: 0 };
        }
        if (resource === "automation_runs") {
          return { data: [], total: 0 };
        }
        return { data: [], total: 0 };
      },
      create: async (resource: string, params: any) => {
        calls.push({ resource, params });
        if (resource === "automation_runs") {
          return { data: { id: 91, ...params.data } };
        }
        return { data: { id: 101, ...params.data } };
      },
      update: async (resource: string, params: any) => {
        calls.push({ resource, params });
        return { data: { id: params.id, ...params.data } };
      },
    } as unknown as DataProvider;

    const result = await runDealUpdatedAutomations(provider, {
      previousDeal: { ...deal, pipeline_id: 1, stage: "opportunity" },
      deal: {
        ...deal,
        pipeline_id: 1,
        stage: "proposal-sent",
        next_action_at: null,
      },
      now: new Date("2026-05-24T10:00:00.000Z"),
    });

    expect(result).toEqual(
      expect.arrayContaining([
        {
          ruleKey: "stage-task-templates",
          created: false,
          skippedReason: "failed",
        },
        expect.objectContaining({
          ruleKey: "deal.proposal-follow-up",
          created: true,
        }),
      ]),
    );
    expect(calls).toContainEqual({
      resource: "tasks",
      params: {
        data: expect.objectContaining({
          deal_id: 33,
          text: "Retomar proposta enviada: Implantação CRM",
          due_date: "2026-05-26T10:00:00.000Z",
        }),
      },
    });
  });

  it("does not recreate automatic stage template tasks when the template run already exists", async () => {
    const calls: Array<{ resource: string; params: unknown }> = [];
    const provider = {
      getList: async (resource: string, params: any) => {
        if (resource === "automation_rules") {
          return { data: [], total: 0 };
        }
        if (resource === "automation_runs") {
          const existingRuns =
            params.filter.rule_key === "stage-task-template.77.proposal-sent"
              ? [{ id: 92 }]
              : [];
          return { data: existingRuns, total: existingRuns.length };
        }
        if (resource === "stage_task_templates") {
          return {
            data: [
              {
                id: 77,
                workspace_id: "workspace-1",
                pipeline_id: 1,
                stage: "proposal-sent",
                name: "Follow-up automatico",
                task_text: "Retomar {{deal.name}}",
                task_type: "follow-up",
                due_in_days: 2,
                mode: "automatic",
                enabled: true,
                instructions: null,
                assignee: "record_owner",
                index: 0,
                created_at: "2026-05-24T00:00:00.000Z",
                updated_at: "2026-05-24T00:00:00.000Z",
              },
            ],
            total: 1,
          };
        }
        return { data: [], total: 0 };
      },
      create: async (resource: string, params: any) => {
        calls.push({ resource, params });
        if (resource === "automation_runs") {
          return { data: { id: 91, ...params.data } };
        }
        return { data: { id: 101, ...params.data } };
      },
      update: async (resource: string, params: any) => {
        calls.push({ resource, params });
        return { data: { id: params.id, ...params.data } };
      },
    } as unknown as DataProvider;

    const result = await runDealUpdatedAutomations(provider, {
      previousDeal: { ...deal, pipeline_id: 1, stage: "opportunity" },
      deal: {
        ...deal,
        pipeline_id: 1,
        stage: "proposal-sent",
        next_action_at: null,
      },
      now: new Date("2026-05-24T10:00:00.000Z"),
    });

    expect(result).toEqual(
      expect.arrayContaining([
        {
          ruleKey: "stage-task-template.77.proposal-sent",
          created: false,
          skippedReason: "already-ran",
          automationRunId: 92,
        },
        expect.objectContaining({
          ruleKey: "deal.proposal-follow-up",
          created: true,
        }),
      ]),
    );
    expect(calls).not.toContainEqual({
      resource: "tasks",
      params: {
        data: expect.objectContaining({
          text: "Retomar Implantação CRM",
        }),
      },
    });
  });

  it("uses automation rule params to create proposal sent follow-up", async () => {
    const { provider, calls } = createProvider(
      [],
      [
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
    );

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

  it("moves deal to won when an accepted proposal rule uses move_deal_won", async () => {
    const { provider, calls } = createProvider(
      [],
      [
        {
          id: 5,
          rule_key: "proposal.accepted-action",
          enabled: true,
          params: {
            acceptedAction: "move_deal_won",
          },
        },
      ],
    );

    await runProposalUpdatedAutomations(provider, {
      previousProposal: { ...proposal, status: "sent" },
      proposal: { ...proposal, status: "accepted" },
      now: new Date("2026-05-20T12:00:00.000Z"),
    });

    expect(calls).toEqual([
      {
        resource: "automation_runs",
        params: {
          data: expect.objectContaining({
            rule_key: "proposal.accepted-action",
            trigger_resource: "proposals",
            trigger_record_id: 44,
          }),
        },
      },
      {
        resource: "deals",
        params: expect.objectContaining({
          id: 33,
          data: expect.objectContaining({
            stage: "won",
            probability: 100,
          }),
          previousData: deal,
        }),
      },
      {
        resource: "automation_runs",
        params: expect.objectContaining({
          id: 91,
          data: expect.objectContaining({
            action_resource: "deals",
            action_record_id: 33,
          }),
        }),
      },
    ]);
  });

  it("creates a closing task when an accepted proposal rule asks for one", async () => {
    const { provider, calls } = createProvider(
      [],
      [
        {
          id: 5,
          rule_key: "proposal.accepted-action",
          enabled: true,
          params: {
            acceptedAction: "create_closing_task",
            dueInDays: 1,
            taskType: "follow-up",
            taskText: "Fechar detalhes da proposta {{proposal.title}}",
          },
        },
      ],
    );

    await runProposalUpdatedAutomations(provider, {
      previousProposal: { ...proposal, status: "sent" },
      proposal: { ...proposal, status: "accepted" },
      now: new Date("2026-05-20T12:00:00.000Z"),
    });

    expect(calls[1]).toEqual({
      resource: "tasks",
      params: {
        data: expect.objectContaining({
          deal_id: 33,
          type: "follow-up",
          text: "Fechar detalhes da proposta Proposta CRM",
          due_date: "2026-05-21T12:00:00.000Z",
        }),
      },
    });
  });
});
