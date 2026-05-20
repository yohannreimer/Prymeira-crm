import type { Proposal } from "../../../types";
import type { Db } from "./types";

export const generateProposals = (db: Db): Proposal[] => {
  const deal = db.deals[0];
  if (!deal) return [];

  return [
    {
      id: 1,
      deal_id: deal.id,
      company_id: deal.company_id,
      contact_id: deal.contact_ids?.[0] ?? null,
      sales_id: deal.sales_id,
      template_id: 1,
      number: "PROP-0001",
      title: `Proposta - ${deal.name}`,
      status: "sent",
      scope: "Implantacao inicial e acompanhamento comercial.",
      terms: "Valida por 15 dias.",
      currency: "BRL",
      subtotal: 12000,
      discount_amount: 0,
      tax_amount: 0,
      total: 12000,
      valid_until: "2026-06-05",
      sent_at: "2026-05-20T12:00:00.000Z",
      accepted_at: null,
      rejected_at: null,
      created_at: "2026-05-20T12:00:00.000Z",
      updated_at: "2026-05-20T12:00:00.000Z",
    },
  ];
};
