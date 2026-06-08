import type { ContactNote } from "../../../types";
import type { Db } from "./types";

const noteTexts = [
  "Reunião inicial registrada. Cliente quer reduzir perda de histórico entre vendedores e padronizar próximos passos.",
  "Enviamos resumo executivo com escopo sugerido, etapas do piloto e responsabilidades do time interno.",
  "Contato pediu exemplos de relatórios e indicadores para apresentar na próxima reunião de diretoria.",
  "Mapeamos objeções principais: tempo de implantação, treinamento da equipe e integração com ferramentas atuais.",
  "Cliente demonstrou interesse em automações de follow-up e controle de propostas por etapa do funil.",
  "Foi combinado retorno com participantes de operação e financeiro para validar impacto do projeto.",
  "Contato reforçou que a equipe precisa de um fluxo simples, com poucas telas e acompanhamento visual.",
  "Registrado alinhamento sobre próximos passos: demo guiada, proposta revisada e cronograma de implantação.",
];

const statuses = ["warm", "hot", "in-contract", "warm", "cold", "hot"];

export const generateContactNotes = (db: Db): ContactNote[] => {
  let id = 0;

  return db.contacts.flatMap((contact, index) => {
    const firstDate = new Date(contact.first_seen);
    const notes = [0, 1].map((offset) => {
      const date = new Date(firstDate);
      date.setDate(date.getDate() + 12 + offset * 28 + (index % 9));
      const isoDate = date.toISOString();
      if (isoDate > contact.last_seen) {
        contact.last_seen = isoDate;
      }
      return {
        id: id++,
        contact_id: contact.id,
        text: noteTexts[(index + offset) % noteTexts.length],
        date: isoDate,
        sales_id: contact.sales_id!,
        status: statuses[(index + offset) % statuses.length],
      };
    });

    if (index % 4 === 0) {
      const date = new Date(firstDate);
      date.setDate(date.getDate() + 86 + (index % 7));
      const isoDate = date.toISOString();
      if (isoDate > contact.last_seen) {
        contact.last_seen = isoDate;
      }
      notes.push({
        id: id++,
        contact_id: contact.id,
        text: "Follow-up avançado registrado com interesse claro em proposta, implantação e acompanhamento executivo.",
        date: isoDate,
        sales_id: contact.sales_id!,
        status: "hot",
      });
    }

    return notes;
  });
};
