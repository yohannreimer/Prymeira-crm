import type { ProposalItem } from "../../../types";
import type { Db } from "./types";

const itemDescriptions = [
  "Diagnóstico comercial e desenho do funil",
  "Configuração do CRM, campos e permissões",
  "Treinamento da equipe e acompanhamento assistido",
];

export const generateProposalItems = (db: Db): ProposalItem[] =>
  db.proposals.flatMap((proposal) => {
    const base = Math.round(proposal.subtotal / 3);
    return itemDescriptions.map((description, index) => {
      const unitPrice =
        index === itemDescriptions.length - 1
          ? proposal.subtotal - base * 2
          : base;
      return {
        id: Number(`${proposal.id}${index + 1}`),
        proposal_id: proposal.id,
        description,
        quantity: 1,
        unit_price: unitPrice,
        discount_amount: index === 0 ? proposal.discount_amount : 0,
        total: unitPrice - (index === 0 ? proposal.discount_amount : 0),
        index,
      };
    });
  });
