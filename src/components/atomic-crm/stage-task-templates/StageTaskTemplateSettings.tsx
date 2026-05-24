import { CheckCircle2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import type { Identifier } from "ra-core";
import {
  useCreate,
  useDelete,
  useGetList,
  useNotify,
  useTranslate,
  useUpdate,
} from "ra-core";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type {
  Pipeline,
  StageTaskTemplate,
  StageTaskTemplateMode,
} from "../types";

type TemplateFormState = {
  name: string;
  task_text: string;
  task_type: string;
  due_in_days: string;
  mode: StageTaskTemplateMode;
  enabled: boolean;
  instructions: string;
};

type EditStagePlaybookEvent = CustomEvent<{
  pipelineId?: Identifier;
  stage?: string;
}>;

const defaultFormState = (taskType?: string): TemplateFormState => ({
  name: "",
  task_text: "",
  task_type: taskType ?? "",
  due_in_days: "1",
  mode: "manual",
  enabled: true,
  instructions: "",
});

export const StageTaskTemplateSettings = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const { taskTypes } = useConfigurationContext();
  const fallbackTaskType = taskTypes[0]?.value ?? "";
  const [selectedPipelineId, setSelectedPipelineId] = useState<
    Identifier | undefined
  >();
  const [selectedStage, setSelectedStage] = useState("");
  const [editingTemplateId, setEditingTemplateId] = useState<
    Identifier | undefined
  >();
  const [formState, setFormState] = useState<TemplateFormState>(() =>
    defaultFormState(fallbackTaskType),
  );

  const { data: pipelines = [] } = useGetList<Pipeline>("pipelines", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });

  const selectedPipeline = useMemo(
    () =>
      pipelines.find(
        (pipeline) => String(pipeline.id) === String(selectedPipelineId),
      ),
    [pipelines, selectedPipelineId],
  );
  const stages = selectedPipeline?.stages ?? [];

  const {
    data: templates = [],
    isPending: isTemplatePending,
    refetch,
  } = useGetList<StageTaskTemplate>(
    "stage_task_templates",
    {
      filter: {
        "pipeline_id@eq": selectedPipelineId,
        "stage@eq": selectedStage,
      },
      pagination: { page: 1, perPage: 100 },
      sort: { field: "index", order: "ASC" },
    },
    { enabled: Boolean(selectedPipelineId && selectedStage) },
  );

  const [createTemplate, { isPending: isCreating }] = useCreate();
  const [updateTemplate, { isPending: isUpdating }] = useUpdate();
  const [deleteTemplate, { isPending: isDeleting }] = useDelete();
  const isSaving = isCreating || isUpdating;
  const parsedDueInDays = Number(formState.due_in_days);
  const isDueInDaysValid =
    formState.due_in_days.trim() !== "" &&
    Number.isInteger(parsedDueInDays) &&
    parsedDueInDays >= 0;
  const canSubmit =
    !isSaving &&
    Boolean(selectedPipelineId) &&
    Boolean(selectedStage) &&
    Boolean(formState.name.trim()) &&
    Boolean(formState.task_text.trim()) &&
    Boolean(formState.task_type) &&
    isDueInDaysValid;

  const resetForm = useCallback(() => {
    setEditingTemplateId(undefined);
    setFormState(defaultFormState(fallbackTaskType));
  }, [fallbackTaskType]);

  useEffect(() => {
    if (selectedPipelineId || pipelines.length === 0) return;
    setSelectedPipelineId(pipelines[0]?.id);
  }, [pipelines, selectedPipelineId]);

  useEffect(() => {
    if (stages.length === 0) return;
    if (stages.some((stage) => stage.value === selectedStage)) return;
    setSelectedStage(stages[0]?.value ?? "");
  }, [selectedStage, stages]);

  useEffect(() => {
    if (formState.task_type || !fallbackTaskType) return;
    setFormState((current) => ({ ...current, task_type: fallbackTaskType }));
  }, [fallbackTaskType, formState.task_type]);

  useEffect(() => {
    const handleEditStagePlaybook = (event: Event) => {
      if (!(event instanceof CustomEvent) || !event.detail) return;

      const { pipelineId, stage } = (event as EditStagePlaybookEvent).detail;
      if (!pipelineId || !stage) return;

      setSelectedPipelineId(pipelineId);
      setSelectedStage(stage);
      resetForm();
      window.setTimeout(() => {
        document
          .getElementById("stage-task-template-settings")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    window.addEventListener("crm:edit-stage-playbook", handleEditStagePlaybook);
    return () => {
      window.removeEventListener(
        "crm:edit-stage-playbook",
        handleEditStagePlaybook,
      );
    };
  }, [resetForm]);

  const buildPayload = (index: number) => ({
    pipeline_id: selectedPipelineId,
    stage: selectedStage,
    name: formState.name.trim(),
    task_text: formState.task_text.trim(),
    task_type: formState.task_type,
    due_in_days: parsedDueInDays,
    mode: formState.mode,
    enabled: formState.enabled,
    instructions: formState.instructions.trim() || null,
    assignee: "record_owner" as const,
    index,
  });

  const handleSubmit = () => {
    if (!selectedPipelineId || !selectedStage) return;
    if (!isDueInDaysValid) {
      notify("resources.stage_task_templates.settings.invalid_due_in_days", {
        type: "warning",
      });
      return;
    }

    const currentTemplate = templates.find(
      (template) => template.id === editingTemplateId,
    );
    const payload = buildPayload(currentTemplate?.index ?? templates.length);

    if (!payload.name || !payload.task_text || !payload.task_type) return;

    if (editingTemplateId && currentTemplate) {
      updateTemplate(
        "stage_task_templates",
        {
          id: editingTemplateId,
          data: payload,
          previousData: currentTemplate,
        },
        {
          onSuccess: () => {
            notify("resources.stage_task_templates.settings.updated", {
              type: "info",
            });
            resetForm();
            void refetch();
          },
          onError: () => {
            notify("resources.stage_task_templates.settings.update_error", {
              type: "error",
            });
          },
        },
      );
      return;
    }

    createTemplate(
      "stage_task_templates",
      { data: buildPayload(templates.length) },
      {
        onSuccess: () => {
          notify("resources.stage_task_templates.settings.created", {
            type: "info",
          });
          resetForm();
          void refetch();
        },
        onError: () => {
          notify("resources.stage_task_templates.settings.create_error", {
            type: "error",
          });
        },
      },
    );
  };

  const handleEdit = (template: StageTaskTemplate) => {
    setEditingTemplateId(template.id);
    setFormState({
      name: template.name,
      task_text: template.task_text,
      task_type: template.task_type,
      due_in_days: String(template.due_in_days),
      mode: template.mode,
      enabled: template.enabled,
      instructions: template.instructions ?? "",
    });
  };

  const handleDelete = (template: StageTaskTemplate) => {
    deleteTemplate(
      "stage_task_templates",
      { id: template.id, previousData: template },
      {
        onSuccess: () => {
          notify("resources.stage_task_templates.settings.deleted", {
            type: "info",
          });
          if (editingTemplateId === template.id) resetForm();
          void refetch();
        },
        onError: () => {
          notify("resources.stage_task_templates.settings.delete_error", {
            type: "error",
          });
        },
      },
    );
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") return;
    if (!(event.target instanceof HTMLInputElement)) return;

    event.preventDefault();
    if (canSubmit) handleSubmit();
  };

  return (
    <Card id="stage-task-templates">
      <CardContent
        id="stage-task-template-settings"
        className="space-y-4"
        onKeyDown={handlePanelKeyDown}
      >
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-muted-foreground">
            {translate("crm.settings.stage_task_templates")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {translate("resources.stage_task_templates.settings.description")}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field
            id="stage-playbook-pipeline"
            label={translate("resources.pipelines.name", { smart_count: 1 })}
          >
            <Select
              value={
                selectedPipelineId == null ? "" : String(selectedPipelineId)
              }
              onValueChange={(value) => {
                setSelectedPipelineId(
                  pipelines.find((pipeline) => String(pipeline.id) === value)
                    ?.id,
                );
                resetForm();
              }}
            >
              <SelectTrigger id="stage-playbook-pipeline" className="w-full">
                <SelectValue
                  placeholder={translate(
                    "resources.stage_task_templates.settings.select_pipeline",
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((pipeline) => (
                  <SelectItem key={pipeline.id} value={String(pipeline.id)}>
                    {pipeline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            id="stage-playbook-stage"
            label={translate("resources.stage_task_templates.fields.stage")}
          >
            <Select
              value={selectedStage}
              onValueChange={(value) => {
                setSelectedStage(value);
                resetForm();
              }}
              disabled={stages.length === 0}
            >
              <SelectTrigger id="stage-playbook-stage" className="w-full">
                <SelectValue
                  placeholder={translate(
                    "resources.stage_task_templates.settings.select_stage",
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="rounded-md border">
          <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
            <div className="text-sm font-medium">
              {translate("resources.stage_task_templates.settings.templates")}
            </div>
            <Badge variant="secondary">
              {translate("resources.stage_task_templates.settings.count", {
                smart_count: templates.length,
              })}
            </Badge>
          </div>
          <div className="divide-y">
            {isTemplatePending ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                {translate("crm.common.loading")}
              </div>
            ) : templates.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                {translate("resources.stage_task_templates.settings.empty")}
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="grid gap-2 px-3 py-3 md:grid-cols-[1fr_auto] md:items-start"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {template.enabled ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : null}
                      <span className="font-medium">{template.name}</span>
                      <Badge variant="outline">
                        {translate(
                          `resources.stage_task_templates.modes.${template.mode}`,
                        )}
                      </Badge>
                      <Badge variant="secondary">
                        {translate(
                          "resources.stage_task_templates.settings.due_badge",
                          { smart_count: template.due_in_days },
                        )}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {template.task_text}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                      title={translate("ra.action.edit")}
                      aria-label={translate("ra.action.edit")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template)}
                      disabled={isDeleting}
                      title={translate("ra.action.delete")}
                      aria-label={translate("ra.action.delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-medium text-muted-foreground">
              {editingTemplateId
                ? translate("resources.stage_task_templates.settings.edit")
                : translate("resources.stage_task_templates.settings.new")}
            </h3>
            {editingTemplateId ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
              >
                <X className="h-4 w-4" />
                {translate("ra.action.cancel")}
              </Button>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field
              id="stage-playbook-name"
              label={translate("resources.stage_task_templates.fields.name")}
            >
              <Input
                id="stage-playbook-name"
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </Field>
            <Field
              id="stage-playbook-task-type"
              label={translate(
                "resources.stage_task_templates.fields.task_type",
              )}
            >
              <Select
                value={formState.task_type}
                onValueChange={(task_type) =>
                  setFormState((current) => ({ ...current, task_type }))
                }
              >
                <SelectTrigger id="stage-playbook-task-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((taskType) => (
                    <SelectItem key={taskType.value} value={taskType.value}>
                      {taskType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field
            id="stage-playbook-task-text"
            label={translate("resources.stage_task_templates.fields.task_text")}
          >
            <Textarea
              id="stage-playbook-task-text"
              value={formState.task_text}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  task_text: event.target.value,
                }))
              }
              required
              rows={2}
            />
          </Field>

          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <Field
              id="stage-playbook-due-in-days"
              label={translate(
                "resources.stage_task_templates.fields.due_in_days",
              )}
            >
              <Input
                id="stage-playbook-due-in-days"
                type="number"
                min={0}
                step={1}
                value={formState.due_in_days}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    due_in_days: event.target.value,
                  }))
                }
                required
              />
            </Field>
            <Field
              id="stage-playbook-mode"
              label={translate("resources.stage_task_templates.fields.mode")}
            >
              <Select
                value={formState.mode}
                onValueChange={(mode) =>
                  setFormState((current) => ({
                    ...current,
                    mode: mode as StageTaskTemplateMode,
                  }))
                }
              >
                <SelectTrigger id="stage-playbook-mode" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">
                    {translate("resources.stage_task_templates.modes.manual")}
                  </SelectItem>
                  <SelectItem value="automatic">
                    {translate(
                      "resources.stage_task_templates.modes.automatic",
                    )}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <label className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
              <Switch
                checked={formState.enabled}
                onCheckedChange={(enabled) =>
                  setFormState((current) => ({ ...current, enabled }))
                }
              />
              {translate("resources.stage_task_templates.fields.enabled")}
            </label>
          </div>

          <Field
            id="stage-playbook-instructions"
            label={translate(
              "resources.stage_task_templates.fields.instructions",
            )}
          >
            <Textarea
              id="stage-playbook-instructions"
              value={formState.instructions}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  instructions: event.target.value,
                }))
              }
              rows={2}
            />
          </Field>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {editingTemplateId ? (
                <Save className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingTemplateId
                ? translate("resources.stage_task_templates.settings.save")
                : translate("resources.stage_task_templates.settings.create")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Field = ({
  id,
  label,
  children,
}: {
  id?: string;
  label: string;
  children: ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
  </div>
);
