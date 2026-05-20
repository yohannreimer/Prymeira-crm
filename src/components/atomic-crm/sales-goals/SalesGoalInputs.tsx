import { required } from "ra-core";
import { DateInput } from "@/components/admin/date-input";
import { NumberInput } from "@/components/admin/number-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SelectInput } from "@/components/admin/select-input";

import type { Sale } from "../types";

export const SalesGoalInputs = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <ReferenceInput source="sales_id" reference="sales">
      <SelectInput
        label="resources.sales_goals.fields.sales_id"
        optionText={saleOptionRenderer}
        validate={required()}
        helperText={false}
      />
    </ReferenceInput>
    <DateInput
      source="period_start"
      label="resources.sales_goals.fields.period_start"
      validate={[required(), validateFirstDayOfMonth]}
      helperText="resources.sales_goals.help.period_start"
    />
    <NumberInput
      source="revenue_goal"
      label="resources.sales_goals.fields.revenue_goal"
      min={0}
      step={0.01}
      validate={required()}
      helperText={false}
    />
    <NumberInput
      source="won_deals_goal"
      label="resources.sales_goals.fields.won_deals_goal"
      min={0}
      validate={required()}
      helperText={false}
    />
    <NumberInput
      source="sent_proposals_goal"
      label="resources.sales_goals.fields.sent_proposals_goal"
      min={0}
      validate={required()}
      helperText={false}
    />
  </div>
);

const saleOptionRenderer = (choice: Sale) =>
  `${choice.first_name} ${choice.last_name}`;

const validateFirstDayOfMonth = (value?: string) => {
  if (!value) return undefined;

  return value.endsWith("-01")
    ? undefined
    : "resources.sales_goals.validation.period_start_first_day";
};
