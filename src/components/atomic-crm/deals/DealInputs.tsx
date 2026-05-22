import { useEffect } from "react";
import { required, useTranslate } from "ra-core";
import { AutocompleteArrayInput } from "@/components/admin/autocomplete-array-input";
import { ReferenceArrayInput } from "@/components/admin/reference-array-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { DateInput } from "@/components/admin/date-input";
import { DateTimeInput } from "@/components/admin/date-time-input";
import { SelectInput } from "@/components/admin/select-input";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFormContext, useWatch } from "react-hook-form";

import { contactOptionText } from "../misc/ContactOption";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { AutocompleteCompanyInput } from "../companies/AutocompleteCompanyInput.tsx";

type StageChoice = { value: string; label: string };

export const DealInputs = ({
  stageChoices,
}: {
  stageChoices?: StageChoice[];
}) => {
  const isMobile = useIsMobile();
  return (
    <div className="flex flex-col gap-8">
      <DealInfoInputs />

      <div className={`flex gap-6 ${isMobile ? "flex-col" : "flex-row"}`}>
        <DealLinkedToInputs />
        <Separator orientation={isMobile ? "horizontal" : "vertical"} />
        <DealMiscInputs stageChoices={stageChoices} />
      </div>
    </div>
  );
};

const DealInfoInputs = () => {
  return (
    <div className="flex flex-col gap-4 flex-1">
      <TextInput source="name" validate={required()} helperText={false} />
      <TextInput source="description" multiline rows={3} helperText={false} />
    </div>
  );
};

const DealLinkedToInputs = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4 flex-1">
      <h3 className="text-base font-medium">
        {translate("resources.deals.inputs.linked_to")}
      </h3>
      <ReferenceInput source="company_id" reference="companies">
        <AutocompleteCompanyInput
          label="resources.deals.fields.company_id"
          validate={required()}
          modal
        />
      </ReferenceInput>

      <ReferenceArrayInput source="contact_ids" reference="contacts_summary">
        <AutocompleteArrayInput
          label="resources.deals.fields.contact_ids"
          optionText={contactOptionText}
          helperText={false}
        />
      </ReferenceArrayInput>
    </div>
  );
};

const DealMiscInputs = ({
  stageChoices,
}: {
  stageChoices?: StageChoice[];
}) => {
  const { dealStages, dealCategories, dealTypes, dealLostReasons } =
    useConfigurationContext();
  const translate = useTranslate();
  const { control, setValue } = useFormContext();
  const stage = useWatch({ control, name: "stage" });
  const lostReason = useWatch({ control, name: "lost_reason" });
  const activeStageChoices = stageChoices?.length ? stageChoices : dealStages;

  useEffect(() => {
    if (stage !== "lost" && lostReason != null) {
      setValue("lost_reason", null, { shouldDirty: true });
    }
  }, [lostReason, setValue, stage]);

  useEffect(() => {
    const firstStage = activeStageChoices[0]?.value;
    if (
      firstStage &&
      stage &&
      !activeStageChoices.some((choice) => choice.value === stage)
    ) {
      setValue("stage", firstStage, { shouldDirty: true });
    }
  }, [activeStageChoices, setValue, stage]);

  return (
    <div className="flex flex-col gap-4 flex-1">
      <h3 className="text-base font-medium">
        {translate("resources.deals.field_categories.misc")}
      </h3>

      <SelectInput
        source="category"
        choices={dealCategories}
        optionText="label"
        optionValue="value"
        helperText={false}
      />
      <SelectInput
        source="deal_type"
        choices={dealTypes}
        optionText="label"
        optionValue="value"
        defaultValue="consultative"
        helperText={false}
        validate={required()}
      />
      <NumberInput
        source="amount"
        defaultValue={0}
        helperText={false}
        validate={required()}
      />
      <NumberInput
        source="probability"
        defaultValue={25}
        helperText={false}
        min={0}
        max={100}
      />
      <DateInput
        validate={required()}
        source="expected_closing_date"
        helperText={false}
        defaultValue={new Date().toISOString().split("T")[0]}
      />
      <DateTimeInput
        source="next_action_at"
        helperText={false}
        defaultValue=""
      />
      <TextInput source="source" helperText={false} />
      <SelectInput
        source="stage"
        choices={activeStageChoices}
        optionText="label"
        optionValue="value"
        defaultValue={activeStageChoices[0]?.value ?? "opportunity"}
        helperText={false}
        validate={required()}
      />
      {stage === "lost" && (
        <SelectInput
          source="lost_reason"
          choices={dealLostReasons}
          optionText="label"
          optionValue="value"
          helperText={false}
        />
      )}
    </div>
  );
};
