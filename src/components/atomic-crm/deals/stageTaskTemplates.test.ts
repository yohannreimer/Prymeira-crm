import { describe, expect, it } from "vitest";
import type { Company, Contact, Deal, StageTaskTemplate, Task } from "../types";
import {
  buildStageTemplateRuleKey,
  buildTaskFromStageTemplate,
  filterStageTaskTemplates,
  hasOpenTaskForTemplate,
  renderStageTaskText,
} from "./stageTaskTemplates";

const template = (
  overrides: Partial<StageTaskTemplate> = {},
): StageTaskTemplate => ({
  id: 10,
  workspace_id: "workspace-1",
  pipeline_id: 1,
  stage: "proposal-sent",
  name: "Follow-up proposta",
  task_text: "Retomar {{deal.name}} com {{company.name}} e {{contact.name}}",
  task_type: "follow-up",
  due_in_days: 2,
  mode: "manual",
  enabled: true,
  instructions: null,
  assignee: "record_owner",
  index: 0,
  created_at: "2026-05-24T00:00:00.000Z",
  updated_at: "2026-05-24T00:00:00.000Z",
  ...overrides,
});

const deal = (overrides: Partial<Deal> = {}): Deal =>
  ({
    id: 5,
    workspace_id: "workspace-1",
    name: "Gerar proposta",
    company_id: 7,
    contact_ids: [9],
    category: "consulting",
    deal_type: "consultative",
    probability: 40,
    source: null,
    lost_reason: null,
    next_action_at: null,
    last_activity_at: "2026-05-24T00:00:00.000Z",
    stage: "proposal-sent",
    description: "",
    amount: 1000,
    created_at: "2026-05-24T00:00:00.000Z",
    updated_at: "2026-05-24T00:00:00.000Z",
    expected_closing_date: "2026-06-01",
    sales_id: 3,
    pipeline_id: 1,
    index: 0,
    ...overrides,
  }) as Deal;

describe("stageTaskTemplates", () => {
  it("filters enabled templates by pipeline, stage and mode", () => {
    const templates = [
      template({ id: 1, mode: "manual" }),
      template({ id: 2, mode: "automatic" }),
      template({ id: 3, enabled: false }),
      template({ id: 4, stage: "won" }),
    ];

    expect(
      filterStageTaskTemplates(templates, {
        pipelineId: 1,
        stage: "proposal-sent",
        mode: "manual",
      }).map((item) => item.id),
    ).toEqual([1]);
  });

  it("renders deal, company and contact variables", () => {
    expect(
      renderStageTaskText(template(), {
        deal: deal(),
        company: { name: "Empresa X" } as Company,
        contact: { first_name: "Ana", last_name: "Silva" } as Contact,
      }),
    ).toBe("Retomar Gerar proposta com Empresa X e Ana Silva");
  });

  it("builds a task payload with relative due date and primary contact", () => {
    const payload = buildTaskFromStageTemplate(template(), {
      deal: deal(),
      now: new Date("2026-05-24T12:00:00.000Z"),
      company: { name: "Empresa X" } as Company,
      contact: { first_name: "Ana", last_name: "Silva" } as Contact,
    });

    expect(payload).toMatchObject({
      deal_id: 5,
      contact_id: 9,
      lead_id: null,
      automation_run_id: null,
      type: "follow-up",
      sales_id: 3,
      due_date: "2026-05-26T12:00:00.000Z",
    });
  });

  it("detects an open task created for the same template", () => {
    const tasks = [
      { text: "Follow-up proposta", done_date: null } as Task,
      { text: "Other", done_date: null } as Task,
    ];

    expect(hasOpenTaskForTemplate(template(), tasks)).toBe(true);
  });

  it("builds stable automatic rule keys", () => {
    expect(buildStageTemplateRuleKey(template(), "proposal-sent")).toBe(
      "stage-task-template.10.proposal-sent",
    );
  });
});
