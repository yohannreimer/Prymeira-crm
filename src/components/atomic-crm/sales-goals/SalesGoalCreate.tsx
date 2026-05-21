import { Create } from "@/components/admin/create";
import { SimpleForm } from "@/components/admin/simple-form";
import { Card, CardContent } from "@/components/ui/card";

import { SalesGoalInputs } from "./SalesGoalInputs";
import { transformSalesGoalFormValues } from "./salesGoalFormUtils";

export const SalesGoalCreate = () => (
  <Create redirect="list" transform={transformSalesGoalFormValues}>
    <Card>
      <CardContent>
        <SimpleForm className="max-w-none">
          <SalesGoalInputs />
        </SimpleForm>
      </CardContent>
    </Card>
  </Create>
);
