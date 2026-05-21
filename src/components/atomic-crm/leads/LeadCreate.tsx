import { CreateBase, Form, useGetIdentity, useTranslate } from "ra-core";
import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/form";
import { Card, CardContent } from "@/components/ui/card";

import { LeadInputs } from "./LeadInputs";

export const LeadCreate = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();

  return (
    <CreateBase redirect="show">
      <div className="mt-2 flex lg:mr-72">
        <div className="flex-1">
          <Form
            defaultValues={{
              sales_id: identity?.id,
              status: "new",
              temperature: "warm",
            }}
          >
            <Card>
              <CardContent>
                <LeadInputs />
                <div
                  role="toolbar"
                  className="sticky flex pt-4 pb-4 md:pb-0 bottom-0 bg-linear-to-b from-transparent to-card to-10% flex-row justify-end gap-2"
                >
                  <CancelButton />
                  <SaveButton
                    label={translate("resources.leads.action.create")}
                  />
                </div>
              </CardContent>
            </Card>
          </Form>
        </div>
      </div>
    </CreateBase>
  );
};
