import { DragDropContext, type OnDragEndResponder } from "@hello-pangea/dnd";
import isEqual from "lodash/isEqual";
import {
  useDataProvider,
  useListContext,
  useNotify,
  useRedirect,
  useTranslate,
  useUpdate,
  type DataProvider,
} from "ra-core";
import { useContext, useEffect, useRef, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { DealColumn } from "./DealColumn";
import { PipelineContext } from "./DealList";
import type { DealsByStage } from "./stages";
import { getDealsByStage } from "./stages";

export const DealListContent = () => {
  const { dealStages } = useConfigurationContext();
  const { stages: pipelineStages, pipelineId } = useContext(PipelineContext);
  const { data: unorderedDeals, isPending, refetch } = useListContext<Deal>();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const translate = useTranslate();
  const [updatePipeline] = useUpdate();

  // Use pipeline stages if available, else fall back to config dealStages
  const activeStages = pipelineId !== null ? pipelineStages : dealStages;

  const [dealsByStage, setDealsByStage] = useState<DealsByStage>(
    getDealsByStage([], activeStages),
  );

  // Track activeStages changes to reset dealsByStage when pipeline changes
  const prevActiveStagesRef = useRef(activeStages);
  useEffect(() => {
    if (!isEqual(prevActiveStagesRef.current, activeStages)) {
      prevActiveStagesRef.current = activeStages;
      if (unorderedDeals) {
        setDealsByStage(getDealsByStage(unorderedDeals, activeStages));
      }
    }
  }, [activeStages, unorderedDeals]);

  useEffect(() => {
    if (unorderedDeals) {
      const newDealsByStage = getDealsByStage(unorderedDeals, activeStages);
      if (!isEqual(newDealsByStage, dealsByStage)) {
        setDealsByStage(newDealsByStage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unorderedDeals]);

  // Add stage state
  const [addingStage, setAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState("");

  if (isPending) return <Skeleton className="h-64 min-w-[720px]" />;

  const saveStages = (newStages: { value: string; label: string }[]) => {
    if (!pipelineId) return;
    updatePipeline("pipelines", {
      id: pipelineId,
      data: { stages: newStages },
      previousData: { id: pipelineId },
    });
  };

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    const newStage = {
      value: newStageName.toLowerCase().replace(/\s+/g, "-"),
      label: newStageName.trim(),
    };
    saveStages([...activeStages, newStage]);
    setAddingStage(false);
    setNewStageName("");
  };

  const handleDeleteStage = async (stageValue: string) => {
    if (!pipelineId) return;

    const { total } = await dataProvider.getList("stage_task_templates", {
      filter: {
        "pipeline_id@eq": pipelineId,
        "stage@eq": stageValue,
      },
      pagination: { page: 1, perPage: 1 },
      sort: { field: "id", order: "ASC" },
    });

    if (total && total > 0) {
      notify("resources.stage_task_templates.stage_in_use", {
        type: "warning",
      });
      return;
    }

    const newStages = activeStages.filter((s) => s.value !== stageValue);
    saveStages(newStages);
  };

  const handleEditStagePlaybook = (stageValue: string) => {
    if (!pipelineId) return;

    const detail = { pipelineId, stage: stageValue };
    window.sessionStorage.setItem(
      "crm:edit-stage-playbook",
      JSON.stringify(detail),
    );
    window.dispatchEvent(
      new CustomEvent("crm:edit-stage-playbook", { detail }),
    );
    redirect("/settings");
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStage = source.droppableId;
    const destinationStage = destination.droppableId;
    const sourceDeal = dealsByStage[sourceStage][source.index]!;
    const destinationDeal = dealsByStage[destinationStage][
      destination.index
    ] ?? {
      stage: destinationStage,
      index: undefined, // undefined if dropped after the last item
    };

    // compute local state change synchronously
    setDealsByStage(
      updateDealStageLocal(
        sourceDeal,
        { stage: sourceStage, index: source.index },
        { stage: destinationStage, index: destination.index },
        dealsByStage,
      ),
    );

    // persist the changes
    updateDealStage(sourceDeal, destinationDeal, dataProvider).then(() => {
      refetch();
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4">
        {activeStages.map((stage) => (
          <DealColumn
            stage={stage.value}
            deals={dealsByStage[stage.value] ?? []}
            key={stage.value}
            stageLabel={stage.label}
            onDelete={
              pipelineId ? () => void handleDeleteStage(stage.value) : undefined
            }
            onEditPlaybook={
              pipelineId
                ? () => handleEditStagePlaybook(stage.value)
                : undefined
            }
          />
        ))}
        {/* Add column button */}
        <div className="flex-shrink-0 min-w-[180px]">
          {addingStage ? (
            <div className="border border-primary rounded-lg p-2">
              <input
                autoFocus
                className="w-full px-2 py-1 text-[13px] border border-primary rounded outline-none bg-background mb-1"
                placeholder={translate(
                  "resources.deals.kanban.new_column_placeholder",
                )}
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddStage();
                  if (e.key === "Escape") {
                    setAddingStage(false);
                    setNewStageName("");
                  }
                }}
                onBlur={() => {
                  setAddingStage(false);
                  setNewStageName("");
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingStage(true)}
              className="w-full border border-dashed border-border/50 rounded-lg py-2 px-3 text-[13px] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              {translate("resources.deals.kanban.add_column")}
            </button>
          )}
        </div>
      </div>
    </DragDropContext>
  );
};

const updateDealStageLocal = (
  sourceDeal: Deal,
  source: { stage: string; index: number },
  destination: {
    stage: string;
    index?: number; // undefined if dropped after the last item
  },
  dealsByStage: DealsByStage,
) => {
  if (source.stage === destination.stage) {
    // moving deal inside the same column
    const column = dealsByStage[source.stage];
    column.splice(source.index, 1);
    column.splice(destination.index ?? column.length + 1, 0, sourceDeal);
    return {
      ...dealsByStage,
      [destination.stage]: column,
    };
  } else {
    // moving deal across columns
    const sourceColumn = dealsByStage[source.stage];
    const destinationColumn = dealsByStage[destination.stage];
    sourceColumn.splice(source.index, 1);
    destinationColumn.splice(
      destination.index ?? destinationColumn.length + 1,
      0,
      sourceDeal,
    );
    return {
      ...dealsByStage,
      [source.stage]: sourceColumn,
      [destination.stage]: destinationColumn,
    };
  }
};

const updateDealStage = async (
  source: Deal,
  destination: {
    stage: string;
    index?: number; // undefined if dropped after the last item
  },
  dataProvider: DataProvider,
) => {
  if (source.stage === destination.stage) {
    // moving deal inside the same column
    // Fetch all the deals in this stage (because the list may be filtered, but we need to update even non-filtered deals)
    const { data: columnDeals } = await dataProvider.getList("deals", {
      sort: { field: "index", order: "ASC" },
      pagination: { page: 1, perPage: 100 },
      filter: { stage: source.stage },
    });
    const destinationIndex = destination.index ?? columnDeals.length + 1;

    if (source.index > destinationIndex) {
      // deal moved up, eg
      // dest   src
      //  <------
      // [4, 7, 23, 5]
      await Promise.all([
        // for all deals between destinationIndex and source.index, increase the index
        ...columnDeals
          .filter(
            (deal) =>
              deal.index >= destinationIndex && deal.index < source.index,
          )
          .map((deal) =>
            dataProvider.update("deals", {
              id: deal.id,
              data: { index: deal.index + 1 },
              previousData: deal,
            }),
          ),
        // for the deal that was moved, update its index
        dataProvider.update("deals", {
          id: source.id,
          data: { index: destinationIndex },
          previousData: source,
        }),
      ]);
    } else {
      // deal moved down, e.g
      // src   dest
      //  ------>
      // [4, 7, 23, 5]
      await Promise.all([
        // for all deals between source.index and destinationIndex, decrease the index
        ...columnDeals
          .filter(
            (deal) =>
              deal.index <= destinationIndex && deal.index > source.index,
          )
          .map((deal) =>
            dataProvider.update("deals", {
              id: deal.id,
              data: { index: deal.index - 1 },
              previousData: deal,
            }),
          ),
        // for the deal that was moved, update its index
        dataProvider.update("deals", {
          id: source.id,
          data: { index: destinationIndex },
          previousData: source,
        }),
      ]);
    }
  } else {
    // moving deal across columns
    // Fetch all the deals in both stages (because the list may be filtered, but we need to update even non-filtered deals)
    const [{ data: sourceDeals }, { data: destinationDeals }] =
      await Promise.all([
        dataProvider.getList("deals", {
          sort: { field: "index", order: "ASC" },
          pagination: { page: 1, perPage: 100 },
          filter: { stage: source.stage },
        }),
        dataProvider.getList("deals", {
          sort: { field: "index", order: "ASC" },
          pagination: { page: 1, perPage: 100 },
          filter: { stage: destination.stage },
        }),
      ]);
    const destinationIndex = destination.index ?? destinationDeals.length + 1;

    await Promise.all([
      // decrease index on the deals after the source index in the source columns
      ...sourceDeals
        .filter((deal) => deal.index > source.index)
        .map((deal) =>
          dataProvider.update("deals", {
            id: deal.id,
            data: { index: deal.index - 1 },
            previousData: deal,
          }),
        ),
      // increase index on the deals after the destination index in the destination columns
      ...destinationDeals
        .filter((deal) => deal.index >= destinationIndex)
        .map((deal) =>
          dataProvider.update("deals", {
            id: deal.id,
            data: { index: deal.index + 1 },
            previousData: deal,
          }),
        ),
      // change the dragged deal to take the destination index and column
      dataProvider.update("deals", {
        id: source.id,
        data: {
          index: destinationIndex,
          stage: destination.stage,
        },
        previousData: source,
      }),
    ]);
  }
};
