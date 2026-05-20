import { useRecordContext } from "ra-core";
import { Edit } from "@/components/admin/edit";
import { SimpleForm } from "@/components/admin/simple-form";
import { Card, CardContent } from "@/components/ui/card";

import type { SalesGoal } from "../types";
import { SalesGoalInputs } from "./SalesGoalInputs";
import {
  normalizeSalesGoalRecordForForm,
  transformSalesGoalFormValues,
} from "./salesGoalFormUtils";

export const SalesGoalEdit = () => (
  <Edit redirect="list" transform={transformSalesGoalFormValues}>
    <SalesGoalEditForm />
  </Edit>
);

const SalesGoalEditForm = () => {
  const record = useRecordContext<SalesGoal>();

  if (!record) return null;

  return (
    <Card>
      <CardContent>
        <SimpleForm
          className="max-w-none"
          record={normalizeSalesGoalRecordForForm(record)}
        >
          <SalesGoalInputs />
        </SimpleForm>
      </CardContent>
    </Card>
  );
};
