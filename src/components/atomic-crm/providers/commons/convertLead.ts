import type { DataProvider } from "ra-core";
import type {
  Company,
  Contact,
  ConvertLeadInput,
  ConvertLeadResult,
  Deal,
  Lead,
} from "../../types";

const getFullName = (lead: Lead) =>
  [lead.first_name, lead.last_name].filter(Boolean).join(" ").trim();

const getCompanyName = (lead: Lead) =>
  lead.company_name?.trim() ||
  getFullName(lead) ||
  lead.email ||
  "Lead convertido";

const getDealName = (lead: Lead) => {
  if (lead.interest?.trim()) {
    return lead.interest.trim();
  }
  const fullName = getFullName(lead);
  return fullName ? `Novo negócio de ${fullName}` : "Novo negócio";
};

const getDefaultClosingDate = (now: Date) => {
  const date = new Date(now);
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
};

export const convertLead = async (
  dataProvider: Pick<DataProvider, "create" | "update">,
  { lead, dealName, amount = 0, expectedClosingDate }: ConvertLeadInput,
  now = new Date(),
): Promise<ConvertLeadResult> => {
  const nowIso = now.toISOString();
  const companyName = getCompanyName(lead);

  const { data: company } = await dataProvider.create<Company>("companies", {
    data: {
      name: companyName,
      phone_number: lead.phone_number ?? undefined,
      sales_id: lead.sales_id,
    },
  });

  const { data: contact } = await dataProvider.create<Contact>("contacts", {
    data: {
      first_name: lead.first_name,
      last_name: lead.last_name,
      title: "",
      company_id: company.id,
      email_jsonb: lead.email
        ? [{ email: lead.email, type: "Work" as const }]
        : [],
      phone_jsonb: lead.phone_number
        ? [{ number: lead.phone_number, type: "Work" as const }]
        : [],
      first_seen: nowIso,
      last_seen: nowIso,
      has_newsletter: false,
      tags: [],
      gender: "",
      sales_id: lead.sales_id,
      status: lead.temperature,
      background: lead.interest ?? "",
    },
  });

  const { data: deal } = await dataProvider.create<Deal>("deals", {
    data: {
      name: dealName?.trim() || getDealName(lead),
      company_id: company.id,
      contact_ids: [contact.id],
      category: "other",
      deal_type: "consultative",
      probability: 25,
      source: lead.source,
      lost_reason: null,
      next_action_at: lead.next_action_at,
      last_activity_at: nowIso,
      stage: "opportunity",
      description: lead.interest ?? "",
      amount,
      created_at: nowIso,
      updated_at: nowIso,
      expected_closing_date: expectedClosingDate ?? getDefaultClosingDate(now),
      sales_id: lead.sales_id!,
      index: 0,
    },
  });

  const { data: convertedLead } = await dataProvider.update<Lead>("leads", {
    id: lead.id,
    data: {
      status: "converted",
      converted_at: nowIso,
      updated_at: nowIso,
    },
    previousData: lead,
  });

  return {
    lead: convertedLead,
    company,
    contact,
    deal,
  };
};
