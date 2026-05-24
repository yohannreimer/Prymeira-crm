import { useRef, useState } from "react";
import {
  useDataProvider,
  useGetList,
  useNotify,
  ResourceContextProvider,
  useRefresh,
  useTranslate,
} from "ra-core";
import { Button } from "@/components/ui/button";

import { Task as TaskItem } from "../tasks/Task";
import type { Deal, StageTaskTemplate, Task } from "../types";
import {
  buildTaskFromStageTemplate,
  filterStageTaskTemplates,
  hasOpenTaskForTemplate,
} from "./stageTaskTemplates";

const shouldUpdateNextActionAt = (
  existing: Deal["next_action_at"],
  candidate: Task["due_date"],
) => {
  if (!existing) return true;

  const existingTime = Date.parse(existing);
  const candidateTime = Date.parse(candidate);

  if (Number.isNaN(candidateTime)) return false;
  if (Number.isNaN(existingTime)) return true;

  return candidateTime < existingTime;
};

export const DealStageTaskPanel = ({ deal }: { deal: Deal }) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();
  const pendingTemplateIdsRef = useRef(new Set<string>());
  const [pendingTemplateIds, setPendingTemplateIds] = useState<Set<string>>(
    () => new Set(),
  );

  const { data: templates = [], isPending: templatesPending } =
    useGetList<StageTaskTemplate>(
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
  const { data: tasks = [], isPending: tasksPending } = useGetList<Task>(
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
  const openTasks = tasks.filter((task) => !task.done_date);

  const handleCreate = async (template: StageTaskTemplate) => {
    const templateId = String(template.id);
    if (
      pendingTemplateIdsRef.current.has(templateId) ||
      hasOpenTaskForTemplate(template, tasks, { deal })
    ) {
      return;
    }

    pendingTemplateIdsRef.current.add(templateId);
    setPendingTemplateIds(new Set(pendingTemplateIdsRef.current));
    const task = buildTaskFromStageTemplate(template, { deal });

    try {
      await dataProvider.create("tasks", { data: task });
    } catch {
      notify("resources.stage_task_templates.create_task_error", {
        type: "error",
      });
      pendingTemplateIdsRef.current.delete(templateId);
      setPendingTemplateIds(new Set(pendingTemplateIdsRef.current));
      return;
    }

    if (shouldUpdateNextActionAt(deal.next_action_at, task.due_date)) {
      try {
        await dataProvider.update("deals", {
          id: deal.id,
          data: { next_action_at: task.due_date },
          previousData: deal,
        });
      } catch {
        notify("resources.stage_task_templates.update_next_action_error", {
          type: "error",
        });
        pendingTemplateIdsRef.current.delete(templateId);
        setPendingTemplateIds(new Set(pendingTemplateIdsRef.current));
        refresh();
        return;
      }
    }

    notify("resources.stage_task_templates.created_task", { type: "info" });
    pendingTemplateIdsRef.current.delete(templateId);
    setPendingTemplateIds(new Set(pendingTemplateIdsRef.current));
    refresh();
  };

  if (
    templatesPending ||
    tasksPending ||
    (suggestions.length === 0 && openTasks.length === 0)
  ) {
    return null;
  }

  return (
    <div className="space-y-3" data-testid="deal-stage-task-panel">
      {openTasks.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">
            {translate("resources.tasks.open_for_deal")}
          </h3>
          <ResourceContextProvider value="tasks">
            <div className="space-y-2 rounded-md border p-3">
              {openTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </ResourceContextProvider>
        </div>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {translate(
                "resources.stage_task_templates.suggested_next_actions",
              )}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((template) => {
              const hasOpenTask = hasOpenTaskForTemplate(template, tasks, {
                deal,
              });
              const isPending = pendingTemplateIds.has(String(template.id));

              return (
                <Button
                  key={template.id}
                  size="sm"
                  variant={hasOpenTask ? "secondary" : "outline"}
                  disabled={hasOpenTask || isPending}
                  title={
                    hasOpenTask
                      ? translate(
                          "resources.stage_task_templates.existing_task_title",
                        )
                      : undefined
                  }
                  onClick={() => handleCreate(template)}
                >
                  {template.name}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
