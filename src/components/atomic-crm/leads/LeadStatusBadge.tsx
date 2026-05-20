import { useTranslate } from "ra-core";
import { Badge } from "@/components/ui/badge";

import type { Lead } from "../types";

export const LeadStatusBadge = ({ lead }: { lead: Pick<Lead, "status"> }) => {
  const translate = useTranslate();
  const variant = lead.status === "converted" ? "default" : "secondary";

  return (
    <Badge variant={variant}>
      {translate(`resources.leads.statuses.${lead.status}`)}
    </Badge>
  );
};

export const LeadTemperatureBadge = ({
  lead,
}: {
  lead: Pick<Lead, "temperature">;
}) => {
  const translate = useTranslate();

  return (
    <Badge variant="outline">
      {translate(`resources.leads.temperatures.${lead.temperature}`)}
    </Badge>
  );
};
