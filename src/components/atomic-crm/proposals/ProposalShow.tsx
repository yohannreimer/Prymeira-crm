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
import { ProposalStatusBadge } from "./ProposalStatusBadge";

const LOCALE = "pt-BR";

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
    { enabled: Boolean(record?.id) },
  );
  const { data: company } = useGetOne<Company>(
    "companies",
    { id: record?.company_id ?? "" },
    { enabled: Boolean(record?.company_id) },
  );

  if (isPending || !record) return null;

  if (printMode) {
    return (
      <div>
        <div className="mb-4 flex justify-end print:hidden">
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => window.print()}
            type="button"
          >
            {translate("resources.proposals.action.print")}
          </button>
        </div>
        <ProposalPreview
          proposal={record}
          company={company}
          items={items}
          printMode={printMode}
        />
      </div>
    );
  }

  const formatter = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: record.currency || "BRL",
  });

  const validUntil = record.valid_until
    ? new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" }).format(
        new Date(`${record.valid_until}T00:00:00`),
      )
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Comercial
        </p>
        <h1 className="text-[18px] font-bold text-foreground leading-tight">
          {record.title}
        </h1>
      </div>
      <div className={cn("flex gap-8")}>
        {/* Left: actions + metadata */}
        <div className="w-[200px] shrink-0 flex flex-col gap-4">
          <ProposalActions proposal={record} />
          <div className="flex flex-col gap-3 pt-2 border-t border-border/40">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {translate("resources.proposals.fields.status")}
              </p>
              <div className="mt-1">
                <ProposalStatusBadge proposal={record} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {translate("resources.proposals.fields.number")}
              </p>
              <p className="mt-0.5 text-[13px] text-foreground">
                {record.number}
              </p>
            </div>
            {validUntil && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {translate("resources.proposals.fields.valid_until")}
                </p>
                <p className="mt-0.5 text-[13px] text-foreground">
                  {validUntil}
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {translate("resources.proposals.fields.total")}
              </p>
              <p className="mt-0.5 text-[15px] font-semibold text-primary">
                {formatter.format(record.total / 100)}
              </p>
            </div>
          </div>
        </div>
        {/* Right: proposal preview */}
        <div className="flex-1 min-w-0">
          <ProposalPreview
            proposal={record}
            company={company}
            items={items}
            printMode={false}
          />
        </div>
      </div>
    </div>
  );
};
