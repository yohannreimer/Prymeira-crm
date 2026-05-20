import { datatype, internet, name, phone, random } from "faker/locale/en_US";

import type { Lead } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

const statuses: Lead["status"][] = ["new", "contacted", "qualified"];
const temperatures: Lead["temperature"][] = ["cold", "warm", "hot"];
const sources = ["Indicação", "Site", "Outbound", "Evento", "Redes sociais"];
const interests = [
  "Implantação de CRM",
  "Consultoria comercial",
  "Sistema financeiro",
  "Gestão técnica",
  "Treinamento de equipe",
];

export const generateLeads = (db: Db): Lead[] => {
  return Array.from(Array(18).keys()).map((id) => {
    const firstName = name.firstName();
    const lastName = name.lastName();
    const company = random.arrayElement(db.companies);
    const createdAt = randomDate(new Date("2026-01-01")).toISOString();

    return {
      id,
      first_name: firstName,
      last_name: lastName,
      email: internet.email(firstName, lastName).toLowerCase(),
      phone_number: phone.phoneNumber("+55 ## #####-####"),
      company_name: company.name,
      source: random.arrayElement(sources),
      interest: random.arrayElement(interests),
      temperature: random.arrayElement(temperatures),
      status: random.arrayElement(statuses),
      next_action_at: datatype.boolean()
        ? randomDate(new Date(createdAt)).toISOString()
        : null,
      discard_reason: null,
      converted_at: null,
      discarded_at: null,
      created_at: createdAt,
      updated_at: createdAt,
      sales_id: random.arrayElement(db.sales).id,
    };
  });
};
