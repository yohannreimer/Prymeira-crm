import { Draggable } from "@hello-pangea/dnd";
import { AlertCircle, CalendarClock, CheckCircle2 } from "lucide-react";
import type { KeyboardEvent } from "react";
import {
  useGetList,
  useLocaleState,
  useRedirect,
  RecordContextProvider,
  useTranslate,
} from "ra-core";
import { ReferenceField } from "@/components/admin/reference-field";
import { SelectField } from "@/components/admin/select-field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { CompanyAvatar } from "../companies/CompanyAvatar";
import { formatCurrencyAmount } from "../misc/formatCurrency";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal, StageTaskTemplate, Task } from "../types";
import { getDealRiskState, getWeightedAmount } from "./dealCommercialUtils";
import { getTaskDueState } from "./dealTaskDisplay";

export const DealCard = ({
  deal,
  index,
  openTasks = [],
}: {
  deal: Deal;
  index: number;
  openTasks?: Task[];
}) => {
  if (!deal) return null;

  return (
    <Draggable draggableId={String(deal.id)} index={index}>
      {(provided, snapshot) => (
        <DealCardContent
          provided={provided}
          snapshot={snapshot}
          deal={deal}
          openTasks={openTasks}
        />
      )}
    </Draggable>
  );
};

export const DealCardContent = ({
  provided,
  snapshot,
  deal,
  openTasks = [],
}: {
  provided?: any;
  snapshot?: any;
  deal: Deal;
  openTasks?: Task[];
}) => {
  const { dealCategories, dealTypes, currency } = useConfigurationContext();
  const redirect = useRedirect();
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();
  const riskState = getDealRiskState(deal);
  const weightedAmount = getWeightedAmount(deal);
  const nextOpenTask = openTasks[0];
  const { data: stageTemplates = [] } = useGetList<StageTaskTemplate>(
    "stage_task_templates",
    {
      filter: {
        "pipeline_id@eq": deal.pipeline_id,
        "stage@eq": deal.stage,
        "enabled@eq": true,
        "mode@eq": "manual",
      },
      pagination: { page: 1, perPage: 25 },
      sort: { field: "index", order: "ASC" },
    },
    { enabled: Boolean(deal.pipeline_id) },
  );
  const dealTypeLabel =
    dealTypes.find((type) => type.value === deal.deal_type)?.label ??
    deal.deal_type;
  const formatAmount = (amount: number) =>
    formatCurrencyAmount(amount, currency, locale, {
      maximumFractionDigits: 0,
    });
  const formattedWeightedAmount = formatAmount(weightedAmount);
  const handleClick = () => {
    redirect(`/deals/${deal.id}/show`, undefined, undefined, undefined, {
      _scrollToTop: false,
    });
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    provided?.dragHandleProps?.onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`${translate("ra.action.show")} ${deal.name}`}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      ref={provided?.innerRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <RecordContextProvider value={deal}>
        <Card
          className={`py-3 transition-all duration-200 ${
            snapshot?.isDragging
              ? "opacity-90 transform rotate-1 shadow-lg"
              : "shadow-sm hover:shadow-md"
          }`}
        >
          <CardContent className="px-3 flex flex-col">
            <div className="flex-1 flex gap-2">
              <p className="flex-1 min-w-0 text-[12px] font-semibold mb-1.5 truncate">
                <ReferenceField
                  source="company_id"
                  reference="companies"
                  link={false}
                />
                {" — "}
                {deal.name}
              </p>
              <ReferenceField
                source="company_id"
                reference="companies"
                link={false}
              >
                <CompanyAvatar width={20} height={20} />
              </ReferenceField>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {formatAmount(deal.amount)}
              {deal.category && ", "}
              <SelectField
                source="category"
                choices={dealCategories}
                optionText="label"
                optionValue="value"
              />
            </p>
            {nextOpenTask ? (
              <DealCardTaskSummary
                task={nextOpenTask}
                remainingTasks={Math.max(openTasks.length - 1, 0)}
              />
            ) : null}
            <div className="mt-2 flex flex-wrap gap-1">
              {deal.deal_type && (
                <Badge
                  variant="secondary"
                  className="max-w-full truncate h-4 text-[10px] py-0 px-1.5 font-normal"
                  title={dealTypeLabel}
                >
                  {dealTypeLabel}
                </Badge>
              )}
              {typeof deal.probability === "number" && (
                <Badge
                  variant="outline"
                  className="h-4 text-[10px] py-0 px-1.5 font-normal"
                >
                  {deal.probability}%
                </Badge>
              )}
              <Badge
                variant="outline"
                className="h-4 text-[10px] py-0 px-1.5 font-normal"
              >
                {translate("resources.deals.weighted_short_compact")}{" "}
                {formattedWeightedAmount}
              </Badge>
              {stageTemplates.length > 0 && (
                <Badge
                  variant="outline"
                  className="h-4 text-[10px] py-0 px-1.5 font-normal"
                >
                  {translate(
                    "resources.stage_task_templates.suggestions_count",
                    {
                      smart_count: stageTemplates.length,
                    },
                  )}
                </Badge>
              )}
              {riskState === "missing_next_action" && (
                <Badge
                  variant="destructive"
                  className="h-4 text-[10px] py-0 px-1.5 font-normal"
                >
                  <CalendarClock className="size-3" />
                  {translate("resources.deals.risk.no_next_action")}
                </Badge>
              )}
              {riskState === "stale" && (
                <Badge className="h-4 text-[10px] py-0 px-1.5 font-normal bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                  <AlertCircle className="size-3" />
                  {translate("resources.deals.risk.stale")}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </RecordContextProvider>
    </div>
  );
};

const DealCardTaskSummary = ({
  task,
  remainingTasks,
}: {
  task: Task;
  remainingTasks: number;
}) => {
  const translate = useTranslate();
  const { state, days } = getTaskDueState(task);
  const isUrgent = state === "overdue" || state === "today";

  return (
    <div
      className={`mt-2 flex items-start gap-1.5 rounded-md border px-2 py-1.5 text-[11px] ${
        isUrgent
          ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
          : "border-border bg-muted/30 text-muted-foreground"
      }`}
    >
      <CheckCircle2 className="mt-0.5 size-3 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{task.text}</div>
        <div className="flex flex-wrap gap-1 text-[10px]">
          <span>{translateTaskDueState(translate, state, days)}</span>
          {remainingTasks > 0 ? (
            <span>
              {translate("resources.tasks.open_more_count", {
                smart_count: remainingTasks,
              })}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const translateTaskDueState = (
  translate: ReturnType<typeof useTranslate>,
  state: ReturnType<typeof getTaskDueState>["state"],
  days: number,
) => {
  if (state === "overdue") {
    return translate("resources.tasks.due_states.overdue", {
      smart_count: days,
    });
  }
  if (state === "today") return translate("resources.tasks.due_states.today");
  if (state === "tomorrow") {
    return translate("resources.tasks.due_states.tomorrow");
  }
  return translate("resources.tasks.due_states.future", {
    smart_count: days,
  });
};
