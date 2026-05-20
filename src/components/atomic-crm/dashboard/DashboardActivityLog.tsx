import { Clock } from "lucide-react";
import { useTranslate } from "ra-core";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

import { ActivityLog } from "../activity/ActivityLog";

export function DashboardActivityLog() {
  const isMobile = useIsMobile();
  const translate = useTranslate();
  return (
    <div className="flex flex-col">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-2">
        {translate("crm.dashboard.latest_activity", {
          _: "Latest Activity",
        })}
      </p>
      {isMobile ? (
        <ActivityLog pageSize={10} />
      ) : (
        <Card className="mb-2 p-6">
          <ActivityLog pageSize={10} />
        </Card>
      )}
    </div>
  );
}
