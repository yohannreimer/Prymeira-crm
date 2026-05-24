import { render } from "vitest-browser-react";
import { StoryWrapper } from "@/test/StoryWrapper";
import { DEFAULT_WORKSPACE_ID } from "../providers/fakerest/dataGenerator";

import type { Deal, StageTaskTemplate, Task } from "../types";
import { DealStageTaskPanel } from "./DealStageTaskPanel";

const deal: Deal = {
  id: 5,
  workspace_id: DEFAULT_WORKSPACE_ID,
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
};

const stageTaskTemplate: StageTaskTemplate = {
  id: 10,
  workspace_id: DEFAULT_WORKSPACE_ID,
  pipeline_id: 1,
  stage: "proposal-sent",
  name: "Follow-up da proposta",
  task_text: "Retomar {{deal.name}}",
  task_type: "follow-up",
  due_in_days: 2,
  mode: "manual",
  enabled: true,
  instructions: null,
  assignee: "record_owner",
  index: 0,
  created_at: "2026-05-24T00:00:00.000Z",
  updated_at: "2026-05-24T00:00:00.000Z",
};

const renderPanel = ({
  currentDeal = deal,
  templates = [stageTaskTemplate],
  tasks = [],
  createSpy = vi
    .fn()
    .mockImplementation(async (_resource: string, params: any) => ({
      data: { id: 99, ...params.data },
    })),
  updateSpy = vi.fn().mockResolvedValue({ data: currentDeal }),
}: {
  currentDeal?: Deal;
  templates?: StageTaskTemplate[];
  tasks?: Task[];
  createSpy?: ReturnType<typeof vi.fn>;
  updateSpy?: ReturnType<typeof vi.fn>;
} = {}) =>
  render(
    <StoryWrapper
      data={{
        deals: [currentDeal],
        stage_task_templates: templates,
        tasks,
      }}
      dataProvider={{ create: createSpy as any, update: updateSpy as any }}
    >
      <DealStageTaskPanel deal={currentDeal} />
    </StoryWrapper>,
  );

describe("DealStageTaskPanel", () => {
  it("creates a suggested task for the deal and updates next action", async () => {
    const createSpy = vi.fn(async (_resource: string, params: any) => ({
      data: { id: 99, ...params.data },
    }));
    const updateSpy = vi.fn(async (_resource: string, params: any) => ({
      data: { id: params.id, ...params.data },
    }));

    const screen = await renderPanel({ createSpy, updateSpy });

    await expect
      .element(
        screen.getByText(/Próximas ações sugeridas|Suggested next actions/),
      )
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /Follow-up da proposta/ }))
      .toBeInTheDocument();

    await screen.getByRole("button", { name: /Follow-up da proposta/ }).click();

    await expect
      .poll(() => createSpy)
      .toHaveBeenCalledWith(
        "tasks",
        expect.objectContaining({
          data: expect.objectContaining({
            deal_id: deal.id,
            text: expect.stringContaining(deal.name),
          }),
        }),
      );
    await expect
      .poll(() => updateSpy)
      .toHaveBeenCalledWith(
        "deals",
        expect.objectContaining({
          id: deal.id,
          data: expect.objectContaining({
            next_action_at: expect.any(String),
          }),
          previousData: deal,
        }),
      );
  });

  it("preserves an existing earlier next action", async () => {
    const currentDeal = {
      ...deal,
      next_action_at: "2020-01-01T00:00:00.000Z",
    };
    const createSpy = vi.fn(async (_resource: string, params: any) => ({
      data: { id: 99, ...params.data },
    }));
    const updateSpy = vi.fn();

    const screen = await renderPanel({ currentDeal, createSpy, updateSpy });

    await screen.getByRole("button", { name: /Follow-up da proposta/ }).click();

    await expect.poll(() => createSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("disables an existing open matching suggestion and does not create a duplicate", async () => {
    const createSpy = vi.fn();
    const matchingTask = {
      id: 20,
      workspace_id: DEFAULT_WORKSPACE_ID,
      deal_id: deal.id,
      contact_id: deal.contact_ids[0],
      lead_id: null,
      automation_run_id: null,
      type: stageTaskTemplate.task_type,
      text: "Retomar Gerar proposta",
      due_date: "2026-05-26T00:00:00.000Z",
      done_date: null,
      sales_id: deal.sales_id,
    } satisfies Task;

    const screen = await renderPanel({ createSpy, tasks: [matchingTask] });
    const button = screen.getByRole("button", {
      name: /Follow-up da proposta/,
    });

    await expect.element(button).toBeDisabled();

    expect(createSpy).not.toHaveBeenCalled();
  });

  it("prevents rapid double-click duplicate creation while pending", async () => {
    let resolveCreate: ((value: unknown) => void) | undefined;
    const createSpy = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        }),
    );

    const screen = await renderPanel({ createSpy });
    const button = screen.getByRole("button", {
      name: /Follow-up da proposta/,
    });

    await button.click();

    expect(createSpy).toHaveBeenCalledTimes(1);
    await expect.element(button).toBeDisabled();
    resolveCreate?.({ data: { id: 99 } });
  });

  it("renders nothing when there are no suggestions", async () => {
    const screen = await renderPanel({ templates: [] });

    await expect
      .element(
        screen.getByText(/Próximas ações sugeridas|Suggested next actions/),
      )
      .not.toBeInTheDocument();
  });

  it("does not update the deal when task creation fails", async () => {
    const createSpy = vi.fn().mockRejectedValue(new Error("create failed"));
    const updateSpy = vi.fn();

    const screen = await renderPanel({ createSpy, updateSpy });

    await screen.getByRole("button", { name: /Follow-up da proposta/ }).click();

    await expect.poll(() => createSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
