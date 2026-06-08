import type { DealNote } from "../../../types";
import type { Db } from "./types";

const notes = [
  "Diagnóstico concluído. Oportunidade tem dor clara, patrocinador definido e próximos passos combinados.",
  "Proposta revisada com escopo de implantação, acompanhamento semanal e indicadores executivos.",
  "Cliente pediu ajuste de cronograma para incluir treinamento da equipe operacional no primeiro mês.",
  "Negociação avançou após apresentação do painel e da rotina de tarefas automáticas por etapa.",
  "Aguardando aprovação financeira. Decisor pediu comparativo entre plano inicial e expansão futura.",
  "Risco registrado: cliente precisa alinhar disponibilidade interna para implantação sem atrasar operação.",
  "Reunião de retorno marcada. Próximo passo é validar condições comerciais e data de início.",
  "Conta com bom encaixe para demo em vídeo: dores explícitas, múltiplos usuários e proposta em aberto.",
];

export const generateDealNotes = (db: Db): DealNote[] => {
  let id = 0;

  return db.deals.flatMap((deal, index) => {
    const createdAt = new Date(deal.created_at);
    return [0, 1].map((offset) => {
      const date = new Date(createdAt);
      date.setDate(date.getDate() + 7 + offset * 21 + (index % 6));
      return {
        id: id++,
        deal_id: deal.id,
        text: notes[(index + offset) % notes.length],
        date: date.toISOString(),
        sales_id: deal.sales_id,
      };
    });
  });
};
