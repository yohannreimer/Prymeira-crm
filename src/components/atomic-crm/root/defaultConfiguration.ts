import type { ConfigurationContextValue } from "./ConfigurationContext";

export const defaultDarkModeLogo = "./logos/logo_atomic_crm_dark.svg";
export const defaultLightModeLogo = "./logos/logo_atomic_crm_light.svg";

export const defaultCurrency = "BRL";

export const defaultTitle = "Atomic CRM";

export const defaultCompanySectors = [
  { value: "communication-services", label: "Comunicação e serviços" },
  { value: "consumer-discretionary", label: "Consumo discricionário" },
  { value: "consumer-staples", label: "Bens de consumo" },
  { value: "energy", label: "Energia" },
  { value: "financials", label: "Financeiro" },
  { value: "health-care", label: "Saúde" },
  { value: "industrials", label: "Indústria" },
  { value: "information-technology", label: "Tecnologia da informação" },
  { value: "materials", label: "Materiais" },
  { value: "real-estate", label: "Imobiliário" },
  { value: "utilities", label: "Serviços públicos" },
];

export const defaultDealStages = [
  { value: "opportunity", label: "Oportunidade" },
  { value: "proposal-sent", label: "Proposta enviada" },
  { value: "in-negociation", label: "Em negociação" },
  { value: "won", label: "Ganho" },
  { value: "lost", label: "Perdido" },
  { value: "delayed", label: "Adiado" },
];

export const defaultDealPipelineStatuses = ["won"];

export const defaultDealCategories = [
  { value: "other", label: "Outro" },
  { value: "copywriting", label: "Redação" },
  { value: "print-project", label: "Projeto impresso" },
  { value: "ui-design", label: "Design de interface" },
  { value: "website-design", label: "Design de site" },
];

export const defaultDealTypes = [
  { value: "quick", label: "Venda rápida" },
  { value: "consultative", label: "Venda consultiva" },
  { value: "recurring", label: "Venda recorrente" },
];

export const defaultDealLostReasons = [
  { value: "price", label: "Preço" },
  { value: "no-budget", label: "Sem orçamento" },
  { value: "no-decision", label: "Sem decisão" },
  { value: "competitor", label: "Concorrente" },
  { value: "bad-fit", label: "Não era aderente" },
  { value: "timing", label: "Momento inadequado" },
];

export const defaultNoteStatuses = [
  { value: "cold", label: "Frio", color: "#7dbde8" },
  { value: "warm", label: "Morno", color: "#e8cb7d" },
  { value: "hot", label: "Quente", color: "#e88b7d" },
  { value: "in-contract", label: "Em contrato", color: "#a4e87d" },
];

export const defaultTaskTypes = [
  { value: "none", label: "Nenhum" },
  { value: "email", label: "Email" },
  { value: "demo", label: "Demonstração" },
  { value: "lunch", label: "Almoço" },
  { value: "meeting", label: "Reunião" },
  { value: "follow-up", label: "Retorno" },
  { value: "thank-you", label: "Agradecimento" },
  { value: "ship", label: "Enviar" },
  { value: "call", label: "Ligação" },
];

export const defaultConfiguration: ConfigurationContextValue = {
  companySectors: defaultCompanySectors,
  currency: defaultCurrency,
  dealCategories: defaultDealCategories,
  dealLostReasons: defaultDealLostReasons,
  dealPipelineStatuses: defaultDealPipelineStatuses,
  dealStages: defaultDealStages,
  dealTypes: defaultDealTypes,
  noteStatuses: defaultNoteStatuses,
  taskTypes: defaultTaskTypes,
  title: defaultTitle,
  darkModeLogo: defaultDarkModeLogo,
  lightModeLogo: defaultLightModeLogo,
};
