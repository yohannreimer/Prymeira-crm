import { Link } from "react-router";
import { Pencil } from "lucide-react";
import { useListContext, useTranslate, useUpdate } from "ra-core";
import { List } from "@/components/admin/list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import type { AutomationRule } from "../types";
import { describeAutomationRule } from "./automationRuleUtils";

export const AutomationList = () => (
  <List title={false} sort={{ field: "id", order: "ASC" }} pagination={false}>
    <AutomationRows />
  </List>
);

const AutomationRows = () => {
  const { data = [], isPending } = useListContext<AutomationRule>();
  const translate = useTranslate();
  const [update] = useUpdate();

  if (isPending) return null;

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-4 text-2xl font-semibold">
        {translate("resources.automation_rules.name", {
          smart_count: 2,
          _: "Automações",
        })}
      </h1>
      <Card className="py-0">
        <div className="divide-y">
          {data.map((rule) => {
            const description = describeAutomationRule(rule.rule_key);

            return (
              <div
                key={rule.id}
                className="grid gap-3 p-4 md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <Switch
                  checked={rule.enabled}
                  aria-label={
                    rule.enabled ? "Desativar automação" : "Ativar automação"
                  }
                  onCheckedChange={(enabled) =>
                    update("automation_rules", {
                      id: rule.id,
                      data: { enabled, updated_at: new Date().toISOString() },
                      previousData: rule,
                    })
                  }
                />
                <Link
                  to={`/automation_rules/${rule.id}`}
                  className="min-w-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="font-medium">{rule.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {description.trigger} · {description.condition} ·{" "}
                    {description.action}
                  </div>
                </Link>
                <Button asChild variant="ghost" size="sm">
                  <Link to={`/automation_rules/${rule.id}`}>
                    <Pencil />
                    Editar
                  </Link>
                </Button>
              </div>
            );
          })}
          {data.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">
              Nenhuma automação configurada.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
