import {
  useDataProvider,
  useGetList,
  useNotify,
  useRecordContext,
  useRedirect,
} from "ra-core";
import type { Identifier } from "ra-core";
import type { SubmitHandler } from "react-hook-form";
import { Edit } from "@/components/admin/edit";
import { SimpleForm } from "@/components/admin/simple-form";
import { Card, CardContent } from "@/components/ui/card";

import type { Proposal, ProposalItem } from "../types";
import { ProposalInputs } from "./ProposalInputs";
import { calculateProposalTotals } from "./proposalUtils";

type ProposalFormData = Omit<Partial<Proposal>, "items"> & {
  items?: Partial<ProposalItem>[];
};

const getProposalPayload = (data: ProposalFormData, record: Proposal) => {
  const { items = [], id: _id, ...proposal } = data;
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
    proposal.tax_amount ?? record.tax_amount ?? 0,
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

export const ProposalEdit = () => (
  <Edit redirect="show">
    <ProposalEditForm />
  </Edit>
);

const ProposalEditForm = () => {
  const record = useRecordContext<Proposal>();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const { data: items = [], isPending: itemsPending } =
    useGetList<ProposalItem>(
      "proposal_items",
      {
        filter: { proposal_id: record?.id },
        sort: { field: "index", order: "ASC" },
        pagination: { page: 1, perPage: 100 },
      },
      {
        enabled: Boolean(record?.id),
      },
    );

  if (!record || itemsPending) return null;

  const handleSubmit: SubmitHandler<ProposalFormData> = async (data) => {
    try {
      const { proposal, items: submittedItems } = getProposalPayload(
        data,
        record,
      );
      const submittedItemIds = new Set(
        submittedItems
          .map((item) => item.id)
          .filter((id): id is Identifier => typeof id !== "string"),
      );

      const { data: savedProposal } = await dataProvider.update<Proposal>(
        "proposals",
        {
          id: record.id,
          data: proposal,
          previousData: record,
        },
      );

      await Promise.all(
        submittedItems.map((item, index) => {
          const { id, ...itemPayload } = item;
          if (typeof id !== "string") {
            return dataProvider.update("proposal_items", {
              id,
              data: {
                ...itemPayload,
                proposal_id: record.id,
                index,
              },
              previousData:
                items.find((existingItem) => existingItem.id === id) ?? item,
            });
          }

          return dataProvider.create("proposal_items", {
            data: {
              ...itemPayload,
              proposal_id: record.id,
              index,
            },
          });
        }),
      );

      await Promise.all(
        items
          .filter((item) => !submittedItemIds.has(item.id))
          .map((item) =>
            dataProvider.delete("proposal_items", {
              id: item.id,
              previousData: item,
            }),
          ),
      );

      notify("ra.notification.updated", {
        type: "info",
        messageArgs: { smart_count: 1 },
      });
      redirect("show", "proposals", savedProposal.id);
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "resources.proposals.edit.error",
        { type: "error" },
      );
    }
  };

  return (
    <Card>
      <CardContent>
        <SimpleForm
          className="max-w-none"
          record={{ ...record, items }}
          onSubmit={handleSubmit as SubmitHandler<any>}
        >
          <ProposalInputs />
        </SimpleForm>
      </CardContent>
    </Card>
  );
};
