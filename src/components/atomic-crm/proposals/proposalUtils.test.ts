import { describe, expect, it } from "vitest";

import type {
  Proposal,
  ProposalItem,
  ProposalTemplate,
  ProposalTemplateItem,
} from "../types";
import {
  buildDuplicateProposalPayload,
  buildProposalNumber,
  buildProposalDefaultsFromTemplate,
  calculateProposalTotals,
  getNextProposalStatusData,
  isProposalExpired,
} from "./proposalUtils";

const item = (
  id: number,
  quantity: number,
  unitPrice: number,
  discountAmount = 0,
): ProposalItem => ({
  id,
  proposal_id: 1,
  description: `Item ${id}`,
  quantity,
  unit_price: unitPrice,
  discount_amount: discountAmount,
  total: 0,
  index: id,
});

const proposal = (overrides: Partial<Proposal> = {}): Proposal => ({
  id: 1,
  deal_id: 10,
  company_id: 20,
  contact_id: null,
  sales_id: 1,
  template_id: 1,
  number: "PROP-0001",
  title: "Proposta CRM",
  status: "draft",
  scope: "Escopo",
  terms: "Termos",
  currency: "BRL",
  subtotal: 0,
  discount_amount: 0,
  valid_until: "2026-05-25",
  sent_at: null,
  accepted_at: null,
  rejected_at: null,
  created_at: "2026-05-20T12:00:00.000Z",
  updated_at: "2026-05-20T12:00:00.000Z",
  ...overrides,
  tax_amount: overrides.tax_amount ?? 0,
  total: overrides.total ?? 0,
});

const template = (): ProposalTemplate => ({
  id: 1,
  name: "Implantacao",
  description: "Template",
  default_scope: "Escopo padrao",
  default_terms: "Condicoes padrao",
  active: true,
  created_at: "2026-05-20T00:00:00.000Z",
  updated_at: "2026-05-20T00:00:00.000Z",
});

const templateItem = (
  id: number,
  description: string,
): ProposalTemplateItem => ({
  id,
  template_id: 1,
  description,
  quantity: 1,
  unit_price: 10000,
  discount_amount: 0,
  index: id - 1,
});

