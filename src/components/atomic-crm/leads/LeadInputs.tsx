import { useEffect } from "react";
import { required, useTranslate } from "ra-core";
import { useFormContext, useWatch } from "react-hook-form";
import { DateTimeInput } from "@/components/admin/date-time-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SelectInput } from "@/components/admin/select-input";
import { TextInput } from "@/components/admin/text-input";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

import type { Sale } from "../types";
import { leadStatuses, leadTemperatures } from "./leadChoices";

export const LeadInputs = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-8">
      <LeadIdentityInputs />
      <div className={`flex gap-6 ${isMobile ? "flex-col" : "flex-row"}`}>
        <LeadQualificationInputs />
        <Separator orientation={isMobile ? "horizontal" : "vertical"} />
        <LeadFollowUpInputs />
      </div>
    </div>
  );
};

const LeadIdentityInputs = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextInput source="first_name" validate={required()} helperText={false} />
      <TextInput source="last_name" helperText={false} />
      <TextInput source="email" helperText={false} />
      <TextInput source="phone_number" helperText={false} />
      <TextInput source="company_name" helperText={false} />
      <TextInput source="source" helperText={false} />
    </div>
  );
};

const LeadQualificationInputs = () => {
  const translate = useTranslate();
  const translatedTemperatures = leadTemperatures.map((choice) => ({
    ...choice,
    label: translate(choice.label),
  }));

  return (
    <div className="flex flex-col gap-4 flex-1">
      <h3 className="text-base font-medium">
        {translate("resources.leads.field_categories.qualification")}
      </h3>
      <TextInput source="interest" multiline rows={4} helperText={false} />
      <SelectInput
        source="temperature"
        choices={translatedTemperatures}
        optionText="label"
        optionValue="value"
        defaultValue="warm"
        helperText={false}
      />
    </div>
  );
};

const LeadFollowUpInputs = () => {
  const translate = useTranslate();
  const { control, setValue } = useFormContext();
  const status = useWatch({ control, name: "status" });
  const translatedStatuses = leadStatuses.map((choice) => ({
    ...choice,
    label: translate(choice.label),
  }));

  useEffect(() => {
    if (status !== "discarded") {
      setValue("discard_reason", null);
    }
  }, [setValue, status]);

  return (
    <div className="flex flex-col gap-4 flex-1">
      <h3 className="text-base font-medium">
        {translate("resources.leads.field_categories.follow_up")}
      </h3>
      <SelectInput
        source="status"
        choices={translatedStatuses}
        optionText="label"
        optionValue="value"
        defaultValue="new"
        helperText={false}
      />
      <DateTimeInput source="next_action_at" helperText={false} />
      {status === "discarded" && (
        <TextInput source="discard_reason" multiline helperText={false} />
      )}
      <ReferenceInput
        source="sales_id"
        reference="sales"
        filter={{ "disabled@neq": true }}
      >
        <SelectInput helperText={false} optionText={saleOptionRenderer} />
      </ReferenceInput>
    </div>
  );
};

const saleOptionRenderer = (choice: Sale) =>
  `${choice.first_name} ${choice.last_name}`;
