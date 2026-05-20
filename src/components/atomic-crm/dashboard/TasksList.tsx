import { CheckSquare } from "lucide-react";
import { useTranslate } from "ra-core";
import { Card } from "@/components/ui/card";

import { AddTask } from "../tasks/AddTask";
import { TasksListContent } from "../tasks/TasksListContent";

export const TasksList = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          {translate("crm.dashboard.upcoming_tasks", {
            _: "Upcoming Tasks",
          })}
        </p>
        <AddTask display="icon" selectContact />
      </div>
      <Card className="p-4 mb-2">
        <TasksListContent />
      </Card>
    </div>
  );
};
