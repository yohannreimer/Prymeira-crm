import type {
  Company,
  Contact,
  Deal,
  StageTaskTemplate,
  StageTaskTemplateMode,
  Task,
} from "../types";

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const compactWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

type StageTaskRenderContext = {
  deal: Pick<Deal, "name">;
  company?: Pick<Company, "name"> | null;
  contact?: Partial<Contact> | null;
};

export const getContactDisplayName = (contact?: Partial<Contact> | null) =>
  compactWhitespace(
    [contact?.first_name, contact?.last_name].filter(Boolean).join(" "),
  );

export const renderStageTaskText = (
  template: Pick<StageTaskTemplate, "task_text" | "name">,
  {
    deal,
    company,
    contact,
  }: StageTaskRenderContext,
) =>
  compactWhitespace(
    (template.task_text || template.name)
      .replaceAll("{{deal.name}}", deal.name ?? "")
      .replaceAll("{{company.name}}", company?.name ?? "")
      .replaceAll("{{contact.name}}", getContactDisplayName(contact)),
  );

export const filterStageTaskTemplates = (
  templates: readonly StageTaskTemplate[],
  {
    pipelineId,
    stage,
    mode,
  }: {
    pipelineId?: Deal["pipeline_id"] | null;
    stage: string;
    mode?: StageTaskTemplateMode;
  },
) =>
  templates
    .filter((template) => {
      if (!template.enabled) return false;
      if (String(template.pipeline_id) !== String(pipelineId ?? "")) {
        return false;
      }
      if (template.stage !== stage) return false;
      if (mode && template.mode !== mode) return false;
      return true;
    })
    .sort(
      (a, b) => a.index - b.index || String(a.id).localeCompare(String(b.id)),
    );

export const buildStageTemplateRuleKey = (
  template: Pick<StageTaskTemplate, "id">,
  stage: string,
) => `stage-task-template.${template.id}.${stage}`;

export const buildTaskFromStageTemplate = (
  template: StageTaskTemplate,
  {
    deal,
    now = new Date(),
    company,
    contact,
  }: {
    deal: Deal;
    now?: Date;
    company?: Company | null;
    contact?: Contact | null;
  },
) => ({
  contact_id: deal.contact_ids?.[0] ?? null,
  lead_id: null,
  deal_id: deal.id,
  automation_run_id: null,
  type: template.task_type,
  text: renderStageTaskText(template, { deal, company, contact }),
  due_date: addDays(now, template.due_in_days).toISOString(),
  done_date: null,
  sales_id: deal.sales_id,
});

export const hasOpenTaskForTemplate = (
  template: Pick<StageTaskTemplate, "name" | "task_text">,
  tasks: readonly Pick<Task, "text" | "done_date">[],
  context?: StageTaskRenderContext,
) =>
  tasks.some((task) => {
    if (task.done_date) return false;

    const expectedTexts = [
      template.name,
      template.task_text,
      context ? renderStageTaskText(template, context) : undefined,
    ];

    return expectedTexts.some((text) => task.text === text);
  });
