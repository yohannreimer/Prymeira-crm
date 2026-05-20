import {
  ShowBase,
  useGetList,
  useGetOne,
  useShowContext,
  useTranslate,
} from "ra-core";
import { useLocation } from "react-router";

import { cn } from "@/lib/utils";

import type { Company, Proposal, ProposalItem } from "../types";
import { ProposalActions } from "./ProposalActions";
import { ProposalPreview } from "./ProposalPreview";

export const ProposalShow = () => (
  <ShowBase>
    <ProposalShowContent />
  </ShowBase>
);

const ProposalShowContent = () => {
  const { record, isPending } = useShowContext<Proposal>();
  const location = useLocation();
  const translate = useTranslate();
  const printMode = new URLSearchParams(location.search).get("print") === "1";
  const { data: items = [] } = useGetList<ProposalItem>(
    "proposal_items",
    {
      filter: { proposal_id: record?.id },
      sort: { field: "index", order: "ASC" },
      pagination: { page: 1, perPage: 100 },
    },
    {
      enabled: Boolean(record?.id),
    },
  );
  const { data: company } = useGetOne<Company>(
    "companies",
    { id: record?.company_id ?? "" },
    {
      enabled: Boolean(record?.company_id),
    },
  );

  if (isPending || !record) return null;

  return (
    <div className={cn("flex flex-col gap-4", printMode && "block")}>
      {!printMode && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            Comercial
          </p>
          <h1 className="text-[18px] font-bold text-foreground leading-tight">
            {record.title}
          </h1>
        </div>
      )}
      <div className={cn("flex gap-8", printMode && "mt-0 block")}>
        {printMode ? (
          <div className="mb-4 flex justify-end print:hidden">
            <button
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
              onClick={() => window.print()}
              type="button"
            >
              {translate("resources.proposals.action.print")}
            </button>
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-4">
          {printMode ? null : <ProposalActions proposal={record} />}
          <ProposalPreview
            proposal={record}
            company={company}
            items={items}
            printMode={printMode}
          />
        </div>
      </div>
    </div>
  );
};
