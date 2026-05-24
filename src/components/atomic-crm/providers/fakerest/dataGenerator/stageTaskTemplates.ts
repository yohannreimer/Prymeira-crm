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
      name: "Ligar hoje",
      task_text: "Ligar para qualificar {{deal.name}}",
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
      name: "Follow-up da proposta",
      task_text: "Retomar proposta de {{deal.name}}",
      task_type: "follow-up",
      due_in_days: 2,
      mode: "automatic",
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
