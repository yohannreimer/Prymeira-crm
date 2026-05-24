import { add } from "date-fns";
import { datatype, lorem, random } from "faker/locale/en_US";

import {
  defaultDealCategories,
  defaultDealLostReasons,
  defaultDealTypes,
} from "../../../root/defaultConfiguration";
import type { Deal } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

export const generateDeals = (db: Db): Deal[] => {
  const deals = Array.from(Array(50).keys()).map((id) => {
    const company = random.arrayElement(db.companies);
    const pipeline = random.arrayElement(db.pipelines);
    company.nb_deals = (company.nb_deals ?? 0) + 1;
    const contacts = random.arrayElements(
      db.contacts.filter((contact) => contact.company_id === company.id),
      datatype.number({ min: 1, max: 3 }),
    );
    const lowercaseName = lorem.words();
    const created_at = randomDate(new Date(company.created_at)).toISOString();
    const stage = random.arrayElement(pipeline.stages).value;

    const expected_closing_date = randomDate(
      new Date(created_at),
      add(new Date(created_at), { months: 6 }),
    )
      .toISOString()
      .split("T")[0];

    return {
      id,
      name: lowercaseName[0].toUpperCase() + lowercaseName.slice(1),
      company_id: company.id,
      contact_ids: contacts.map((contact) => contact.id),
      category: random.arrayElement(defaultDealCategories).value,
      deal_type: random.arrayElement(defaultDealTypes).value,
      probability: datatype.number({ min: 5, max: 95 }),
      source: random.arrayElement(["website", "referral", "outbound", "event"]),
      lost_reason: null as string | null,
      next_action_at: randomDate(new Date(created_at)).toISOString(),
      last_activity_at: randomDate(new Date(created_at)).toISOString(),
      stage,
      description: lorem.paragraphs(datatype.number({ min: 1, max: 4 })),
      amount: datatype.number(1000) * 100,
      created_at,
      updated_at: randomDate(new Date(created_at)).toISOString(),
      expected_closing_date,
      sales_id: company.sales_id!,
      pipeline_id: pipeline.id,
      index: 0,
    };
  });
  // Compute indexes within each pipeline stage.
  db.pipelines.forEach((pipeline) => {
    pipeline.stages.forEach((stage) => {
      deals
        .filter(
          (deal) =>
            deal.pipeline_id === pipeline.id && deal.stage === stage.value,
        )
        .forEach((deal, index) => {
          deals[deal.id].index = index;
        });
    });
  });
  const vendas = db.pipelines.find((pipeline) => pipeline.name === "Vendas");
  deals.forEach((deal) => {
    if (deal.pipeline_id !== vendas?.id) {
      return;
    }
    if (deal.stage === "lost") {
      deal.lost_reason = random.arrayElement(defaultDealLostReasons).value;
      deal.probability = 0;
    }
    if (deal.stage === "won") {
      deal.probability = 100;
    }
  });
  return deals;
};
