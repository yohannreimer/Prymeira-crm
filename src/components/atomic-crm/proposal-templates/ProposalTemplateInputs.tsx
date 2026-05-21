import { required } from "ra-core";
import { ArrayInput } from "@/components/admin/array-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { NumberInput } from "@/components/admin/number-input";
import { SimpleFormIterator } from "@/components/admin/simple-form-iterator";
import { TextInput } from "@/components/admin/text-input";

export const ProposalTemplateInputs = () => (
  <div className="flex flex-col gap-4">
    <TextInput
      source="name"
      label="resources.proposal_templates.fields.name"
      validate={required()}
    />
    <BooleanInput
      source="active"
      label="resources.proposal_templates.fields.active"
      defaultValue
    />
    <TextInput
      source="description"
      label="resources.proposal_templates.fields.description"
      multiline
      rows={3}
    />
    <TextInput
      source="default_scope"
      label="resources.proposal_templates.fields.default_scope"
      multiline
      rows={6}
    />
    <TextInput
      source="default_terms"
      label="resources.proposal_templates.fields.default_terms"
      multiline
      rows={6}
    />
    <ArrayInput source="items" label="resources.proposal_template_items.name">
      <SimpleFormIterator
        inline
        getItemLabel={(index) => `#${index + 1}`}
        className="[&_li>section]:grid [&_li>section]:gap-3 [&_li>section]:md:grid-cols-[minmax(14rem,1fr)_7rem_8rem_8rem]"
      >
        <TextInput
          source="description"
          label="resources.proposal_template_items.fields.description"
          validate={required()}
          helperText={false}
        />
        <NumberInput
          source="quantity"
          label="resources.proposal_template_items.fields.quantity"
          defaultValue={1}
          min={0.01}
          step={0.01}
          validate={required()}
          helperText={false}
        />
        <NumberInput
          source="unit_price"
          label="resources.proposal_template_items.fields.unit_price"
          defaultValue={0}
          min={0}
          validate={required()}
          helperText={false}
        />
        <NumberInput
          source="discount_amount"
          label="resources.proposal_template_items.fields.discount_amount"
          defaultValue={0}
          min={0}
          helperText={false}
        />
      </SimpleFormIterator>
    </ArrayInput>
  </div>
);
