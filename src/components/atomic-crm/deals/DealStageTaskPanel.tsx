import {
  useDataProvider,
  useGetList,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import { Button } from "@/components/ui/button";

import type { Deal, StageTaskTemplate, Task } from "../types";
import {
  buildTaskFromStageTemplate,
  filterStageTaskTemplates,
  hasOpenTaskForTemplate,
} from "./stageTaskTemplates";

export const DealStageTaskPanel = ({ deal }: { deal: Deal }) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();

  const { data: templates = [] } = useGetList<StageTaskTemplate>(
    "stage_task_templates",
    {
      filter: {
        "pipeline_id@eq": deal.pipeline_id,
        "stage@eq": deal.stage,
        "mode@eq": "manual",
        "enabled@eq": true,
      },
      pagination: { page: 1, perPage: 25 },
      sort: { field: "index", order: "ASC" },
    },
    { enabled: Boolean(deal.pipeline_id) },
  );
  const { data: tasks = [] } = useGetList<Task>(
    "tasks",
    {
      filter: { "deal_id@eq": deal.id },
      pagination: { page: 1, perPage: 25 },
      sort: { field: "due_date", order: "ASC" },
    },
    { enabled: Boolean(deal.id) },
  );

  const suggestions = filterStageTaskTemplates(templates, {
    pipelineId: deal.pipeline_id,
    stage: deal.stage,
    mode: "manual",
  });

  const handleCreate = async (template: StageTaskTemplate) => {
    const task = buildTaskFromStageTemplate(template, { deal });

    await dataProvider.create("tasks", { data: task });
    await dataProvider.update("deals", {
      id: deal.id,
      data: { next_action_at: task.due_date },
      previousData: deal,
    });
    notify("resources.stage_task_templates.created_task", { type: "info" });
    refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {translate("resources.stage_task_templates.suggested_next_actions")}
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((template) => (
          <Button
            key={template.id}
            size="sm"
            variant={
              hasOpenTaskForTemplate(template, tasks, { deal })
                ? "secondary"
                : "outline"
            }
            onClick={() => handleCreate(template)}
          >
            {template.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
