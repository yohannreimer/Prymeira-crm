import { FileText, Plus } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { Deal, Proposal } from "../types";
import { ProposalActions } from "./ProposalActions";
import { ProposalStatusBadge } from "./ProposalStatusBadge";

export const DealProposalsPanel = ({ deal }: { deal: Deal }) => {
  const translate = useTranslate();
  const { data: proposals = [], isPending } = useGetList<Proposal>(
    "proposals",
    {
      filter: { deal_id: deal.id },
      sort: { field: "updated_at", order: "DESC" },
      pagination: { page: 1, perPage: 25 },
    },
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-muted-foreground" />
          {translate("resources.proposals.name", { smart_count: 2 })}
        </CardTitle>
        <Button asChild variant="outline" size="sm" className="h-9">
          <Link
            to={`/proposals/create?deal_id=${deal.id}`}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {translate("resources.proposals.action.generate")}
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <Skeleton className="h-12 w-full" />
        ) : proposals.length > 0 ? (
          <div className="divide-y rounded-md border">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="flex flex-col gap-3 p-3 transition-colors hover:bg-muted md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    to={`/proposals/${proposal.id}/show`}
                    className="block truncate font-medium hover:underline"
                  >
                    {proposal.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <ProposalStatusBadge proposal={proposal} />
                    <span className="text-sm text-muted-foreground">
                      {proposal.number}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/proposals/${proposal.id}/show`}>
                      {translate("resources.proposals.action.show")}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/proposals/${proposal.id}`}>
                      {translate("resources.proposals.action.edit")}
                    </Link>
                  </Button>
                  <ProposalActions proposal={proposal} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {translate("resources.proposals.empty.for_deal")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
