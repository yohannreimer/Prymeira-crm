import { useGetIdentity, useListContext, useTranslate } from "ra-core";
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
import type { Lead } from "../types";
import { leadStatuses, leadTemperatures } from "./leadChoices";
import { LeadStatusBadge, LeadTemperatureBadge } from "./LeadStatusBadge";

export const LeadList = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  if (!identity) return null;

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

  if (isPending) return <Skeleton className="h-12 w-full" />;

  const leadRecords = leads ?? [];

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

  return (
    <Card className="py-0">
      <div className="divide-y">
        {leadRecords.map((lead) => (
          <LeadRow key={lead.id} lead={lead} />
        ))}
        {leadRecords.length === 0 && (
          <div className="p-4 text-muted-foreground">
            {translate("resources.leads.empty.filtered")}
          </div>
        )}
      </div>
    </Card>
  );
};

const LeadRow = ({ lead }: { lead: Lead }) => {
  return (
    <Link
      to={`/leads/${lead.id}/show`}
      className="grid gap-3 p-4 transition-colors hover:bg-muted md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr]"
    >
      <div className="min-w-0">
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
  );
};
