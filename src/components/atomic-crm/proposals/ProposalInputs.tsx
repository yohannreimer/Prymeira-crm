import { required, useGetList, useTranslate } from "ra-core";
import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { DateInput } from "@/components/admin/date-input";
import { NumberInput } from "@/components/admin/number-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SelectInput } from "@/components/admin/select-input";
import { TextInput } from "@/components/admin/text-input";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { ProposalTemplate, ProposalTemplateItem } from "../types";
import { proposalStatuses } from "./proposalChoices";
import { ProposalItemsInput } from "./ProposalItemsInput";
import { buildProposalDefaultsFromTemplate } from "./proposalUtils";

type TemplateSelectionSnapshot = {
  templateId: string;
  scope: unknown;
  terms: unknown;
  itemsSnapshot: string;
};

const snapshotProposalItems = (items: unknown) =>
  JSON.stringify(
    Array.isArray(items)
      ? items.map((item) => ({
          description: item?.description ?? "",
          quantity: item?.quantity ?? 0,
          unit_price: item?.unit_price ?? 0,
          discount_amount: item?.discount_amount ?? 0,
        }))
      : [],
  );

export const ProposalInputs = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-8">
      <ProposalIdentityInputs />
      <div className={`flex gap-6 ${isMobile ? "flex-col" : "flex-row"}`}>
        <ProposalLinkedInputs />
        <Separator orientation={isMobile ? "horizontal" : "vertical"} />
        <ProposalCommercialInputs />
      </div>
      <ProposalItemsInput />
      <ProposalTextInputs />
    </div>
  );
};

const ProposalIdentityInputs = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <TextInput source="title" validate={required()} helperText={false} />
    <TextInput source="number" validate={required()} helperText={false} />
    <ProposalTemplateInput />
  </div>
);

const ProposalTemplateInput = () => {
  const { getValues, setValue } = useFormContext();
  const selectedTemplateId = useWatch({ name: "template_id" });
  const initializedTemplateIdRef = useRef<string | null | undefined>(undefined);
  const lastObservedTemplateIdRef = useRef<string | null>(null);
  const pendingTemplateSelectionRef = useRef<TemplateSelectionSnapshot | null>(
    null,
  );
  const { data: templates = [] } = useGetList<ProposalTemplate>(
    "proposal_templates",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "name", order: "ASC" },
      filter: { active: true },
    },
  );
  const { data: templateItems = [], isPending: templateItemsPending } =
    useGetList<ProposalTemplateItem>(
      "proposal_template_items",
      {
        filter: { template_id: selectedTemplateId },
        sort: { field: "index", order: "ASC" },
        pagination: { page: 1, perPage: 100 },
      },
      { enabled: Boolean(selectedTemplateId) },
    );

  useEffect(() => {
    const currentTemplateId =
      selectedTemplateId === null || selectedTemplateId === undefined
        ? null
        : String(selectedTemplateId);

    if (initializedTemplateIdRef.current === undefined) {
      initializedTemplateIdRef.current = currentTemplateId;
      lastObservedTemplateIdRef.current = currentTemplateId;
      return;
    }

    if (lastObservedTemplateIdRef.current !== currentTemplateId) {
      lastObservedTemplateIdRef.current = currentTemplateId;
      pendingTemplateSelectionRef.current = currentTemplateId
        ? {
            templateId: currentTemplateId,
            scope: getValues("scope"),
            terms: getValues("terms"),
            itemsSnapshot: snapshotProposalItems(getValues("items")),
          }
        : null;
    }

    const pendingSelection = pendingTemplateSelectionRef.current;
    if (!currentTemplateId || !pendingSelection) {
      return;
    }

    if (templateItemsPending) return;

    const template = templates.find(
      (template) => String(template.id) === currentTemplateId,
    );

    if (!template || pendingSelection.templateId !== currentTemplateId) {
      return;
    }

    const defaults = buildProposalDefaultsFromTemplate(template, templateItems);
    const currentScope = getValues("scope");
    const currentTerms = getValues("terms");
    const currentItems = getValues("items");

    if (currentScope === pendingSelection.scope) {
      setValue("scope", defaults.scope, { shouldDirty: true });
    }
    if (currentTerms === pendingSelection.terms) {
      setValue("terms", defaults.terms, { shouldDirty: true });
    }
    if (
      defaults.items.length > 0 &&
      snapshotProposalItems(currentItems) === pendingSelection.itemsSnapshot
    ) {
      setValue("items", defaults.items, { shouldDirty: true });
    }

    pendingTemplateSelectionRef.current = null;
  }, [
    getValues,
    selectedTemplateId,
    setValue,
    templateItems,
    templateItemsPending,
    templates,
  ]);

  return (
    <ReferenceInput source="template_id" reference="proposal_templates">
      <SelectInput
        label="resources.proposals.fields.template_id"
        optionText="name"
        helperText={false}
      />
    </ReferenceInput>
  );
};

const ProposalLinkedInputs = () => {
  const translate = useTranslate();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h3 className="text-base font-medium">
        {translate("resources.proposals.field_categories.linked_to")}
      </h3>
      <ReferenceInput source="deal_id" reference="deals">
        <SelectInput
          label="resources.proposals.fields.deal_id"
          optionText="name"
          helperText={false}
          validate={required()}
        />
      </ReferenceInput>
      <ReferenceInput source="company_id" reference="companies">
        <SelectInput
          label="resources.proposals.fields.company_id"
          optionText="name"
          helperText={false}
          validate={required()}
        />
      </ReferenceInput>
    </div>
  );
};

const ProposalCommercialInputs = () => {
  const { currency } = useConfigurationContext();
  const translate = useTranslate();
  const translatedStatuses = proposalStatuses.map((choice) => ({
    ...choice,
    label: translate(choice.label),
  }));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h3 className="text-base font-medium">
        {translate("resources.proposals.field_categories.commercial")}
      </h3>
      <SelectInput
        source="status"
        choices={translatedStatuses}
        optionText="label"
        optionValue="value"
        defaultValue="draft"
        helperText={false}
        validate={required()}
      />
      <DateInput source="valid_until" helperText={false} />
      <TextInput
        source="currency"
        defaultValue={currency}
        validate={required()}
        helperText={false}
      />
      <NumberInput
        source="discount_amount"
        defaultValue={0}
        min={0}
        helperText={false}
      />
      <NumberInput
        source="tax_amount"
        defaultValue={0}
        min={0}
        helperText={false}
      />
      <NumberInput
        source="total"
        defaultValue={0}
        min={0}
        disabled
        helperText={false}
      />
      <TextInput source="delivery_time" helperText={false} />
      <TextInput source="payment_terms" helperText={false} />
    </div>
  );
};

const ProposalTextInputs = () => (
  <div className="grid gap-4 md:grid-cols-3">
    <TextInput source="scope" multiline rows={6} helperText={false} />
    <TextInput source="terms" multiline rows={6} helperText={false} />
    <TextInput source="internal_notes" multiline rows={4} helperText={false} />
  </div>
);
