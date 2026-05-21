import type { ProposalTemplate } from "../../../types";

export const generateProposalTemplates = (): ProposalTemplate[] => [
  {
    id: 1,
    name: "Proposta comercial padrao",
    description: "Template simples para propostas comerciais",
    default_scope: "Escopo comercial a ser ajustado pelo vendedor.",
    default_terms:
      "Esta proposta e valida ate a data indicada e pode ser revisada conforme alinhamento comercial.",
    active: true,
    created_at: "2026-05-20T00:00:00.000Z",
    updated_at: "2026-05-20T00:00:00.000Z",
  },
];
