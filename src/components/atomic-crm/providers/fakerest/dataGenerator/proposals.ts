import type { Proposal } from "../../../types";
import type { Db } from "./types";

const proposalDealIds = [0, 1, 4, 5, 8, 10, 13];

export const generateProposals = (db: Db): Proposal[] =>
  proposalDealIds
    .map((dealId, index) => {
      const deal = db.deals.find((item) => item.id === dealId);
      if (!deal) return null;

      const sentAt = new Date("2026-06-01T12:00:00.000Z");
      sentAt.setDate(sentAt.getDate() + index);
      const validUntil = new Date(sentAt);
      validUntil.setDate(validUntil.getDate() + 18);

      const subtotal = Math.round(deal.amount * 55);
      const discount = index % 3 === 0 ? Math.round(subtotal * 0.05) : 0;
      const total = subtotal - discount;

      return {
        id: index + 1,
        deal_id: deal.id,
        company_id: deal.company_id,
        contact_id: deal.contact_ids?.[0] ?? null,
        sales_id: deal.sales_id,
        template_id: 1,
        number: `PROP-${String(index + 1).padStart(4, "0")}`,
        title: `Proposta Prymeira - ${deal.name}`,
        status: index === 0 ? "accepted" : index === 6 ? "draft" : "sent",
        scope:
          "Implantação assistida do CRM Prymeira Vincula, configuração do funil, cadências comerciais, treinamento e acompanhamento executivo.",
        terms:
          "Proposta válida conforme data indicada. Condições podem ser ajustadas após validação de escopo e agenda de implantação.",
        internal_notes:
          "Demo local com valores e escopo fictícios para apresentação Prymeira.",
        delivery_time: "30 dias corridos após início do projeto",
        payment_terms: "40% na assinatura, 60% após implantação assistida",
        currency: "BRL",
        subtotal,
        discount_amount: discount,
        tax_amount: 0,
        total,
        valid_until: validUntil.toISOString().split("T")[0],
        sent_at: index === 6 ? null : sentAt.toISOString(),
        accepted_at: index === 0 ? "2026-06-07T12:00:00.000Z" : null,
        rejected_at: null,
        created_at: sentAt.toISOString(),
        updated_at: sentAt.toISOString(),
      };
    })
    .filter(Boolean) as Proposal[];
