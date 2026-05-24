import type { Pipeline } from "../../../types";
import { DEFAULT_WORKSPACE_ID } from "./constants";

const DEFAULT_STAGES = [
  { value: "opportunity", label: "Oportunidade" },
  { value: "proposal-sent", label: "Proposta enviada" },
  { value: "in-negociation", label: "Em negociação" },
  { value: "won", label: "Ganho" },
  { value: "lost", label: "Perdido" },
  { value: "delayed", label: "Adiado" },
];

const POS_VENDA_STAGES = [
  { value: "onboarding", label: "Onboarding" },
  { value: "nutrition", label: "Nutrição" },
  { value: "expansion", label: "Expansão" },
];

export const generatePipelines = (): Pipeline[] => [
  {
    id: 1,
    name: "Vendas",
    stages: DEFAULT_STAGES,
    created_at: new Date().toISOString(),
    workspace_id: DEFAULT_WORKSPACE_ID,
  },
  {
    id: 2,
    name: "Pos-venda",
    stages: POS_VENDA_STAGES,
    created_at: new Date().toISOString(),
    workspace_id: DEFAULT_WORKSPACE_ID,
  },
];
