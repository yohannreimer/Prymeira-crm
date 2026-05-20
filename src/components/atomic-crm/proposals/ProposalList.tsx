import { useListContext, useTranslate } from "ra-core";
import { Link } from "react-router";
import { CreateButton } from "@/components/admin/create-button";
import { FilterButton } from "@/components/admin/filter-form";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { SelectInput } from "@/components/admin/select-input";
import { SortButton } from "@/components/admin/sort-button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { TopToolbar } from "../layout/TopToolbar";
import type { Proposal } from "../types";
import { proposalStatuses } from "./proposalChoices";
import { ProposalStatusBadge } from "./ProposalStatusBadge";

const LOCALE = "pt-BR";

export const ProposalList = () => {
  const translate = useTranslate();
  const translatedStatuses = proposalStatuses.map((choice) => ({
    ...choice,
    label: translate(choice.label),
  }));

  const filters = [
    <SelectInput
      source="status"
      label="resources.proposals.fields.status"
      choices={translatedStatuses}
      optionText="label"
      optionValue="value"
      alwaysOn
    />,
  ];

  return (
    <List
      title={false}
      perPage={25}
      sort={{ field: "created_at", order: "DESC" }}
      filters={filters}
      actions={<ProposalListActions />}
      pagination={<ListPagination rowsPerPageOptions={[10, 25, 50, 100]} />}
    >
      <ProposalListContent />
    </List>
  );
};

const ProposalListActions = () => (
  <TopToolbar>
    <FilterButton />
    <SortButton fields={["created_at", "updated_at", "valid_until", "total"]} />
    <CreateButton label="resources.proposals.action.new" />
  </TopToolbar>
);

const ProposalListContent = () => {
  const translate = useTranslate();
  const {
    data: proposals,
    isPending,
    filterValues,
  } = useListContext<Proposal>();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  if (isPending) return <Skeleton className="h-12 w-full" />;

  const records = proposals ?? [];

  if (!records.length && !hasFilters) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold">
          {translate("resources.proposals.empty.title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {translate("resources.proposals.empty.description")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="py-0">
      <div className="divide-y">
        {records.map((proposal) => (
          <ProposalRow key={proposal.id} proposal={proposal} />
        ))}
        {records.length === 0 && (
          <div className="p-4 text-muted-foreground">
            {translate("resources.proposals.empty.filtered")}
          </div>
        )}
      </div>
    </Card>
  );
};

const ProposalRow = ({ proposal }: { proposal: Proposal }) => {
  const formatter = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: proposal.currency || "USD",
  });

  return (
    <Link
      to={`/proposals/${proposal.id}/show`}
      className="grid gap-3 p-4 transition-colors hover:bg-muted md:grid-cols-[1.5fr_0.8fr_0.7fr_0.8fr]"
    >
      <div className="min-w-0">
        <div className="truncate font-medium">{proposal.title}</div>
        <div className="truncate text-sm text-muted-foreground">
          {proposal.number}
        </div>
      </div>
      <div className="flex items-center">
        <ProposalStatusBadge proposal={proposal} />
      </div>
      <div className="text-sm text-muted-foreground">
        {proposal.valid_until
          ? new Intl.DateTimeFormat(LOCALE, {
              dateStyle: "medium",
            }).format(new Date(`${proposal.valid_until}T00:00:00`))
          : null}
      </div>
      <div className="font-medium md:text-right">
        {formatter.format(proposal.total / 100)}
      </div>
    </Link>
  );
};
