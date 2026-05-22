import React, { type ReactNode, useEffect, useRef, useState } from "react";
import type { InputProps } from "ra-core";
import {
  useCreate,
  useGetList,
  useListContext,
  useNotify,
  useTranslate,
} from "ra-core";
import { matchPath, useLocation } from "react-router";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ReferenceInput } from "@/components/admin/reference-input";
import { FilterButton } from "@/components/admin/filter-form";
import { SearchInput } from "@/components/admin/search-input";
import { SelectInput } from "@/components/admin/select-input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { Pipeline } from "../types";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { TopToolbar } from "../layout/TopToolbar";
import { DealArchivedList } from "./DealArchivedList";
import { DealCreate } from "./DealCreate";
import { DealEdit } from "./DealEdit";
import { DealListContent } from "./DealListContent";
import { DealShow } from "./DealShow";
import { OnlyMineInput } from "./OnlyMineInput";

export const DEFAULT_STAGES = [
  { value: "opportunity", label: "Oportunidade" },
  { value: "proposal-sent", label: "Proposta enviada" },
  { value: "in-negociation", label: "Em negociação" },
  { value: "won", label: "Ganho" },
  { value: "lost", label: "Perdido" },
  { value: "delayed", label: "Adiado" },
];

export const PipelineContext = React.createContext<{
  stages: { value: string; label: string }[];
  pipelineId: number | null;
}>({ stages: [], pipelineId: null });

const DealList = () => {
  const { dealCategories, dealTypes } = useConfigurationContext();
  const translate = useTranslate();
  const [selectedPipeline, setSelectedPipeline] = useState<number | null>(null);
  const [creatingPipeline, setCreatingPipeline] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState("");
  const [create, { isPending: isCreatingPipeline }] = useCreate();
  const notify = useNotify();
  const creatingPipelineRequestRef = useRef(false);

  const { data: pipelines, refetch: refetchPipelines } = useGetList<Pipeline>(
    "pipelines",
    {
      pagination: { page: 1, perPage: 100 },
    },
  );

  useEffect(() => {
    if (pipelines && pipelines.length > 0 && selectedPipeline === null) {
      setSelectedPipeline(Number(pipelines[0].id));
    }
  }, [pipelines, selectedPipeline]);

  const handleCreatePipeline = () => {
    const name = newPipelineName.trim();
    if (!name || isCreatingPipeline || creatingPipelineRequestRef.current) return;
    creatingPipelineRequestRef.current = true;
    create(
      "pipelines",
      {
        data: {
          name,
          stages: [],
        },
      },
      {
        onSuccess: async (result) => {
          const pipeline = "data" in result ? result.data : result;
          await refetchPipelines();
          setSelectedPipeline(Number(pipeline.id));
          setCreatingPipeline(false);
          setNewPipelineName("");
        },
        onError: () =>
          notify("Não foi possível criar o pipeline.", { type: "error" }),
        onSettled: () => {
          creatingPipelineRequestRef.current = false;
        },
      },
    );
  };

  const dealFilters = [
    <SearchInput source="q" alwaysOn />,
    <ReferenceInput source="company_id" reference="companies">
      <AutocompleteInput
        label={false}
        placeholder={translate("resources.deals.fields.company_id")}
      />
    </ReferenceInput>,
    <WrapperField source="category" label="resources.deals.fields.category">
      <SelectInput
        source="category"
        label={false}
        emptyText="resources.deals.fields.category"
        choices={dealCategories}
        optionText="label"
        optionValue="value"
      />
    </WrapperField>,
    <WrapperField source="deal_type" label="resources.deals.fields.deal_type">
      <SelectInput
        source="deal_type"
        label={false}
        emptyText="resources.deals.fields.deal_type"
        choices={dealTypes}
        optionText="label"
        optionValue="value"
      />
    </WrapperField>,
    <SearchInput
      source="source"
      placeholder={translate("resources.deals.fields.source")}
    />,
    <OnlyMineInput source="sales_id" alwaysOn />,
  ];

  const pipelineFilter =
    selectedPipeline !== null ? { "pipeline_id@eq": selectedPipeline } : {};

  const currentPipeline = pipelines?.find(
    (p) => Number(p.id) === selectedPipeline,
  );
  const currentPipelineStages =
    currentPipeline?.stages ?? (selectedPipeline ? [] : DEFAULT_STAGES);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Pipeline
        </p>
        <h1 className="text-[18px] font-bold text-foreground leading-tight">
          {translate("resources.deals.name", { smart_count: 2 })}
        </h1>
      </div>
      <div className="flex items-center gap-1 border-b border-border/50 mb-4">
        {pipelines?.map((p) => (
          <button
            key={String(p.id)}
            className={cn(
              "px-3 py-1.5 text-[13px] font-medium border-b-2 -mb-px transition-colors",
              selectedPipeline === Number(p.id)
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setSelectedPipeline(Number(p.id))}
          >
            {p.name}
          </button>
        ))}
        {creatingPipeline ? (
          <input
            autoFocus
            className="ml-1 px-2 py-1 text-[13px] border border-primary rounded outline-none bg-background"
            placeholder="Nome do pipeline..."
            value={newPipelineName}
            onChange={(e) => setNewPipelineName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreatePipeline();
              }
              if (e.key === "Escape") {
                setCreatingPipeline(false);
                setNewPipelineName("");
              }
            }}
            onBlur={() => {
              if (newPipelineName.trim()) {
                handleCreatePipeline();
                return;
              }
              setCreatingPipeline(false);
              setNewPipelineName("");
            }}
            disabled={isCreatingPipeline}
          />
        ) : (
          <button
            onClick={() => setCreatingPipeline(true)}
            className="ml-1 px-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors text-[13px]"
          >
            +
          </button>
        )}
      </div>
      <PipelineContext.Provider
        value={{ stages: currentPipelineStages, pipelineId: selectedPipeline }}
      >
        <List
          perPage={100}
          filter={{ "archived_at@is": null, ...pipelineFilter }}
          title={false}
          sort={{ field: "index", order: "DESC" }}
          filters={dealFilters}
          actions={<DealActions />}
          pagination={null}
        >
          <DealLayout />
        </List>
      </PipelineContext.Provider>
    </div>
  );
};

const DealLayout = () => {
  const location = useLocation();
  const matchCreate = matchPath("/deals/create", location.pathname);
  const matchShow = matchPath("/deals/:id/show", location.pathname);
  const matchEdit = matchPath("/deals/:id", location.pathname);

  const { isPending } = useListContext();

  if (isPending) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="w-full">
      <DealListContent />
      <DealArchivedList />
      <DealCreate open={!!matchCreate} />
      <DealEdit open={!!matchEdit && !matchCreate} id={matchEdit?.params.id} />
      <DealShow open={!!matchShow} id={matchShow?.params.id} />
    </div>
  );
};

const DealActions = () => (
  <TopToolbar>
    <FilterButton />
    <ExportButton />
    <CreateButton label="resources.deals.action.new" />
  </TopToolbar>
);

/**
 *
 * Used so that label of filters can be inferred for the select display,
 * but not be displayed when showing the input.
 */
const WrapperField = ({ children }: InputProps & { children: ReactNode }) =>
  children;

export default DealList;
