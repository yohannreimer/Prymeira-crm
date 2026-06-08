import type { Task } from "../../../types";
import type { Db } from "./types";

export const type: string[] = [
  "email",
  "call",
  "demo",
  "meeting",
  "follow-up",
  "thank-you",
  "ship",
  "none",
];

const contactTaskTexts = [
  "Confirmar próximos passos com decisor",
  "Enviar resumo executivo da reunião",
  "Validar campos obrigatórios do funil",
  "Agendar demonstração com equipe operacional",
  "Retomar dúvidas sobre implantação",
  "Coletar exemplos de propostas atuais",
  "Mapear aprovações internas",
  "Enviar comparativo do piloto",
  "Preparar roteiro de treinamento",
  "Confirmar participantes da implantação",
  "Revisar lista de integrações",
  "Atualizar temperatura do relacionamento",
];

const leadTaskTexts = [
  "Fazer primeiro contato com prospect",
  "Qualificar dor principal e prazo",
  "Enviar material institucional Prymeira",
  "Agendar reunião de diagnóstico",
  "Registrar objeções iniciais",
  "Confirmar origem da indicação",
  "Validar tamanho do time comercial",
  "Checar orçamento estimado",
];

const dealTaskTexts = [
  "Revisar proposta antes do envio",
  "Retomar aprovação financeira",
  "Marcar reunião de negociação",
  "Enviar versão atualizada da proposta",
  "Checar pendências jurídicas",
  "Preparar plano de implantação",
  "Atualizar probabilidade do negócio",
  "Registrar decisão do comitê",
  "Enviar cronograma de implantação",
  "Definir critérios de sucesso do piloto",
];

const taskTypes = ["call", "email", "meeting", "demo", "follow-up", "ship"];

const dueDates = [
  "2026-06-08T13:00:00.000Z",
  "2026-06-09T10:00:00.000Z",
  "2026-06-10T15:30:00.000Z",
  "2026-06-11T12:00:00.000Z",
  "2026-06-12T17:00:00.000Z",
  "2026-06-15T09:30:00.000Z",
  "2026-06-16T14:00:00.000Z",
  "2026-06-17T11:00:00.000Z",
];

export const generateTasks = (db: Db): Task[] => {
  let id = 0;

  const contactTasks = db.contacts.flatMap((contact, index) => {
    const amount = index % 3 === 0 ? 2 : 1;
    contact.nb_tasks = (contact.nb_tasks ?? 0) + amount;
    return Array.from({ length: amount }).map((_, offset) => ({
      id: id++,
      contact_id: contact.id,
      lead_id: null,
      deal_id: null,
      automation_run_id: null,
      type: taskTypes[(index + offset) % taskTypes.length],
      text: contactTaskTexts[(index + offset) % contactTaskTexts.length],
      due_date: dueDates[(index + offset) % dueDates.length],
      done_date:
        (index + offset) % 5 === 0 ? "2026-06-04T18:00:00.000Z" : null,
      sales_id: contact.sales_id,
    }));
  });

  const leadTasks = db.leads.flatMap((lead, index) => {
    const amount = index % 4 === 0 ? 2 : 1;
    return Array.from({ length: amount }).map((_, offset) => ({
      id: id++,
      contact_id: null,
      lead_id: lead.id,
      deal_id: null,
      automation_run_id: null,
      type: taskTypes[(index + offset + 1) % taskTypes.length],
      text: leadTaskTexts[(index + offset) % leadTaskTexts.length],
      due_date: dueDates[(index + offset + 2) % dueDates.length],
      done_date: index % 6 === 0 ? "2026-06-05T17:00:00.000Z" : null,
      sales_id: lead.sales_id,
    }));
  });

  const dealTasks = db.deals.flatMap((deal, index) => {
    const amount = index % 2 === 0 ? 2 : 1;
    return Array.from({ length: amount }).map((_, offset) => ({
      id: id++,
      contact_id: null,
      lead_id: null,
      deal_id: deal.id,
      automation_run_id: null,
      type: taskTypes[(index + offset + 2) % taskTypes.length],
      text: dealTaskTexts[(index + offset) % dealTaskTexts.length],
      due_date: dueDates[(index + offset + 4) % dueDates.length],
      done_date: index % 7 === 0 ? "2026-06-03T16:00:00.000Z" : null,
      sales_id: deal.sales_id,
    }));
  });

  return [...contactTasks, ...leadTasks, ...dealTasks];
};
