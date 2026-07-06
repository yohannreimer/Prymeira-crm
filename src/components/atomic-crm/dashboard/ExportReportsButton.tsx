import { Download } from "lucide-react";
import { useGetList, useLocaleState } from "ra-core";
import { Button } from "@/components/ui/button";
import {
  formatCurrencyAmount,
  formatCurrencyCents,
} from "../misc/formatCurrency";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { summarizeDeals } from "../deals/dealCommercialUtils";
import { summarizeLeads } from "./commercialDashboardUtils";
import type { Deal, Lead, Proposal } from "../types";
import { useDashboardScope } from "./useDashboardScope";

const PAGE_SIZE = 1000;
const CSV_FORMULA_PREFIX = /^[=+\-@\t\r]/;

const escapeCsvCell = (value: unknown) => {
  const text = value == null ? "" : String(value);
  const safeText = CSV_FORMULA_PREFIX.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

const toCsvSection = (title: string, rows: unknown[][]) =>
  [`# ${title}`, ...rows.map((row) => row.map(escapeCsvCell).join(","))].join(
    "\n",
  );

const downloadCsvReport = (sections: string[]) => {
  const blob = new Blob([`\uFEFF${sections.join("\n\n")}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio-crm-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const ExportReportsButton = () => {
  const [locale = "pt-BR"] = useLocaleState();
  const { currency } = useConfigurationContext();
  const scope = useDashboardScope();

  const { data: leads } = useGetList<Lead>(
    "leads",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      filter: { ...scope.salesFilter, ...scope.periodFilter },
    },
    { enabled: !scope.isPending },
  );
  const { data: deals } = useGetList<Deal>(
    "deals",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      filter: {
        "archived_at@is": null,
        ...scope.salesFilter,
        ...scope.periodFilter,
      },
    },
    { enabled: !scope.isPending },
  );
  const { data: proposals } = useGetList<Proposal>(
    "proposals",
    {
      pagination: { page: 1, perPage: PAGE_SIZE },
      filter: { ...scope.salesFilter, ...scope.periodFilter },
    },
    { enabled: !scope.isPending },
  );

  const formatDealAmount = (amount: number) =>
    formatCurrencyAmount(amount, currency, locale, {
      maximumFractionDigits: 0,
    });

  const formatProposalAmount = (amount: number) =>
    formatCurrencyCents(amount, currency, locale, {
      maximumFractionDigits: 0,
    });

  const handleExport = () => {
    const leadSummary = summarizeLeads(leads ?? []);
    const dealSummary = summarizeDeals(deals ?? []);

    const kpiData = [
      ["Métrica", "Valor"],
      ["Negócios abertos", dealSummary.openCount],
      ["Valor em aberto", formatDealAmount(dealSummary.openAmount)],
      ["Valor ponderado", formatDealAmount(dealSummary.weightedOpenAmount)],
      ["Valor ganho", formatDealAmount(dealSummary.wonAmount)],
      ["Valor perdido", formatDealAmount(dealSummary.lostAmount)],
    ];

    const wonDeals = (deals ?? []).filter((d) => d.stage === "won").length;
    const funnelData = [
      ["Etapa", "Total", "Taxa de conversão"],
      ["Leads", leadSummary.total, "—"],
      [
        "Negócios",
        (deals ?? []).length,
        leadSummary.total > 0
          ? `${Math.round(((deals ?? []).length / leadSummary.total) * 100)}%`
          : "—",
      ],
      [
        "Propostas",
        (proposals ?? []).length,
        (deals ?? []).length > 0
          ? `${Math.round(((proposals ?? []).length / (deals ?? []).length) * 100)}%`
          : "—",
      ],
      [
        "Ganhos",
        wonDeals,
        (proposals ?? []).length > 0
          ? `${Math.round((wonDeals / (proposals ?? []).length) * 100)}%`
          : "—",
      ],
    ];

    const leadData = [
      ["Nome", "Empresa", "Status", "Temperatura", "Fonte"],
      ...(leads ?? []).map((l) => [
        [l.first_name, l.last_name].filter(Boolean).join(" "),
        l.company_name ?? "",
        l.status,
        l.temperature ?? "",
        l.source ?? "",
      ]),
    ];

    const dealData = [
      ["Nome", "Estágio", "Valor", "Responsável"],
      ...(deals ?? []).map((d) => [
        d.name,
        d.stage,
        formatDealAmount(d.amount),
        d.sales_id ?? "",
      ]),
    ];

    const proposalData = [
      ["Título", "Número", "Status", "Total", "Validade"],
      ...(proposals ?? []).map((p) => [
        p.title,
        p.number,
        p.status,
        formatProposalAmount(p.total),
        p.valid_until ?? "",
      ]),
    ];

    downloadCsvReport([
      toCsvSection("KPIs", kpiData),
      toCsvSection("Funil", funnelData),
      toCsvSection("Leads", leadData),
      toCsvSection("Negócios", dealData),
      toCsvSection("Propostas", proposalData),
    ]);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-1.5 text-[12px]"
    >
      <Download className="h-3.5 w-3.5" />
      Exportar CSV
    </Button>
  );
};
