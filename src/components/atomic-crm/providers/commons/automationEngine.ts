import type { DataProvider, Identifier } from "ra-core";

import type {
  AutomationRule,
  AutomationRun,
  Deal,
  Lead,
  Proposal,
  StageTaskTemplate,
  Task,
} from "../../types";
import {
  buildStageTemplateRuleKey,
  buildTaskFromStageTemplate,
  filterStageTaskTemplates,
} from "../../deals/stageTaskTemplates";

const FIRST_CONTACT_RULE = "lead.first-contact";
const DEAL_FOLLOW_UP_RULE = "deal.follow-up-required";
const DEAL_PROPOSAL_FOLLOW_UP_RULE = "deal.proposal-follow-up";
const PROPOSAL_SENT_RULE = "proposal.sent-follow-up";
const PROPOSAL_ACCEPTED_RULE = "proposal.accepted-action";

type AutomationContext = {
  now?: Date;
};

type LeadAutomationContext = AutomationContext & {
  lead: Lead;
};

type DealCreatedAutomationContext = AutomationContext & {
  deal: Deal;
};

type DealUpdatedAutomationContext = AutomationContext & {
  deal: Deal;
  previousDeal: Deal;
};

type ProposalUpdatedAutomationContext = AutomationContext & {
  proposal: Proposal;
  previousProposal: Proposal;
};

