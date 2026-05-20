import type { ProposalTemplateItem } from "../../../types";

export const generateProposalTemplateItems = (): ProposalTemplateItem[] => [
  {
    id: 1,
    template_id: 1,
    description: "Diagnostico comercial e configuracao inicial",
    quantity: 1,
    unit_price: 350000,
    discount_amount: 0,
    index: 0,
  },
  {
    id: 2,
    template_id: 1,
    description: "Treinamento da equipe",
    quantity: 1,
    unit_price: 180000,
    discount_amount: 0,
    index: 1,
  },
];
