import type { StageTaskTemplate } from "../../../types";
import { DEFAULT_WORKSPACE_ID } from "./constants";
import type { Db } from "./types";

export const generateStageTaskTemplates = (db: Db): StageTaskTemplate[] => {
  const vendas = db.pipelines.find((pipeline) => pipeline.name === "Vendas");
  const posVenda = db.pipelines.find(
    (pipeline) => pipeline.name === "Pos-venda",
  );

  if (!vendas || !posVenda) {
    throw new Error(
      "Stage task template demo data requires Vendas and Pos-venda pipelines.",
    );
  }

  const now = new Date().toISOString();

  return [
    {
      id: 1,
      workspace_id: DEFAULT_WORKSPACE_ID,
      pipeline_id: vendas.id,
      stage: "opportunity",
      name: "Ligar agora",
      task_text:
        "Ligar para qualificar {{deal.name}}: entender dor, urgencia, orcamento e proximo passo.",
      task_type: "call",
      due_in_days: 0,
      mode: "manual",
      enabled: true,
      instructions: null,
      assignee: "record_owner",
      index: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      workspace_id: DEFAULT_WORKSPACE_ID,
      pipeline_id: vendas.id,
      stage: "proposal-sent",
      name: "Cobrar proposta",
      task_text:
        "Confirmar recebimento da proposta de {{deal.name}} e alinhar duvidas para avancar.",
      task_type: "follow-up",
      due_in_days: 1,
      mode: "manual",
      enabled: true,
      instructions: "Confirmar se o cliente recebeu e entendeu a proposta.",
      assignee: "record_owner",
      index: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      workspace_id: DEFAULT_WORKSPACE_ID,
      pipeline_id: vendas.id,
      stage: "in-negociation",
      name: "Marcar decisao",
      task_text:
        "Agendar reuniao de decisao de {{deal.name}} com proximos passos e responsaveis.",
      task_type: "meeting",
      due_in_days: 2,
      mode: "manual",
      enabled: true,
      instructions: null,
      assignee: "record_owner",
      index: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: 4,
      workspace_id: DEFAULT_WORKSPACE_ID,
      pipeline_id: posVenda.id,
      stage: "nutrition",
      name: "Enviar material educativo",
      task_text: "Enviar material educativo para {{company.name}}",
      task_type: "email",
      due_in_days: 0,
      mode: "manual",
      enabled: true,
      instructions: null,
      assignee: "record_owner",
      index: 0,
      created_at: now,
      updated_at: now,
    },
  ];
};
