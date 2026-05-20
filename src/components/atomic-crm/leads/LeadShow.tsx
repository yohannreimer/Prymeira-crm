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
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Pipeline
        </p>
        <h1 className="text-[18px] font-bold text-foreground leading-tight">
          {[record.first_name, record.last_name].filter(Boolean).join(" ")}
        </h1>
      </div>
      <div className="flex-1">
        <Card>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <LeadStatusBadge lead={record} />
                <LeadTemperatureBadge lead={record} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/leads/${record.id}`}>
                    <Edit className="h-4 w-4" />
                    {translate("ra.action.edit")}
                  </Link>
                </Button>
                <LeadConvertButton />
              </div>
            </div>

            <Separator />

            <div className="grid gap-5 md:grid-cols-2">
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
                icon={<Mail className="h-3.5 w-3.5 text-primary" />}
              />
              <LeadField
                label="resources.leads.fields.phone_number"
                value={record.phone_number}
                icon={<Phone className="h-3.5 w-3.5 text-primary" />}
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
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {translate("resources.leads.fields.interest")}
                  </p>
                  <p className="mt-1 text-[13px] text-foreground whitespace-pre-wrap">
                    {record.interest}
                  </p>
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
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {translate(label)}
      </p>
      <div className="mt-1 flex items-center gap-1.5">
        {icon}
        <span className="text-[13px] text-foreground">{value || "—"}</span>
      </div>
    </div>
  );
};
