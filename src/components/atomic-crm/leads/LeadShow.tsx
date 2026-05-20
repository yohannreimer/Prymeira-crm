import { Edit, Mail, Phone } from "lucide-react";
import { ShowBase, useShowContext, useTranslate } from "ra-core";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { LeadConvertButton } from "./LeadConvertButton";
import { LeadStatusBadge, LeadTemperatureBadge } from "./LeadStatusBadge";
import type { Lead } from "../types";

export const LeadShow = () => (
  <ShowBase>
    <LeadShowContent />
  </ShowBase>
);

const LeadShowContent = () => {
  const { record, isPending } = useShowContext<Lead>();
  const translate = useTranslate();

  if (isPending || !record) return null;

  return (
    <div className="mt-2 flex gap-8">
      <div className="flex-1">
        <Card>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {[record.first_name, record.last_name]
                    .filter(Boolean)
                    .join(" ")}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <LeadStatusBadge lead={record} />
                  <LeadTemperatureBadge lead={record} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link to={`/leads/${record.id}`}>
                    <Edit className="h-4 w-4" />
                    {translate("ra.action.edit")}
                  </Link>
                </Button>
                <LeadConvertButton />
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <LeadField
                label="resources.leads.fields.company_name"
                value={record.company_name}
              />
              <LeadField
                label="resources.leads.fields.source"
                value={record.source}
              />
              <LeadField
                label="resources.leads.fields.email"
                value={record.email}
                icon={<Mail className="h-4 w-4" />}
              />
              <LeadField
                label="resources.leads.fields.phone_number"
                value={record.phone_number}
                icon={<Phone className="h-4 w-4" />}
              />
              <LeadField
                label="resources.leads.fields.next_action_at"
                value={
                  record.next_action_at
                    ? new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(record.next_action_at))
                    : null
                }
              />
              <LeadField
                label="resources.leads.fields.discard_reason"
                value={record.discard_reason}
              />
            </div>

            {record.interest ? (
              <>
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground">
                    {translate("resources.leads.fields.interest")}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap">{record.interest}</p>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const LeadField = ({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: ReactNode;
}) => {
  const translate = useTranslate();

  return (
    <div>
      <div className="text-xs text-muted-foreground">{translate(label)}</div>
      <div className="mt-1 flex items-center gap-2">
        {icon}
        <span>{value || "-"}</span>
      </div>
    </div>
  );
};
