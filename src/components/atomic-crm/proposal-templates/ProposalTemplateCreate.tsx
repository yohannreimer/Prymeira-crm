import { Form, useDataProvider, useNotify, useRedirect } from "ra-core";
import type { SubmitHandler } from "react-hook-form";
import { Create } from "@/components/admin/create";
import { Card, CardContent } from "@/components/ui/card";

import { FormToolbar } from "../layout/FormToolbar";
import type { ProposalTemplate, ProposalTemplateItem } from "../types";
import { ProposalTemplateInputs } from "./ProposalTemplateInputs";

type TemplateFormData = Partial<ProposalTemplate> & {
  items?: Partial<ProposalTemplateItem>[];
};

export const ProposalTemplateCreate = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();

  const handleSubmit: SubmitHandler<TemplateFormData> = async (data) => {
    try {
      const { items = [], ...template } = data;
      const { data: savedTemplate } =
        await dataProvider.create<ProposalTemplate>("proposal_templates", {
          data: template,
        });

      await Promise.all(
        items
          .filter((item) => item.description)
          .map((item, index) =>
            dataProvider.create("proposal_template_items", {
              data: {
                description: item.description ?? "",
                template_id: savedTemplate.id,
                index,
                quantity: item.quantity ?? 1,
                unit_price: item.unit_price ?? 0,
                discount_amount: item.discount_amount ?? 0,
              },
            }),
          ),
      );

      notify("ra.notification.created", {
        type: "info",
        messageArgs: { smart_count: 1 },
      });
      redirect("list", "proposal_templates");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "resources.proposal_templates.create.error",
        { type: "error" },
      );
    }
  };

  return (
    <Create redirect="list">
      <Card>
        <CardContent>
          <Form
            defaultValues={{ active: true, items: [] }}
            onSubmit={handleSubmit as SubmitHandler<any>}
          >
            <ProposalTemplateInputs />
            <FormToolbar />
          </Form>
        </CardContent>
      </Card>
    </Create>
  );
};
