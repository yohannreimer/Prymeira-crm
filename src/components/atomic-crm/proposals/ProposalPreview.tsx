import { useTranslate } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { Company, Proposal, ProposalItem } from "../types";
import { ProposalStatusBadge } from "./ProposalStatusBadge";
import { formatProposalAmount } from "./proposalUtils";

const LOCALE = "pt-BR";

export const ProposalPreview = ({
  proposal,
  company,
  items = [],
  printMode = false,
}: {
  proposal: Proposal;
  company?: Company;
  items?: ProposalItem[];
  printMode?: boolean;
}) => {
  const translate = useTranslate();
  const formatAmount = (value: number | null | undefined) =>
    formatProposalAmount(value, proposal.currency, LOCALE);

  return (
    <Card
      className={cn(
        "mx-auto w-full max-w-5xl print:max-w-none print:border-0 print:shadow-none",
        printMode && "border-0 shadow-none",
      )}
    >
      <CardContent
        className={cn("space-y-8 p-6 md:p-8 print:p-0", printMode && "p-0")}
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm font-medium text-muted-foreground">
                {proposal.number}
              </div>
              <ProposalStatusBadge proposal={proposal} />
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              {proposal.title}
            </h2>
          </div>
          {company ? (
            <div className="text-right">
              {company.logo?.src ? (
                <img
                  src={company.logo.src}
                  alt={company.name}
                  className="ml-auto mb-2 h-10 max-w-32 object-contain"
                />
              ) : null}
              <div className="font-medium">{company.name}</div>
              <div className="text-sm text-muted-foreground">
                {company.website}
              </div>
            </div>
          ) : null}
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          {company ? (
            <PreviewText title={translate("resources.companies.name")}>
              {company.name}
            </PreviewText>
          ) : null}
          <PreviewText title={translate("resources.proposals.fields.scope")}>
            {proposal.scope}
          </PreviewText>
          <PreviewText title={translate("resources.proposals.fields.terms")}>
            {proposal.terms}
          </PreviewText>
          {proposal.delivery_time ? (
            <PreviewText
              title={translate("resources.proposals.fields.delivery_time")}
            >
              {proposal.delivery_time}
            </PreviewText>
          ) : null}
          {proposal.payment_terms ? (
            <PreviewText
              title={translate("resources.proposals.fields.payment_terms")}
            >
              {proposal.payment_terms}
            </PreviewText>
          ) : null}
        </div>

        <Separator />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-4 font-medium">
                  {translate("resources.proposal_items.fields.description")}
                </th>
                <th className="py-2 pr-4 text-right font-medium">
                  {translate("resources.proposal_items.fields.quantity")}
                </th>
                <th className="py-2 pr-4 text-right font-medium">
                  {translate("resources.proposal_items.fields.unit_price")}
                </th>
                <th className="py-2 text-right font-medium">
                  {translate("resources.proposal_items.fields.total")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 pr-4">{item.description}</td>
                  <td className="py-3 pr-4 text-right">{item.quantity}</td>
                  <td className="py-3 pr-4 text-right">
                    {formatAmount(item.unit_price)}
                  </td>
                  <td className="py-3 text-right">
                    {formatAmount(item.total)}
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    {translate("resources.proposals.empty_items")}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full max-w-sm space-y-2 text-sm">
          <AmountRow
            label={translate("resources.proposals.fields.subtotal")}
            value={formatAmount(proposal.subtotal)}
          />
          <AmountRow
            label={translate("resources.proposals.fields.discount_amount")}
            value={formatAmount(proposal.discount_amount)}
          />
          <AmountRow
            label={translate("resources.proposals.fields.tax_amount")}
            value={formatAmount(proposal.tax_amount)}
          />
          <Separator />
          <AmountRow
            label={translate("resources.proposals.fields.total")}
            value={formatAmount(proposal.total)}
            strong
          />
        </div>

        <div className="mt-10 grid gap-8 text-sm md:grid-cols-2 print:grid-cols-2">
          <div className="border-t pt-3">
            {translate("resources.proposals.print.client_acceptance")}
          </div>
          <div className="border-t pt-3">
            {translate("resources.proposals.print.seller_signature")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PreviewText = ({
  title,
  children,
}: {
  title: string;
  children?: string | null;
}) => (
  <div>
    <div className="text-xs text-muted-foreground">{title}</div>
    <p className="mt-1 whitespace-pre-wrap">{children || "-"}</p>
  </div>
);

const AmountRow = ({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <div
    className={`flex items-center justify-between gap-4 ${
      strong ? "text-base font-semibold" : ""
    }`}
  >
    <span className="text-muted-foreground">{label}</span>
    <span>{value}</span>
  </div>
);
