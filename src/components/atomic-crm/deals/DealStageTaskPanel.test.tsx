import { render } from "vitest-browser-react";
import { StoryWrapper } from "@/test/StoryWrapper";
import { DEFAULT_WORKSPACE_ID } from "../providers/fakerest/dataGenerator";

import type { Deal, StageTaskTemplate } from "../types";
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

describe("DealStageTaskPanel", () => {
  it("creates a suggested task for the deal", async () => {
    const createSpy = vi
      .fn()
      .mockImplementation(async (_resource: string, params: any) => ({
        data: { id: 99, ...params.data },
      }));

    const screen = await render(
      <StoryWrapper
        data={{
          deals: [deal],
          stage_task_templates: [stageTaskTemplate],
          tasks: [],
        }}
        dataProvider={{ create: createSpy }}
      >
        <DealStageTaskPanel deal={deal} />
      </StoryWrapper>,
    );

    await expect
      .element(
        screen.getByText(/Próximas ações sugeridas|Suggested next actions/),
      )
      .toBeInTheDocument();
    await expect
      .element(
        screen.getByRole("button", { name: /Follow-up da proposta/ }),
      )
      .toBeInTheDocument();

    await screen
      .getByRole("button", { name: /Follow-up da proposta/ })
      .click();

    await expect.poll(() => createSpy).toHaveBeenCalledWith(
      "tasks",
      expect.objectContaining({
        data: expect.objectContaining({
          deal_id: deal.id,
          text: expect.stringContaining(deal.name),
        }),
      }),
    );
  });
});
