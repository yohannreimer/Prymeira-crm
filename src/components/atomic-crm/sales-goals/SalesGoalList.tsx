import { useGetList, useListContext, useTranslate } from "ra-core";
import { Link } from "react-router";
import { CreateButton } from "@/components/admin/create-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { TopToolbar } from "../layout/TopToolbar";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Sale, SalesGoal } from "../types";

const periodFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const SalesGoalList = () => (
  <List
    title={false}
    perPage={25}
    sort={{ field: "period_start", order: "DESC" }}
    actions={<SalesGoalListActions />}
    pagination={<ListPagination rowsPerPageOptions={[10, 25, 50]} />}
  >
    <SalesGoalListContent />
  </List>
);

const SalesGoalListActions = () => (
  <TopToolbar>
    <CreateButton label="resources.sales_goals.action.new" />
  </TopToolbar>
);

const SalesGoalListContent = () => {
  const translate = useTranslate();
  const { data: goals, isPending } = useListContext<SalesGoal>();
  const { data: sales = [] } = useGetList<Sale>("sales", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "first_name", order: "ASC" },
  });
  const salesById = new Map(sales.map((sale) => [String(sale.id), sale]));

  if (isPending) return <Skeleton className="h-12 w-full" />;

  const records = goals ?? [];

  if (records.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold">
          {translate("resources.sales_goals.empty.title", {
            _: "Nenhuma meta cadastrada",
          })}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {translate("resources.sales_goals.empty.description", {
            _: "Crie metas mensais para acompanhar o desempenho comercial.",
          })}
        </p>
      </Card>
    );
  }

  return (
    <Card className="py-0">
      <div className="divide-y">
        {records.map((goal) => (
          <SalesGoalRow
            key={goal.id}
            goal={goal}
            sale={salesById.get(String(goal.sales_id))}
          />
        ))}
      </div>
    </Card>
  );
};

const SalesGoalRow = ({ goal, sale }: { goal: SalesGoal; sale?: Sale }) => {
  const translate = useTranslate();
  const { currency } = useConfigurationContext();
  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  const sellerName = sale
    ? `${sale.first_name} ${sale.last_name}`
    : translate("resources.sales_goals.unknown_seller", {
        _: `#${goal.sales_id}`,
      });

  return (
    <Link
      to={`/sales_goals/${goal.id}`}
      className="grid gap-3 p-4 transition-colors hover:bg-muted md:grid-cols-[minmax(10rem,1fr)_repeat(3,minmax(8rem,auto))] md:items-center"
    >
      <div className="min-w-0">
        <div className="truncate font-medium">
          {formatPeriod(goal.period_start)}
        </div>
        <div className="truncate text-sm text-muted-foreground">
          {sellerName}
        </div>
      </div>
      <GoalMetric
        label={translate("resources.sales_goals.fields.revenue_goal")}
        value={currencyFormatter.format(goal.revenue_goal / 100)}
      />
      <GoalMetric
        label={translate("resources.sales_goals.fields.won_deals_goal")}
        value={goal.won_deals_goal.toLocaleString("pt-BR")}
      />
      <GoalMetric
        label={translate("resources.sales_goals.fields.sent_proposals_goal")}
        value={goal.sent_proposals_goal.toLocaleString("pt-BR")}
      />
    </Link>
  );
};

const GoalMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0 md:text-right">
    <div className="font-medium">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

const formatPeriod = (periodStart: string) =>
  periodFormatter.format(new Date(`${periodStart}T00:00:00Z`));
