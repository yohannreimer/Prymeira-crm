import { describe, expect, it, vi } from "vitest";
import type { DataProvider } from "ra-core";
import type { Lead } from "../../types";
import { convertLead } from "./convertLead";

const lead: Lead = {
  id: 12,
  first_name: "Ana",
  last_name: "Silva",
  email: "ana@example.com",
  phone_number: "+55 51 99999-0000",
  company_name: "Acme Brasil",
  source: "Indicação",
  interest: "Implantação de CRM",
  temperature: "hot",
  status: "qualified",
  next_action_at: "2026-05-22T12:00:00.000Z",
  discard_reason: null,
  converted_at: null,
  discarded_at: null,
  created_at: "2026-05-20T10:00:00.000Z",
  updated_at: "2026-05-20T10:00:00.000Z",
  sales_id: 4,
};

describe("convertLead", () => {
  it("creates company, contact, deal, and marks lead as converted", async () => {
    vi.setSystemTime(new Date("2026-05-20T12:00:00.000Z"));

    const create = vi
      .fn()
      .mockResolvedValueOnce({
        data: { id: 21, name: "Acme Brasil" },
      })
      .mockResolvedValueOnce({
        data: { id: 31, first_name: "Ana", last_name: "Silva" },
      })
      .mockResolvedValueOnce({
        data: { id: 41, name: "Implantação de CRM" },
      });
    const update = vi.fn().mockResolvedValueOnce({
      data: {
        ...lead,
        status: "converted",
        converted_at: "2026-05-20T12:00:00.000Z",
      },
    });
    const dataProvider = { create, update } as unknown as DataProvider;

    const result = await convertLead(dataProvider, {
      lead,
      amount: 15000,
      expectedClosingDate: "2026-06-20",
    });

    expect(create).toHaveBeenNthCalledWith(1, "companies", {
      data: {
        name: "Acme Brasil",
        phone_number: "+55 51 99999-0000",
        sales_id: 4,
      },
    });
    expect(create).toHaveBeenNthCalledWith(2, "contacts", {
      data: expect.objectContaining({
        first_name: "Ana",
        last_name: "Silva",
        company_id: 21,
        sales_id: 4,
        status: "hot",
        email_jsonb: [{ email: "ana@example.com", type: "Work" }],
        phone_jsonb: [{ number: "+55 51 99999-0000", type: "Work" }],
      }),
    });
    expect(create).toHaveBeenNthCalledWith(3, "deals", {
      data: expect.objectContaining({
        name: "Implantação de CRM",
        company_id: 21,
        contact_ids: [31],
        source: "Indicação",
        amount: 15000,
        stage: "opportunity",
        sales_id: 4,
      }),
    });
    expect(update).toHaveBeenCalledWith("leads", {
      id: 12,
      data: {
        status: "converted",
        converted_at: "2026-05-20T12:00:00.000Z",
        updated_at: "2026-05-20T12:00:00.000Z",
      },
      previousData: lead,
    });
    expect(result.company.id).toBe(21);
    expect(result.contact.id).toBe(31);
    expect(result.deal.id).toBe(41);

    vi.useRealTimers();
  });
});
