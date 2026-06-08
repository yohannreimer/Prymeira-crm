import type { ProposalTemplateItem } from "../../../types";

export const generateProposalTemplateItems = (): ProposalTemplateItem[] => [
  {
    id: 1,
    template_id: 1,
    description: "Diagnóstico comercial e desenho do funil",
    quantity: 1,
    unit_price: 35000,
    discount_amount: 0,
    index: 0,
  },
  {
    id: 2,
    template_id: 1,
    description: "Configuração do CRM Prymeira Vincula",
    quantity: 1,
    unit_price: 52000,
    discount_amount: 0,
    index: 1,
  },
  {
    id: 3,
    template_id: 1,
    description: "Treinamento e implantação assistida",
    quantity: 1,
    unit_price: 28000,
    discount_amount: 0,
    index: 2,
  },
  {
    id: 4,
    template_id: 2,
    description: "Mapeamento de expansão e pós-venda",
    quantity: 1,
    unit_price: 24000,
    discount_amount: 0,
    index: 0,
  },
  {
    id: 5,
    template_id: 2,
    description: "Cadências de sucesso e automações",
    quantity: 1,
    unit_price: 31000,
    discount_amount: 0,
    index: 1,
  },
];
