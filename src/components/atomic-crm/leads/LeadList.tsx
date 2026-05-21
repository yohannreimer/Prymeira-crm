import {
  useDeleteMany,
  useListContext,
  useResourceContext,
  useTranslate,
} from "ra-core";
import { Link } from "react-router";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { FilterButton } from "@/components/admin/filter-form";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { SearchInput } from "@/components/admin/search-input";
import { SelectInput } from "@/components/admin/select-input";
import { SortButton } from "@/components/admin/sort-button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { TopToolbar } from "../layout/TopToolbar";
import { BulkActionToolbar } from "../misc/BulkActionToolbar";
import { useBulkSelection } from "../misc/useBulkSelection";
import type { Lead } from "../types";
import { leadStatuses, leadTemperatures } from "./leadChoices";
import { LeadStatusBadge, LeadTemperatureBadge } from "./LeadStatusBadge";

export const LeadList = () => {
  const translate = useTranslate();

  const translatedStatuses = leadStatuses.map((choice) => ({
    ...choice,
    label: translate(choice.label),
  }));
  const translatedTemperatures = leadTemperatures.map((choice) => ({
    ...choice,
    label: translate(choice.label),
  }));

  const filters = [
    <SearchInput source="q" alwaysOn />,
    <SelectInput
      source="status"
      label="resources.leads.fields.status"
      choices={translatedStatuses}
      optionText="label"
      optionValue="value"
      alwaysOn
    />,
    <SelectInput
      source="temperature"
      label="resources.leads.fields.temperature"
      choices={translatedTemperatures}
      optionText="label"
      optionValue="value"
    />,
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Pipeline
        </p>
        <h1 className="text-[18px] font-bold text-foreground leading-tight">
          {translate("resources.leads.name", { smart_count: 2 })}
        </h1>
      </div>
      <List
        title={false}
        perPage={25}
        sort={{ field: "created_at", order: "DESC" }}
        filters={filters}
        actions={<LeadListActions />}
        pagination={<ListPagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      >
        <LeadListContent />
      </List>
    </div>
  );
};

const LeadListActions = () => (
  <TopToolbar>
    <FilterButton />
    <SortButton fields={["created_at", "updated_at", "next_action_at"]} />
    <ExportButton />
    <CreateButton label="resources.leads.action.new" />
  </TopToolbar>
);

const LeadListContent = () => {
  const translate = useTranslate();
  const { data: leads, isPending, filterValues } = useListContext<Lead>();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;
  const { selected, toggle, toggleAll, clear, isSelected } =
    useBulkSelection<Lead>();
  const resource = useResourceContext();
  const [deleteMany] = useDeleteMany();

  if (isPending) return <Skeleton className="h-12 w-full" />;

  const leadRecords = leads ?? [];

  const handleDelete = () => {
    deleteMany(resource, { ids: Array.from(selected) });
    clear();
  };

  if (!leadRecords.length && !hasFilters) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold">
          {translate("resources.leads.empty.title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {translate("resources.leads.empty.description")}
        </p>
      </Card>
    );
  }

  const allSelected =
    leadRecords.length > 0 && selected.size === leadRecords.length;
  const someSelected = selected.size > 0 && !allSelected;

  return (
    <>
      <Card className="py-0">
        <div className="hidden md:grid md:grid-cols-[28px_1.4fr_1fr_0.8fr_0.8fr] gap-3 px-4 py-2.5 border-b border-border/50">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 cursor-pointer accent-primary"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={() => toggleAll(leadRecords)}
            />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Nome
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Interesse / Fonte
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Status
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">
            Próxima ação
          </p>
        </div>
        <div className="divide-y divide-border/40">
          {leadRecords.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              isSelected={isSelected(lead.id)}
              onToggle={() => toggle(lead.id)}
            />
          ))}
          {leadRecords.length === 0 && (
            <div className="p-4 text-muted-foreground">
              {translate("resources.leads.empty.filtered")}
            </div>
          )}
        </div>
      </Card>
      <BulkActionToolbar
        count={selected.size}
        onClear={clear}
        onDelete={handleDelete}
      />
    </>
  );
};

const LeadRow = ({
  lead,
  isSelected,
  onToggle,
}: {
  lead: Lead;
  isSelected: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="grid gap-3 px-4 py-3 transition-colors hover:bg-muted md:grid-cols-[28px_1.4fr_1fr_0.8fr_0.8fr]">
      <div className="hidden md:flex items-center">
        <input
          type="checkbox"
          className="h-4 w-4 cursor-pointer accent-primary"
          checked={isSelected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <Link to={`/leads/${lead.id}/show`} className="col-span-1 md:contents">
        <div className="min-w-0 md:col-start-2">
          <div className="font-medium">
            {[lead.first_name, lead.last_name].filter(Boolean).join(" ")}
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {lead.company_name || lead.email || lead.phone_number}
          </div>
        </div>
        <div className="min-w-0 text-sm text-muted-foreground">
          <div className="truncate">{lead.interest}</div>
          <div className="truncate">{lead.source}</div>
        </div>
        <div className="flex items-center gap-2">
          <LeadStatusBadge lead={lead} />
          <LeadTemperatureBadge lead={lead} />
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          {lead.next_action_at
            ? new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(lead.next_action_at))
            : null}
        </div>
      </Link>
    </div>
  );
};
