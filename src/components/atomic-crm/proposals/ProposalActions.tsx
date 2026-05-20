import { useState } from "react";
import { Copy, FileText } from "lucide-react";
import { useDataProvider, useNotify, useRedirect, useTranslate } from "ra-core";

import { Button } from "@/components/ui/button";

import type { Proposal, ProposalItem } from "../types";
import {
  buildDuplicateProposalPayload,
  buildProposalNumber,
  getProposalPrintPath,
} from "./proposalUtils";

type ProposalActionsProps = {
  proposal: Proposal;
};

export const ProposalActions = ({ proposal }: ProposalActionsProps) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const translate = useTranslate();
  const [isDuplicating, setIsDuplicating] = useState(false);

  const getNextProposalNumber = async () => {
    const { data: latestProposals } = await dataProvider.getList<Proposal>(
      "proposals",
      {
        filter: {},
        sort: { field: "id", order: "DESC" },
        pagination: { page: 1, perPage: 1 },
      },
    );
    const latestNumericId = Number(latestProposals[0]?.id);
    const nextId = Number.isFinite(latestNumericId) ? latestNumericId + 1 : 1;

    return buildProposalNumber(nextId);
  };

  const duplicateProposal = async () => {
    setIsDuplicating(true);

    try {
      const nextNumber = await getNextProposalNumber();
      const { data: items } = await dataProvider.getList<ProposalItem>(
        "proposal_items",
        {
          filter: { proposal_id: proposal.id },
          sort: { field: "index", order: "ASC" },
          pagination: { page: 1, perPage: 100 },
        },
      );
      const payload = buildDuplicateProposalPayload(
        proposal,
        items,
        nextNumber,
      );
      const { data: savedProposal } = await dataProvider.create<Proposal>(
        "proposals",
        {
          data: payload.proposal,
        },
      );

      await Promise.all(
        payload.items.map((item, index) =>
          dataProvider.create("proposal_items", {
            data: {
              ...item,
              proposal_id: savedProposal.id,
              index,
            },
          }),
        ),
      );

      notify("resources.proposals.notifications.duplicated", {
        type: "info",
      });
      redirect("show", "proposals", savedProposal.id);
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "resources.proposals.notifications.duplicate_error",
        { type: "error" },
      );
    } finally {
      setIsDuplicating(false);
    }
  };

  const printProposal = () => {
    const printWindow = window.open(
      `#${getProposalPrintPath(proposal.id)}`,
      "_blank",
    );

    if (!printWindow) {
      notify("resources.proposals.notifications.print_blocked", {
        type: "warning",
      });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isDuplicating}
        onClick={duplicateProposal}
      >
        <Copy className="h-4 w-4" />
        {translate("resources.proposals.action.duplicate")}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={printProposal}>
        <FileText className="h-4 w-4" />
        {translate("resources.proposals.action.export_pdf")}
      </Button>
    </div>
  );
};
