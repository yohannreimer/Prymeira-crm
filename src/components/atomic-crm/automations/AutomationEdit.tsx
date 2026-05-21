import { Edit } from "@/components/admin/edit";
import { SimpleForm } from "@/components/admin/simple-form";
import { Card, CardContent } from "@/components/ui/card";

import type { AutomationRule } from "../types";
import { AutomationRuleForm } from "./AutomationRuleForm";
import { AutomationRunsPanel } from "./AutomationRunsPanel";
import { normalizeAutomationParams } from "./automationRuleUtils";

const transformAutomationRule = (data: Partial<AutomationRule>) => ({
  ...data,
  params: normalizeAutomationParams(data.rule_key ?? "", data.params ?? {}),
  updated_at: new Date().toISOString(),
});

export const AutomationEdit = () => (
  <Edit
    redirect="list"
    actions={false}
    transform={transformAutomationRule}
    title="Editar automação"
  >
    <div className="grid gap-6 p-4 md:grid-cols-[minmax(0,1fr)_24rem] md:p-6">
      <Card>
        <CardContent>
          <SimpleForm className="max-w-none">
            <AutomationRuleForm />
          </SimpleForm>
        </CardContent>
      </Card>
      <AutomationRunsPanel />
    </div>
  </Edit>
);