describe("proposalUtils", () => {
  it("calculates item totals, subtotal, discount, and final total", () => {
    expect(
      calculateProposalTotals([item(1, 2, 1000), item(2, 1, 5000, 500)]),
    ).toEqual({
      items: [
        expect.objectContaining({ id: 1, total: 2000 }),
        expect.objectContaining({ id: 2, total: 4500 }),
      ],
      subtotal: 7000,
      discountAmount: 500,
      taxAmount: 0,
      total: 6500,
    });
  });

  it("rounds fractional quantity totals to integer cents", () => {
    expect(calculateProposalTotals([item(1, 1.5, 999)])).toEqual({
      items: [expect.objectContaining({ id: 1, total: 1499 })],
      subtotal: 1499,
      discountAmount: 0,
      taxAmount: 0,
      total: 1499,
    });
  });

  it("sums clamped item totals for the final proposal total", () => {
    expect(
      calculateProposalTotals([item(1, 1, 1000, 1500), item(2, 1, 1000, -500)]),
    ).toEqual({
      items: [
        expect.objectContaining({ id: 1, discount_amount: 1000, total: 0 }),
        expect.objectContaining({ id: 2, discount_amount: 0, total: 1000 }),
      ],
      subtotal: 2000,
      discountAmount: 1000,
      taxAmount: 0,
      total: 1000,
    });
  });

  it("adds tax amount after item discounts", () => {
    const result = calculateProposalTotals([item(1, 1, 10000, 1000)], 900);

    expect(result.total).toBe(
      result.subtotal - result.discountAmount + result.taxAmount,
    );
    expect(result).toEqual({
      items: [
        expect.objectContaining({
          total: 9000,
        }),
      ],
      subtotal: 10000,
      discountAmount: 1000,
      taxAmount: 900,
      total: 9900,
    });
  });

  it("clamps negative tax to zero", () => {
    expect(calculateProposalTotals([item(1, 1, 10000)], -500).taxAmount).toBe(
      0,
    );
  });

  it("builds proposal defaults from a template without mutating items", () => {
    const items = [templateItem(2, "Treinamento"), templateItem(1, "Setup")];
    const originalOrder = items.map((item) => item.description);

    expect(buildProposalDefaultsFromTemplate(template(), items)).toEqual({
      template_id: 1,
      scope: "Escopo padrao",
      terms: "Condicoes padrao",
      items: [
        {
          description: "Setup",
          quantity: 1,
          unit_price: 10000,
          discount_amount: 0,
        },
        {
          description: "Treinamento",
          quantity: 1,
          unit_price: 10000,
          discount_amount: 0,
        },
      ],
    });
    expect(items.map((item) => item.description)).toEqual(originalOrder);
  });

  it("builds a draft duplicate payload and clears lifecycle dates", () => {
    const duplicated = buildDuplicateProposalPayload(
      proposal({
        id: 12,
        title: "Proposta Original",
        number: "PROP-0012",
        status: "accepted",
        sent_at: "2026-05-20T10:00:00.000Z",
        accepted_at: "2026-05-21T10:00:00.000Z",
        rejected_at: null,
      }),
      [item(1, 1, 10000)],
      "PROP-0013",
    );

    expect(Object.keys(duplicated.proposal).sort()).toEqual(
      [
        "accepted_at",
        "company_id",
        "contact_id",
        "currency",
        "deal_id",
        "delivery_time",
        "discount_amount",
        "internal_notes",
        "number",
        "payment_terms",
        "rejected_at",
        "sales_id",
        "scope",
        "sent_at",
        "status",
        "subtotal",
        "tax_amount",
        "template_id",
        "terms",
        "title",
        "total",
        "valid_until",
      ].sort(),
    );
    expect(duplicated.proposal).toEqual({
      deal_id: 10,
      company_id: 20,
      contact_id: null,
      sales_id: 1,
      template_id: 1,
      number: "PROP-0013",
      title: "Proposta Original - copia",
      status: "draft",
      scope: "Escopo",
      terms: "Termos",
      internal_notes: null,
      delivery_time: null,
      payment_terms: null,
      currency: "BRL",
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      total: 0,
      valid_until: "2026-05-25",
      sent_at: null,
      accepted_at: null,
      rejected_at: null,
    });
    expect(duplicated.proposal).not.toHaveProperty("id");
    expect(duplicated.proposal).not.toHaveProperty("created_at");
    expect(duplicated.proposal).not.toHaveProperty("updated_at");
    expect(duplicated.items).toEqual([
      {
        description: "Item 1",
        quantity: 1,
        unit_price: 10000,
        discount_amount: 0,
        total: 0,
        index: 0,
      },
    ]);
    expect(Object.keys(duplicated.items[0]).sort()).toEqual(
      [
        "description",
        "discount_amount",
        "index",
        "quantity",
        "total",
        "unit_price",
      ].sort(),
    );
    expect(duplicated.items[0]).not.toHaveProperty("id");
    expect(duplicated.items[0]).not.toHaveProperty("proposal_id");
    expect(duplicated.items[0]).not.toHaveProperty("created_at");
    expect(duplicated.items[0]).not.toHaveProperty("updated_at");
  });

  it("detects expired sent proposal", () => {
    expect(
      isProposalExpired(
        proposal({ status: "sent", valid_until: "2026-05-19" }),
        new Date("2026-05-20T12:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("treats valid_until as a local business date ending at end of day", () => {
    expect(
      isProposalExpired(
        proposal({ status: "sent", valid_until: "2026-05-19" }),
        new Date("2026-05-19T23:59:59.999"),
      ),
    ).toBe(false);
    expect(
      isProposalExpired(
        proposal({ status: "sent", valid_until: "2026-05-19" }),
        new Date("2026-05-20T00:00:00.000"),
      ),
    ).toBe(true);
  });

  it("does not expire accepted proposal", () => {
    expect(
      isProposalExpired(
        proposal({ status: "accepted", valid_until: "2026-05-19" }),
        new Date("2026-05-20T12:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("adds timestamps when status changes to sent, accepted, or rejected", () => {
    expect(
      getNextProposalStatusData("sent", new Date("2026-05-20T12:00:00.000Z")),
    ).toEqual({
      status: "sent",
      sent_at: "2026-05-20T12:00:00.000Z",
    });
    expect(
      getNextProposalStatusData(
        "accepted",
        new Date("2026-05-20T12:00:00.000Z"),
      ),
    ).toEqual({
      status: "accepted",
      accepted_at: "2026-05-20T12:00:00.000Z",
    });
    expect(
      getNextProposalStatusData(
        "rejected",
        new Date("2026-05-20T12:00:00.000Z"),
      ),
    ).toEqual({
      status: "rejected",
      rejected_at: "2026-05-20T12:00:00.000Z",
    });
  });

  it("does not add timestamps for draft status", () => {
    expect(
      getNextProposalStatusData("draft", new Date("2026-05-20T12:00:00.000Z")),
    ).toEqual({ status: "draft" });
  });

  it("builds padded proposal numbers", () => {
    expect(buildProposalNumber(1)).toBe("PROP-0001");
    expect(buildProposalNumber(42)).toBe("PROP-0042");
  });
});
