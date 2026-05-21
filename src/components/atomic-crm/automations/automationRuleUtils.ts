import type { AutomationRuleParams } from "../types";

const defaults: Record<string, AutomationRuleParams> = {
  "lead.first-contact": {
    dueInDays: 0,
    taskType: "call",
    taskText: "Primeiro contato com {{lead.name}}",
    assignee: "record_owner",
  },
  "deal.follow-up-required": {
    dueInDays: 1,
    taskType: "follow-up",
    taskText: "Definir próximo passo: {{deal.name}}",
    assignee: "record_owner",
  },
  "deal.proposal-follow-up": {
    dueInDays: 2,
    taskType: "follow-up",
    taskText: "Retomar proposta enviada: {{deal.name}}",
    assignee: "record_owner",
  },
  "proposal.sent-follow-up": {
    dueInDays: 2,
    taskType: "follow-up",
    taskText: "Acompanhar proposta: {{proposal.title}}",
    assignee: "record_owner",
  },
  "proposal.accepted-action": {
    acceptedAction: "move_deal_won",
    taskType: "follow-up",
    taskText: "Concluir fechamento da proposta: {{proposal.title}}",
    assignee: "record_owner",
  },
};

export const normalizeAutomationParams = (
  ruleKey: string,
  params: AutomationRuleParams = {},
): AutomationRuleParams => {
  const fallback = defaults[ruleKey] ?? {};

  return {
    ...fallback,
    ...params,
    dueInDays:
      typeof params.dueInDays === "number" && params.dueInDays >= 0
        ? params.dueInDays
        : fallback.dueInDays,
    taskType: params.taskType || fallback.taskType,
    taskText: params.taskText || fallback.taskText,
    assignee: "record_owner",
  };
};

export const describeAutomationRule = (ruleKey: string) => {
  const descriptions: Record<
    string,
    { trigger: string; condition: string; action: string }
  > = {
    "lead.first-contact": {
      trigger: "Lead criado",
      condition: "Sem próxima ação",
      action: "Criar tarefa de primeiro contato",
    },
    "deal.follow-up-required": {
      trigger: "Negócio criado",
      condition: "Sem próxima ação",
      action: "Criar tarefa de follow-up",
    },
    "deal.proposal-follow-up": {
      trigger: "Negócio atualizado",
      condition: "Etapa mudou para Proposta enviada",
      action: "Criar tarefa de follow-up",
    },
    "proposal.sent-follow-up": {
      trigger: "Proposta marcada como enviada",
      condition: "Status mudou para enviada",
      action: "Criar tarefa de follow-up",
    },
    "proposal.accepted-action": {
      trigger: "Proposta marcada como aceita",
      condition: "Status mudou para aceita",
      action: "Executar ação de aceite",
    },
  };

  return (
    descriptions[ruleKey] ?? {
      trigger: "Regra personalizada",
      condition: "Condição configurada",
      action: "Ação configurada",
    }
  );
};
