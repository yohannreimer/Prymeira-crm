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

import type { ProposalTemplate, ProposalTemplateItem } from "../types";
import { ProposalTemplateInputs } from "./ProposalTemplateInputs";

type TemplateFormData = Partial<ProposalTemplate> & {
  items?: Partial<ProposalTemplateItem>[];
};

export const ProposalTemplateEdit = () => (
  <Edit redirect="list">
    <ProposalTemplateEditForm />
  </Edit>
);

const ProposalTemplateEditForm = () => {
  const record = useRecordContext<ProposalTemplate>();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const { data: items = [], isPending: itemsPending } =
    useGetList<ProposalTemplateItem>(
      "proposal_template_items",
      {
        filter: { template_id: record?.id },
        sort: { field: "index", order: "ASC" },
        pagination: { page: 1, perPage: 100 },
      },
      {
        enabled: Boolean(record?.id),
      },
    );

  if (!record || itemsPending) return null;

  const handleSubmit: SubmitHandler<TemplateFormData> = async (data) => {
    try {
      const { items: submittedItems = [], id: _id, ...template } = data;
      const normalizedItems = submittedItems
        .filter((item) => item.description)
        .map((item, index) => ({
          id: item.id,
          template_id: record.id,
          description: item.description ?? "",
          quantity: item.quantity ?? 1,
          unit_price: item.unit_price ?? 0,
          discount_amount: item.discount_amount ?? 0,
          index,
        }));
      const existingItemIds = new Set(items.map((item) => item.id));
      const submittedItemIds = new Set(
        normalizedItems
          .map((item) => item.id)
          .filter(
            (id): id is Identifier =>
              id !== undefined && existingItemIds.has(id),
          ),
      );

      await dataProvider.update<ProposalTemplate>("proposal_templates", {
        id: record.id,
        data: template,
        previousData: record,
      });

      await Promise.all(
        normalizedItems.map((item) => {
          const { id, ...itemPayload } = item;

          if (id !== undefined && existingItemIds.has(id)) {
            return dataProvider.update("proposal_template_items", {
              id,
              data: itemPayload,
              previousData:
                items.find((existingItem) => existingItem.id === id) ?? item,
            });
          }

          return dataProvider.create("proposal_template_items", {
            data: itemPayload,
          });
        }),
      );

      await Promise.all(
        items
          .filter((item) => !submittedItemIds.has(item.id))
          .map((item) =>
            dataProvider.delete("proposal_template_items", {
              id: item.id,
              previousData: item,
            }),
          ),
      );

      notify("ra.notification.updated", {
        type: "info",
        messageArgs: { smart_count: 1 },
      });
      redirect("list", "proposal_templates");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "resources.proposal_templates.edit.error",
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
          <ProposalTemplateInputs />
        </SimpleForm>
      </CardContent>
    </Card>
  );
};
