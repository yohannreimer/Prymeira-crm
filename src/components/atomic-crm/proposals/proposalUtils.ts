import type {
  Proposal,
  ProposalItem,
  ProposalStatus,
  ProposalTemplate,
  ProposalTemplateItem,
} from "../types";

type ProposalTotals = {
  items: ProposalItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
};

export const calculateProposalTotals = (
  items: ProposalItem[],
  taxAmount = 0,
): ProposalTotals => {
  const calculatedItems = items.map((item) => {
    const grossTotal = Math.round(item.quantity * item.unit_price);
    const effectiveDiscountAmount = Math.min(
      Math.max(item.discount_amount, 0),
      grossTotal,
    );
    const total = grossTotal - effectiveDiscountAmount;

    return {
      ...item,
      discount_amount: effectiveDiscountAmount,
      total,
    };
  });

  const subtotal = items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unit_price),
    0,
  );
  const discountAmount = calculatedItems.reduce(
    (sum, item) => sum + item.discount_amount,
    0,
  );
  const normalizedTaxAmount = Math.max(0, Math.round(taxAmount));
  const total = subtotal - discountAmount + normalizedTaxAmount;

  return {
    items: calculatedItems,
    subtotal,
    discountAmount,
    taxAmount: normalizedTaxAmount,
    total,
  };
};

export const isProposalExpired = (
  proposal: Proposal,
  now: Date = new Date(),
): boolean => {
  if (proposal.status !== "sent" || !proposal.valid_until) {
    return false;
  }

  // valid_until is a date-only local business date, valid through end of day.
  const expirationDate = new Date(`${proposal.valid_until}T23:59:59.999`);

  return expirationDate.getTime() < now.getTime();
};

export const getNextProposalStatusData = (
  status: ProposalStatus,
  now: Date = new Date(),
): Partial<Proposal> & { status: ProposalStatus } => {
  const timestamp = now.toISOString();

  if (status === "sent") {
    return { status, sent_at: timestamp };
  }

  if (status === "accepted") {
    return { status, accepted_at: timestamp };
  }

  if (status === "rejected") {
    return { status, rejected_at: timestamp };
  }

  return { status };
};

export const buildProposalNumber = (id: number): string =>
  `PROP-${String(id).padStart(4, "0")}`;

export const buildProposalDefaultsFromTemplate = (
  template: ProposalTemplate,
  items: ProposalTemplateItem[],
) => ({
  template_id: template.id,
  scope: template.default_scope ?? "",
  terms: template.default_terms ?? "",
  items: [...items]
    .sort((a, b) => a.index - b.index)
    .map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
    })),
});

export const buildDuplicateProposalPayload = (
  proposal: Proposal,
  items: ProposalItem[],
  nextNumber: string,
) => ({
  proposal: {
    deal_id: proposal.deal_id,
    company_id: proposal.company_id,
    contact_id: proposal.contact_id ?? null,
    sales_id: proposal.sales_id ?? null,
    template_id: proposal.template_id ?? null,
    number: nextNumber,
    title: `${proposal.title} - copia`,
    status: "draft" as ProposalStatus,
    scope: proposal.scope ?? null,
    terms: proposal.terms ?? null,
    internal_notes: proposal.internal_notes ?? null,
    delivery_time: proposal.delivery_time ?? null,
    payment_terms: proposal.payment_terms ?? null,
    currency: proposal.currency,
    subtotal: proposal.subtotal,
    discount_amount: proposal.discount_amount,
    tax_amount: proposal.tax_amount,
    total: proposal.total,
    valid_until: proposal.valid_until ?? null,
    sent_at: null,
    accepted_at: null,
    rejected_at: null,
  },
  items: [...items]
    .sort((a, b) => a.index - b.index)
    .map((item, index) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
      total: item.total,
      index,
    })),
});

export const getProposalPrintPath = (id: Proposal["id"]) =>
  `/proposals/${id}/show?print=1`;

const DEFAULT_PROPOSAL_CURRENCY = "BRL";

export const getProposalCurrencyCode = (currency?: string | null) => {
  const normalized = currency?.trim().toUpperCase();
  return normalized && /^[A-Z]{3}$/.test(normalized)
    ? normalized
    : DEFAULT_PROPOSAL_CURRENCY;
};

export const formatProposalAmount = (
  value: number | null | undefined,
  currency?: string | null,
  locale = "pt-BR",
) => {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: getProposalCurrencyCode(currency),
  }).format(safeAmount / 100);
};

export const formatProposalDate = (
  value: string | Date | null | undefined,
  locale = "pt-BR",
) => {
  if (!value) return null;
  const date =
    value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
};
