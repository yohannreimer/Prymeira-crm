import { BooleanInput } from "@/components/admin/boolean-input";
import { NumberInput } from "@/components/admin/number-input";
import { SelectInput } from "@/components/admin/select-input";
import { TextInput } from "@/components/admin/text-input";
import { useRecordContext } from "ra-core";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { AutomationRule } from "../types";
import { acceptedActionChoices } from "./automationRuleChoices";

export const AutomationRuleForm = () => {
  const record = useRecordContext<AutomationRule>();
  const { taskTypes } = useConfigurationContext();
  const isAcceptedRule = record?.rule_key === "proposal.accepted-action";

  return (
    <div className="grid gap-4">
      <BooleanInput source="enabled" label="Ativa" helperText={false} />
      <TextInput source="name" label="Nome" readOnly helperText={false} />
      <TextInput
        source="description"
        label="Descrição"
        readOnly
        multiline
        helperText={false}
      />
      {isAcceptedRule ? (
        <SelectInput
          source="params.acceptedAction"
          label="Ação ao aceitar"
          choices={acceptedActionChoices}
          optionText="name"
          optionValue="id"
          helperText={false}
        />
      ) : (
        <>
          <NumberInput
            source="params.dueInDays"
            label="Prazo em dias"
            min={0}
            step={1}
            helperText={false}
          />
          <SelectInput
            source="params.taskType"
            label="Tipo da tarefa"
            choices={taskTypes}
            optionText="label"
            optionValue="value"
            translateChoice={false}
            helperText={false}
          />
          <TextInput
            source="params.taskText"
            label="Texto da tarefa"
            multiline
            helperText={false}
          />
        </>
      )}
    </div>
  );
};
