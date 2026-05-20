import { useGetList } from "ra-core";

import type { Contact, ContactNote } from "../types";
import { AdvancedSellerRanking } from "./AdvancedSellerRanking";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { DashboardStepper } from "./DashboardStepper";
import { DealRiskSummary } from "./DealRiskSummary";
import { DealsChart } from "./DealsChart";
import { FunnelConversionSummary } from "./FunnelConversionSummary";
import { GoalProgressSummary } from "./GoalProgressSummary";
import { HotContacts } from "./HotContacts";
import { LeadFunnelSummary } from "./LeadFunnelSummary";
import { LossReasonSummary } from "./LossReasonSummary";
import { PipelineAgingSummary } from "./PipelineAgingSummary";
import { ProposalSummary } from "./ProposalSummary";
import { RevenueForecastSummary } from "./RevenueForecastSummary";
import { SalesManagerSummary } from "./SalesManagerSummary";
import { SellerDailyCockpit } from "./SellerDailyCockpit";
import { TasksList } from "./TasksList";
import { Welcome } from "./Welcome";

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

  const { total: totalDeal, isPending: isPendingDeal } = useGetList<Contact>(
    "deals",
    {
      pagination: { page: 1, perPage: 1 },
    },
  );

  const isPending = isPendingContact || isPendingContactNotes || isPendingDeal;

  if (isPending) {
    return null;
  }

  if (!totalContact) {
    return <DashboardStepper step={1} />;
  }

  if (!totalContactNotes) {
    return <DashboardStepper step={2} contactId={dataContact?.[0]?.id} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-1">
      <div className="md:col-span-3">
        <div className="flex flex-col gap-4">
          {import.meta.env.VITE_IS_DEMO === "true" ? <Welcome /> : null}
          <HotContacts />
        </div>
      </div>
      <div className="md:col-span-6">
        <div className="flex flex-col gap-6">
          <SalesManagerSummary />
          <LeadFunnelSummary />
          <ProposalSummary />
          <DealRiskSummary />
          <RevenueForecastSummary />
          <GoalProgressSummary />
          <FunnelConversionSummary />
          <PipelineAgingSummary />
          <AdvancedSellerRanking />
          <LossReasonSummary />
          {totalDeal ? <DealsChart /> : null}
          <DashboardActivityLog />
        </div>
      </div>

      <div className="md:col-span-3">
        <div className="flex flex-col gap-6">
          <SellerDailyCockpit />
          <TasksList />
        </div>
      </div>
    </div>
  );
};
