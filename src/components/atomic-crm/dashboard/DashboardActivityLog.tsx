import { useTranslate } from "ra-core";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

import { ActivityLog } from "../activity/ActivityLog";
import { useDashboardScope } from "./useDashboardScope";

export function DashboardActivityLog() {
  const isMobile = useIsMobile();
  const translate = useTranslate();
  const scope = useDashboardScope();
  const filter = {
    ...scope.salesFilter,
    ...scope.buildPeriodFilter("date"),
  };

  return (
    <div className="flex flex-col">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-2">
        {translate("crm.dashboard.latest_activity", {
          _: "Latest Activity",
        })}
      </p>
      {isMobile ? (
        <ActivityLog pageSize={10} filter={filter} />
      ) : (
        <Card className="mb-2 p-6">
          <ActivityLog pageSize={10} filter={filter} />
        </Card>
      )}
    </div>
  );
}
