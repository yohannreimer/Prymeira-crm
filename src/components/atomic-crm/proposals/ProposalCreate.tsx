import {
  Form,
  useDataProvider,
  useGetIdentity,
  useGetOne,
  useNotify,
  useRedirect,
} from "ra-core";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import type { SubmitHandler } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { Create } from "@/components/admin/create";
import { Card, CardContent } from "@/components/ui/card";

import { FormToolbar } from "../layout/FormToolbar";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal, Proposal, ProposalItem } from "../types";
import { ProposalInputs } from "./ProposalInputs";
import { calculateProposalTotals } from "./proposalUtils";

type ProposalFormData = Omit<Partial<Proposal>, "items"> & {
  items?: Partial<ProposalItem>[];
};

const getProposalPayload = (data: ProposalFormData) => {
  const { items = [], ...proposal } = data;
  const normalizedItems = items
    .filter((item) => item.description)
    .map(
      (item, index) =>
        ({
          id: item.id ?? `new-${index}`,
          proposal_id: item.proposal_id ?? 0,
          description: item.description ?? "",
          quantity: item.quantity ?? 1,
          unit_price: item.unit_price ?? 0,
          discount_amount: item.discount_amount ?? 0,
          total: item.total ?? 0,
          index,
        }) satisfies ProposalItem,
    );
  const totals = calculateProposalTotals(
    normalizedItems,
    proposal.tax_amount ?? 0,
  );

  return {
    proposal: {
      ...proposal,
      subtotal: totals.subtotal,
      discount_amount: totals.discountAmount,
      tax_amount: totals.taxAmount,
      total: totals.total,
    },
    items: totals.items,
  };
};

const getDefaultProposalNumber = (deal: Deal) => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  return `PROP-${today}-${deal.id}`;
};

const ProposalDealDefaults = ({ deal }: { deal?: Deal }) => {
  const { getValues, setValue } = useFormContext<ProposalFormData>();

  useEffect(() => {
    if (!deal) return;

    const setValueIfEmpty = <Field extends keyof ProposalFormData>(
      field: Field,
      value: ProposalFormData[Field] | null | undefined,
    ) => {
      if (value === null || value === undefined || value === "") return;

      const currentValue = getValues(field);
      if (
        currentValue === null ||
        currentValue === undefined ||
        currentValue === ""
      ) {
        setValue(field as any, value as any, { shouldDirty: false });
      }
    };

    setValue("deal_id", deal.id, { shouldDirty: false });
    setValueIfEmpty("company_id", deal.company_id);
    setValueIfEmpty("contact_id", deal.contact_ids?.[0] ?? null);
    setValueIfEmpty("title", `Proposta - ${deal.name}`);
    setValueIfEmpty("number", getDefaultProposalNumber(deal));

    if (deal.sales_id !== null && deal.sales_id !== undefined) {
      setValue("sales_id", deal.sales_id, { shouldDirty: false });
    }
  }, [deal, getValues, setValue]);

  return null;
};

export const ProposalCreate = () => {
  const { identity } = useGetIdentity();
  const { currency } = useConfigurationContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const location = useLocation();
  const dealId = useMemo(
    () => new URLSearchParams(location.search).get("deal_id"),
    [location.search],
  );
  const { data: deal } = useGetOne<Deal>(
    "deals",
    { id: dealId ?? "" },
    { enabled: Boolean(dealId) },
  );
  const defaultValues = useMemo(
    () => ({
      deal_id: dealId ?? undefined,
      sales_id: identity?.id,
      status: "draft",
      currency,
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      total: 0,
      items: [
        {
          description: "",
          quantity: 1,
          unit_price: 0,
          discount_amount: 0,
        },
      ],
    }),
    [currency, dealId, identity?.id],
  );

  const handleSubmit: SubmitHandler<ProposalFormData> = async (data) => {
    try {
      const { proposal, items } = getProposalPayload(data);
      const { data: savedProposal } = await dataProvider.create<Proposal>(
        "proposals",
        {
          data: proposal,
        },
      );

      await Promise.all(
        items.map(({ id: _id, ...item }, index) =>
          dataProvider.create("proposal_items", {
            data: {
              ...item,
              proposal_id: savedProposal.id,
              index,
            },
          }),
        ),
      );

      notify("ra.notification.created", {
        type: "info",
        messageArgs: { smart_count: 1 },
      });
      redirect("show", "proposals", savedProposal.id);
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "resources.proposals.create.error",
        { type: "error" },
      );
    }
  };

  return (
    <Create redirect="show">
      <Card>
        <CardContent>
          <Form
            defaultValues={defaultValues}
            onSubmit={handleSubmit as SubmitHandler<any>}
          >
            <ProposalDealDefaults deal={deal} />
            <ProposalInputs />
            <FormToolbar />
          </Form>
        </CardContent>
      </Card>
    </Create>
  );
};
