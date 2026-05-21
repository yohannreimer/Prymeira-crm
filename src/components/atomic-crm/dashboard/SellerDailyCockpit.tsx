import { endOfToday } from "date-fns/endOfToday";
import { useGetIdentity, useGetList, useTranslate } from "ra-core";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import type { Deal, Lead, Task } from "../types";
import { useConfigurationContext } from "../root/ConfigurationContext";

const CLOSED_STAGES = new Set(["won", "lost"]);
const STALE_AFTER_DAYS = 3;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toInFilter = (values: string[]) => `(${values.join(",")})`;

const CountBadge = ({ count }: { count: number }) => (
  <Badge variant={count > 0 ? "default" : "secondary"}>{count}</Badge>
);

export const SellerDailyCockpit = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  const { dealStages } = useConfigurationContext();
  const hasNumericIdentity = Number.isInteger(identity?.id);
  const endOfTodayIso = endOfToday().toISOString();
  const staleCutoffIso = new Date(
    Date.now() - STALE_AFTER_DAYS * MS_PER_DAY,
  ).toISOString();
  const openStagesFilter = toInFilter(
    dealStages
      .map((stage) => stage.value)
      .filter((stage) => !CLOSED_STAGES.has(stage)),
  );

  const { total: dueTodayTasksCount } = useGetList<Task>(
    "tasks",
    {
      pagination: { page: 1, perPage: 1 },
      sort: { field: "due_date", order: "ASC" },
      filter: {
        "done_date@is": null,
        "due_date@lte": endOfTodayIso,
        sales_id: identity?.id,
      },
    },
    { enabled: hasNumericIdentity },
  );

  const { total: missingNextActionDealsCount } = useGetList<Deal>(
    "deals",
    {
      pagination: { page: 1, perPage: 1 },
      sort: { field: "expected_closing_date", order: "ASC" },
      filter: {
        "archived_at@is": null,
        "next_action_at@is": null,
        "stage@in": openStagesFilter,
        sales_id: identity?.id,
      },
    },
    { enabled: hasNumericIdentity },
  );

  const { total: pendingLeadsCount } = useGetList<Lead>(
    "leads",
    {
      pagination: { page: 1, perPage: 1 },
      sort: { field: "updated_at", order: "DESC" },
      filter: {
        "status@in": "(new,contacted,qualified)",
        sales_id: identity?.id,
      },
    },
    { enabled: hasNumericIdentity },
  );

  const { total: hotLeadsCount } = useGetList<Lead>(
    "leads",
    {
      pagination: { page: 1, perPage: 1 },
      sort: { field: "updated_at", order: "DESC" },
      filter: {
        temperature: "hot",
        "status@in": "(new,contacted,qualified)",
        sales_id: identity?.id,
      },
    },
    { enabled: hasNumericIdentity },
  );

  const { total: missingNextActionLeadsCount } = useGetList<Lead>(
    "leads",
    {
      pagination: { page: 1, perPage: 1 },
      sort: { field: "updated_at", order: "DESC" },
      filter: {
        "next_action_at@is": null,
        "status@in": "(new,contacted,qualified)",
        sales_id: identity?.id,
      },
    },
    { enabled: hasNumericIdentity },
  );

  const { total: staleDealsCount } = useGetList<Deal>(
    "deals",
    {
      pagination: { page: 1, perPage: 1 },
      sort: { field: "expected_closing_date", order: "ASC" },
      filter: {
        "archived_at@is": null,
        "last_activity_at@lte": staleCutoffIso,
        "next_action_at@not.is": null,
        "stage@in": openStagesFilter,
        sales_id: identity?.id,
      },
    },
    { enabled: hasNumericIdentity },
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">

        {translate("crm.dashboard.seller_cockpit.title")}

      </p>
      <Card className="p-2">
        <Link
          to="/agenda"
          className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
        >
          <span>{translate("crm.dashboard.seller_cockpit.due_today")}</span>
          <CountBadge count={dueTodayTasksCount ?? 0} />
        </Link>
        <Link
          to="/leads"
          className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
        >
          <span>{translate("crm.dashboard.seller_cockpit.pending_leads")}</span>
          <CountBadge count={pendingLeadsCount ?? 0} />
        </Link>
        <Link
          to="/leads"
          className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
        >
          <span>{translate("crm.dashboard.seller_cockpit.hot_leads")}</span>
          <CountBadge count={hotLeadsCount ?? 0} />
        </Link>
        <Link
          to="/agenda"
          className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
        >
          <span>
            {translate("crm.dashboard.seller_cockpit.leads_no_next_action")}
          </span>
          <CountBadge count={missingNextActionLeadsCount ?? 0} />
        </Link>
        <Link
          to="/agenda"
          className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
        >
          <span>
            {translate("crm.dashboard.seller_cockpit.no_next_action")}
          </span>
          <CountBadge count={missingNextActionDealsCount ?? 0} />
        </Link>
        <Link
          to="/deals"
          className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
        >
          <span>{translate("crm.dashboard.seller_cockpit.stale_deals")}</span>
          <CountBadge count={staleDealsCount ?? 0} />
        </Link>
      </Card>
    </div>
  );
};
