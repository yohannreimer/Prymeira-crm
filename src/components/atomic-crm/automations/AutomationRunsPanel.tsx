import { useGetList, useRecordContext } from "ra-core";
import { Card } from "@/components/ui/card";

import type { AutomationRule, AutomationRun } from "../types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const statusLabels: Record<AutomationRun["status"], string> = {
  success: "Sucesso",
  skipped: "Ignorada",
  failed: "Falha",
};

export const AutomationRunsPanel = () => {
  const rule = useRecordContext<AutomationRule>();
  const { data = [] } = useGetList<AutomationRun>(
    "automation_runs",
    {
      pagination: { page: 1, perPage: 10 },
      sort: { field: "created_at", order: "DESC" },
      filter: { rule_key: rule?.rule_key },
    },
    { enabled: Boolean(rule?.rule_key) },
  );

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold">Últimas execuções</h2>
      <div className="space-y-3">
        {data.map((run) => (
          <div key={run.id} className="border-b pb-3 text-sm last:border-b-0">
            <div className="font-medium">{statusLabels[run.status]}</div>
            {run.message ? (
              <div className="text-muted-foreground">{run.message}</div>
            ) : null}
            <div className="text-xs text-muted-foreground">
              {dateFormatter.format(new Date(run.created_at))}
            </div>
          </div>
        ))}
        {!data.length && (
          <div className="text-sm text-muted-foreground">
            Nenhuma execução registrada.
          </div>
        )}
      </div>
    </Card>
  );
};
