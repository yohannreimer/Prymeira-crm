import type { ProposalTemplate } from "../../../types";

export const generateProposalTemplates = (): ProposalTemplate[] => [
  {
    id: 1,
    name: "Proposta Prymeira Vincula",
    description:
      "Template para projetos de CRM, funil comercial, automações e implantação assistida.",
    default_scope:
      "Diagnóstico comercial, configuração do CRM, treinamento da equipe, acompanhamento de implantação e leitura executiva do funil.",
    default_terms:
      "Esta proposta é válida até a data indicada e pode ser revisada conforme alinhamento de escopo, agenda e integrações.",
    active: true,
    created_at: "2026-05-20T00:00:00.000Z",
    updated_at: "2026-06-05T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Expansão e pós-venda",
    description:
      "Template para expansão de contas, pós-venda, implantação e rotinas de sucesso do cliente.",
    default_scope:
      "Mapeamento de oportunidades de expansão, cadências de pós-venda, tarefas automáticas e painel de acompanhamento por conta.",
    default_terms:
      "Condições válidas para contas ativas Prymeira, sujeitas a agenda de implantação e disponibilidade dos usuários-chave.",
    active: true,
    created_at: "2026-05-28T00:00:00.000Z",
    updated_at: "2026-06-05T00:00:00.000Z",
  },
];