export type AutomationResult = {
  ruleKey: string;
  created: boolean;
  skippedReason?: "already-ran" | "not-applicable" | "disabled";
  taskId?: Identifier;
  automationRunId?: Identifier;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getAutomationRule = async (
  dataProvider: DataProvider,
  ruleKey: string,
): Promise<AutomationRule | undefined> => {
  const { data } = await dataProvider.getList<AutomationRule>(
    "automation_rules",
    {
      filter: { rule_key: ruleKey },
      pagination: { page: 1, perPage: 1 },
      sort: { field: "id", order: "ASC" },
    },
  );

  return data.find((rule) => rule.rule_key === ruleKey) ?? data[0];
};

const getRuleParams = async (dataProvider: DataProvider, ruleKey: string) => {
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

const getExistingRun = async (
  dataProvider: DataProvider,
  ruleKey: string,
  triggerResource: string,
  triggerRecordId: Identifier,
) => {
  const { data } = await dataProvider.getList<AutomationRun>(
    "automation_runs",
    {
      filter: {
        rule_key: ruleKey,
        trigger_resource: triggerResource,
        trigger_record_id: triggerRecordId,
      },
      pagination: { page: 1, perPage: 1 },
      sort: { field: "id", order: "ASC" },
    },
  );

  return data[0];
};

const createAutomationRun = async (
  dataProvider: DataProvider,
  {
    ruleKey,
    triggerResource,
    triggerRecordId,
    message,
    salesId,
  }: {
    ruleKey: string;
    triggerResource: "leads" | "deals" | "proposals";
    triggerRecordId: Identifier;
    message: string;
    salesId?: Identifier | null;
  },
): Promise<
  | { automationRun: AutomationRun; result?: undefined }
  | { automationRun?: undefined; result: AutomationResult }
> => {
  const existingRun = await getExistingRun(
    dataProvider,
    ruleKey,
    triggerResource,
    triggerRecordId,
  );

  if (existingRun) {
    return {
      result: {
        ruleKey,
        created: false,
        skippedReason: "already-ran",
        automationRunId: existingRun.id,
      },
    };
  }

  let automationRun: AutomationRun;
  try {
    const result = await dataProvider.create<AutomationRun>("automation_runs", {
      data: {
        rule_key: ruleKey,
        trigger_resource: triggerResource,
        trigger_record_id: triggerRecordId,
        action_resource: null,
        action_record_id: null,
        status: "success",
        message,
        sales_id: salesId ?? null,
        created_at: new Date().toISOString(),
      },
    });
    automationRun = result.data;
  } catch (error) {
    const runCreatedConcurrently = await getExistingRun(
      dataProvider,
      ruleKey,
      triggerResource,
      triggerRecordId,
    );

    if (runCreatedConcurrently) {
      return {
        result: {
          ruleKey,
          created: false,
          skippedReason: "already-ran",
          automationRunId: runCreatedConcurrently.id,
        },
      };
    }

    throw error;
  }

  return { automationRun };
};

const runTaskAutomation = async (
  dataProvider: DataProvider,
  {
    ruleKey,
    triggerResource,
    triggerRecordId,
    task,
    message,
    salesId,
  }: {
    ruleKey: string;
    triggerResource: "leads" | "deals" | "proposals";
    triggerRecordId: Identifier;
    task: Omit<Task, "id">;
    message: string;
    salesId?: Identifier | null;
  },
): Promise<AutomationResult> => {
  const { automationRun, result } = await createAutomationRun(dataProvider, {
    ruleKey,
    triggerResource,
    triggerRecordId,
    message,
    salesId,
  });

  if (result) {
    return result;
  }

  const { data: createdTask } = await dataProvider.create<Task>("tasks", {
    data: {
      ...task,
      automation_run_id: automationRun.id,
    },
  });

  await dataProvider.update<AutomationRun>("automation_runs", {
    id: automationRun.id,
    data: {
      action_resource: "tasks",
      action_record_id: createdTask.id,
    },
    previousData: automationRun,
  });

  return {
    ruleKey,
    created: true,
    taskId: createdTask.id,
    automationRunId: automationRun.id,
  };
};

const runDealWonAutomation = async (
  dataProvider: DataProvider,
  {
    proposal,
    ruleKey,
  }: {
    proposal: Proposal;
    ruleKey: string;
  },
): Promise<AutomationResult> => {
  const { automationRun, result } = await createAutomationRun(dataProvider, {
    ruleKey,
    triggerResource: "proposals",
    triggerRecordId: proposal.id,
    salesId: proposal.sales_id ?? null,
    message: "Proposta aceita: negócio movido para ganho",
  });

  if (result) {
    return result;
  }

  const { data: deal } = await dataProvider.getOne<Deal>("deals", {
    id: proposal.deal_id,
  });
  const { data: updatedDeal } = await dataProvider.update<Deal>("deals", {
    id: deal.id,
    data: {
      stage: "won",
      probability: 100,
      updated_at: new Date().toISOString(),
    },
    previousData: deal,
  });

  await dataProvider.update<AutomationRun>("automation_runs", {
    id: automationRun.id,
    data: {
      action_resource: "deals",
      action_record_id: updatedDeal.id,
    },
    previousData: automationRun,
  });

  return {
    ruleKey,
    created: true,
    automationRunId: automationRun.id,
  };
};

export const runLeadCreatedAutomations = async (
  dataProvider: DataProvider,
  { lead, now = new Date() }: LeadAutomationContext,
): Promise<AutomationResult[]> => {
  if (lead.next_action_at) {
    return [
      {
        ruleKey: FIRST_CONTACT_RULE,
        created: false,
        skippedReason: "not-applicable",
      },
    ];
  }

  const rule = await getRuleParams(dataProvider, FIRST_CONTACT_RULE);
  if (!rule.enabled) {
    return [
      {
        ruleKey: FIRST_CONTACT_RULE,
        created: false,
        skippedReason: "disabled",
      },
    ];
  }

  const dueInDays = rule.params.dueInDays ?? 0;
  const leadName = `${lead.first_name} ${lead.last_name ?? ""}`.trim();
  const taskText = renderTemplate(
    rule.params.taskText ?? "Primeiro contato com {{lead.name}}",
    {
      "lead.name": leadName,
      "lead.first_name": lead.first_name,
      "lead.last_name": lead.last_name ?? "",
    },
  );

  return [
    await runTaskAutomation(dataProvider, {
      ruleKey: FIRST_CONTACT_RULE,
      triggerResource: "leads",
      triggerRecordId: lead.id,
      salesId: lead.sales_id ?? null,
      message: "Lead criado sem próxima ação",
      task: {
        lead_id: lead.id,
        contact_id: null,
        deal_id: null,
        automation_run_id: null,
        type: rule.params.taskType ?? "call",
        text: taskText,
        due_date: addDays(now, dueInDays).toISOString(),
        done_date: null,
        sales_id: lead.sales_id,
      },
    }),
  ];
};

export const runDealCreatedAutomations = async (
  dataProvider: DataProvider,
  { deal, now = new Date() }: DealCreatedAutomationContext,
): Promise<AutomationResult[]> => {
  if (deal.next_action_at) {
    return [
      {
        ruleKey: DEAL_FOLLOW_UP_RULE,
        created: false,
        skippedReason: "not-applicable",
      },
    ];
  }

  const rule = await getRuleParams(dataProvider, DEAL_FOLLOW_UP_RULE);
  if (!rule.enabled) {
    return [
      {
        ruleKey: DEAL_FOLLOW_UP_RULE,
        created: false,
        skippedReason: "disabled",
      },
    ];
  }

  const dueInDays = rule.params.dueInDays ?? 1;
  const taskText = renderTemplate(
    rule.params.taskText ?? "Definir próximo passo: {{deal.name}}",
    { "deal.name": deal.name },
  );

  return [
    await runTaskAutomation(dataProvider, {
      ruleKey: DEAL_FOLLOW_UP_RULE,
      triggerResource: "deals",
      triggerRecordId: deal.id,
      salesId: deal.sales_id,
      message: "Negócio criado sem próxima ação",
      task: {
        contact_id: null,
        lead_id: null,
        deal_id: deal.id,
        automation_run_id: null,
        type: rule.params.taskType ?? "follow-up",
        text: taskText,
        due_date: addDays(now, dueInDays).toISOString(),
        done_date: null,
        sales_id: deal.sales_id,
      },
    }),
  ];
};

const runAutomaticStageTemplates = async (
  dataProvider: DataProvider,
  {
    deal,
    previousDeal,
    now,
  }: {
    deal: Deal;
    previousDeal: Deal;
    now: Date;
  },
): Promise<AutomationResult[]> => {
  if (deal.stage === previousDeal.stage || !deal.pipeline_id) {
    return [];
  }

  const { data: templates } = await dataProvider.getList<StageTaskTemplate>(
    "stage_task_templates",
    {
      filter: {
        "pipeline_id@eq": deal.pipeline_id,
        "stage@eq": deal.stage,
        "mode@eq": "automatic",
        "enabled@eq": true,
      },
      pagination: { page: 1, perPage: 100 },
      sort: { field: "index", order: "ASC" },
    },
  );

  const activeTemplates = filterStageTaskTemplates(templates, {
    pipelineId: deal.pipeline_id,
    stage: deal.stage,
    mode: "automatic",
  });

  return Promise.all(
    activeTemplates.map((template) =>
      runTaskAutomation(dataProvider, {
        ruleKey: buildStageTemplateRuleKey(template, deal.stage),
        triggerResource: "deals",
        triggerRecordId: deal.id,
        salesId: deal.sales_id,
        message: `Negócio movido para ${deal.stage}: ${template.name}`,
        task: buildTaskFromStageTemplate(template, { deal, now }),
      }),
    ),
  );
};

export const runDealUpdatedAutomations = async (
  dataProvider: DataProvider,
  { deal, previousDeal, now = new Date() }: DealUpdatedAutomationContext,
): Promise<AutomationResult[]> => {
  const stageTemplateResults = await runAutomaticStageTemplates(dataProvider, {
    deal,
    previousDeal,
    now,
  });

  if (
    deal.stage !== "proposal-sent" ||
    previousDeal.stage === "proposal-sent"
  ) {
    return [
      ...stageTemplateResults,
      {
        ruleKey: DEAL_PROPOSAL_FOLLOW_UP_RULE,
        created: false,
        skippedReason: "not-applicable",
      },
    ];
  }

  const rule = await getRuleParams(dataProvider, DEAL_PROPOSAL_FOLLOW_UP_RULE);
  if (!rule.enabled) {
    return [
      ...stageTemplateResults,
      {
        ruleKey: DEAL_PROPOSAL_FOLLOW_UP_RULE,
        created: false,
        skippedReason: "disabled",
      },
    ];
  }

  const dueInDays = rule.params.dueInDays ?? 2;
  const taskText = renderTemplate(
    rule.params.taskText ?? "Retomar proposta enviada: {{deal.name}}",
    { "deal.name": deal.name },
  );

  return [
    ...stageTemplateResults,
    await runTaskAutomation(dataProvider, {
      ruleKey: DEAL_PROPOSAL_FOLLOW_UP_RULE,
      triggerResource: "deals",
      triggerRecordId: deal.id,
      salesId: deal.sales_id,
      message: "Negócio movido para proposta enviada",
      task: {
        contact_id: null,
        lead_id: null,
        deal_id: deal.id,
        automation_run_id: null,
        type: rule.params.taskType ?? "follow-up",
        text: taskText,
        due_date: addDays(now, dueInDays).toISOString(),
        done_date: null,
        sales_id: deal.sales_id,
      },
    }),
  ];
};

export const runProposalUpdatedAutomations = async (
  dataProvider: DataProvider,
  {
    proposal,
    previousProposal,
    now = new Date(),
  }: ProposalUpdatedAutomationContext,
): Promise<AutomationResult[]> => {
  if (proposal.status === "sent" && previousProposal.status !== "sent") {
    const rule = await getRuleParams(dataProvider, PROPOSAL_SENT_RULE);
    if (!rule.enabled) {
      return [
        {
          ruleKey: PROPOSAL_SENT_RULE,
          created: false,
          skippedReason: "disabled",
        },
      ];
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

  if (
    proposal.status === "accepted" &&
    previousProposal.status !== "accepted"
  ) {
    const rule = await getRuleParams(dataProvider, PROPOSAL_ACCEPTED_RULE);
    if (!rule.enabled) {
      return [
        {
          ruleKey: PROPOSAL_ACCEPTED_RULE,
          created: false,
          skippedReason: "disabled",
        },
      ];
    }

    const acceptedAction = rule.params.acceptedAction ?? "move_deal_won";
    if (acceptedAction === "move_deal_won") {
      return [
        await runDealWonAutomation(dataProvider, {
          proposal,
          ruleKey: PROPOSAL_ACCEPTED_RULE,
        }),
      ];
    }

    if (acceptedAction === "create_closing_task") {
      const dueInDays = rule.params.dueInDays ?? 0;
      const taskText = renderTemplate(
        rule.params.taskText ??
          "Concluir fechamento da proposta: {{proposal.title}}",
        { "proposal.title": proposal.title },
      );

      return [
        await runTaskAutomation(dataProvider, {
          ruleKey: PROPOSAL_ACCEPTED_RULE,
          triggerResource: "proposals",
          triggerRecordId: proposal.id,
          salesId: proposal.sales_id ?? null,
          message: "Proposta marcada como aceita",
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

    return [
      {
        ruleKey: PROPOSAL_ACCEPTED_RULE,
        created: false,
        skippedReason: "not-applicable",
      },
    ];
  }

  return [
    {
      ruleKey: PROPOSAL_SENT_RULE,
      created: false,
      skippedReason: "not-applicable",
    },
  ];
};
