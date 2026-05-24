import { useGetList, useLocaleState, useTranslate } from "ra-core";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { summarizeDeals } from "../deals/dealCommercialUtils";
import { formatCurrencyAmount } from "../misc/formatCurrency";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Contact, ContactNote, Deal } from "../types";
import { AdvancedSellerRanking } from "./AdvancedSellerRanking";
import { ConversionFunnel } from "./ConversionFunnel";
import { ExportReportsButton } from "./ExportReportsButton";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { DashboardStepper } from "./DashboardStepper";
import { DealsChart } from "./DealsChart";
import { HotContacts } from "./HotContacts";
import { LeadFunnelSummary } from "./LeadFunnelSummary";
import { ProposalSummary } from "./ProposalSummary";
import { TasksList } from "./TasksList";
import {
  DashboardScopeProvider,
  getDashboardPeriodStart,
  type DashboardPeriod,
} from "./useDashboardScope";

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "month", label: "Este mês" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Este ano" },
  { value: "all", label: "Tudo" },
];

export const Dashboard = () => {
  const {
    data: dataContact,
    total: totalContact,
    isPending: isPendingContact,
  } = useGetList<Contact>("contacts", {
    pagination: { page: 1, perPage: 1 },
  });

  const { total: totalContactNotes, isPending: isPendingContactNotes } =
    useGetList<ContactNote>("contact_notes", {
      pagination: { page: 1, perPage: 1 },
    });

  const { isPending: isPendingDeal } = useGetList<Contact>("deals", {
    pagination: { page: 1, perPage: 1 },
  });

  const isPending = isPendingContact || isPendingContactNotes || isPendingDeal;

  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (!totalContact) return <DashboardStepper step={1} />;
  if (!totalContactNotes)
    return <DashboardStepper step={2} contactId={dataContact?.[0]?.id} />;

  return <DashboardContent />;
};

const DashboardContent = () => {
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();
  const { currency } = useConfigurationContext();
  const [period, setPeriod] = useState<DashboardPeriod>("month");

  const periodStart = getDashboardPeriodStart(period);
  const periodFilter = periodStart ? { "created_at@gte": periodStart } : {};

  const { data: deals, isPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "updated_at", order: "DESC" },
    filter: { "archived_at@is": null, ...periodFilter },
  });

  const summary = useMemo(() => summarizeDeals(deals ?? []), [deals]);

  const kpis = [
    {
      label: translate("crm.dashboard.sales_summary.open_deals"),
      value: isPending ? "—" : summary.openCount.toLocaleString(locale),
    },
    {
      label: translate("crm.dashboard.sales_summary.open_amount"),
      value: isPending
        ? "—"
        : formatCurrencyAmount(summary.openAmount, currency, locale, {
            maximumFractionDigits: 0,
          }),
    },
    {
      label: translate("crm.dashboard.sales_summary.weighted_amount"),
      value: isPending
        ? "—"
        : formatCurrencyAmount(summary.weightedOpenAmount, currency, locale, {
            maximumFractionDigits: 0,
          }),
    },
    {
      label: translate("crm.dashboard.sales_summary.won_amount"),
      value: isPending
        ? "—"
        : formatCurrencyAmount(summary.wonAmount, currency, locale, {
            maximumFractionDigits: 0,
          }),
    },
  ];

  const TAB_CLASS =
    "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground px-0 pb-2 text-[13px] font-medium shadow-none";

  return (
    <DashboardScopeProvider period={period}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
              Comercial
            </p>
            <h1 className="text-[18px] font-bold text-foreground leading-tight">
              Dashboard
            </h1>
          </div>
          {/* Period selector */}
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "px-3 py-1 rounded-md text-[12px] font-medium transition-colors",
                  period === p.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="px-5 py-4 gap-1 flex flex-col">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {kpi.label}
              </p>
              <p className="text-[26px] font-bold text-foreground leading-none truncate">
                {kpi.value}
              </p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="h-9 bg-transparent border-b border-border/50 w-full justify-start rounded-none p-0 gap-6 mb-2">
            <TabsTrigger value="overview" className={TAB_CLASS}>
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="reports" className={TAB_CLASS}>
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <HotContacts />
              </div>
              <div className="md:col-span-1">
                <TasksList />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <div className="flex flex-col gap-6">
              <div className="flex justify-end">
                <ExportReportsButton />
              </div>
              <ConversionFunnel />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LeadFunnelSummary />
                <ProposalSummary />
              </div>
              <DealsChart />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdvancedSellerRanking />
                <DashboardActivityLog />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardScopeProvider>
  );
};
