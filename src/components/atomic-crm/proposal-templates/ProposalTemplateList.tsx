import { useListContext, useTranslate } from "ra-core";
import { Link } from "react-router";
import { CreateButton } from "@/components/admin/create-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { TopToolbar } from "../layout/TopToolbar";
import type { ProposalTemplate } from "../types";

export const ProposalTemplateList = () => (
  <List
    title={false}
    perPage={25}
    sort={{ field: "name", order: "ASC" }}
    actions={<ProposalTemplateListActions />}
    pagination={<ListPagination rowsPerPageOptions={[10, 25, 50, 100]} />}
  >
    <ProposalTemplateListContent />
  </List>
);

const ProposalTemplateListActions = () => (
  <TopToolbar>
    <CreateButton label="resources.proposal_templates.action.new" />
  </TopToolbar>
);

const ProposalTemplateListContent = () => {
  const translate = useTranslate();
  const { data: templates, isPending } = useListContext<ProposalTemplate>();

  if (isPending) return <Skeleton className="h-12 w-full" />;

  const records = templates ?? [];

  if (records.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold">
          {translate("resources.proposal_templates.empty.title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {translate("resources.proposal_templates.empty.description")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="py-0">
      <div className="divide-y">
        {records.map((template) => (
          <ProposalTemplateRow key={template.id} template={template} />
        ))}
      </div>
    </Card>
  );
};

const ProposalTemplateRow = ({ template }: { template: ProposalTemplate }) => {
  const translate = useTranslate();

  return (
    <Link
      to={`/proposal_templates/${template.id}`}
      className="grid gap-3 p-4 transition-colors hover:bg-muted md:grid-cols-[1fr_auto] md:items-center"
    >
      <div className="min-w-0">
        <div className="truncate font-medium">{template.name}</div>
        <div className="truncate text-sm text-muted-foreground">
          {template.description ||
            translate("resources.proposal_templates.empty_description")}
        </div>
      </div>
      <Badge variant={template.active ? "default" : "secondary"}>
        {translate(
          template.active
            ? "resources.proposal_templates.status.active"
            : "resources.proposal_templates.status.inactive",
        )}
      </Badge>
    </Link>
  );
};
