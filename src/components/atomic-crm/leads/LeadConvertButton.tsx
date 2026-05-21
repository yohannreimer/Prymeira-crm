import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import {
  useDataProvider,
  useNotify,
  useRecordContext,
  useRedirect,
  useTranslate,
} from "ra-core";
import { Button } from "@/components/ui/button";

import type { CrmDataProvider } from "../providers/types";
import type { Lead } from "../types";

export const LeadConvertButton = () => {
  const lead = useRecordContext<Lead>();
  const dataProvider = useDataProvider<CrmDataProvider>();
  const notify = useNotify();
  const redirect = useRedirect();
  const translate = useTranslate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!lead) throw new Error("Missing lead");
      return dataProvider.convertLead({ lead });
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries();
      notify("resources.leads.convert.success");
      redirect("show", "deals", result.deal.id);
    },
    onError: () => {
      notify("resources.leads.convert.error", { type: "error" });
    },
  });

  if (!lead) return null;

  const disabled =
    mutation.isPending ||
    lead.status === "converted" ||
    lead.status === "discarded";

  return (
    <Button type="button" disabled={disabled} onClick={() => mutation.mutate()}>
      <CheckCircle2 className="h-4 w-4" />
      {mutation.isPending
        ? translate("resources.leads.convert.converting")
        : translate("resources.leads.convert.action")}
    </Button>
  );
};
