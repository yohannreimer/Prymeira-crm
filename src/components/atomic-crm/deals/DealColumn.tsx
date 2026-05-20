import { Droppable } from "@hello-pangea/dnd";
import { useLocaleState, useTranslate } from "ra-core";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { getWeightedAmount } from "./dealCommercialUtils";
import { findDealLabel } from "./dealUtils";
import { DealCard } from "./DealCard";

export const DealColumn = ({
  stage,
  deals,
}: {
  stage: string;
  deals: Deal[];
}) => {
  const totalAmount = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const weightedAmount = deals.reduce(
    (sum, deal) => sum + getWeightedAmount(deal),
    0,
  );
  const { dealStages, currency } = useConfigurationContext();
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();
  const formatAmount = (amount: number) =>
    amount.toLocaleString(locale, {
      notation: "compact",
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumSignificantDigits: 3,
    });

  return (
    <div className="flex-1 min-w-[220px] pb-8">
      <div className="border-b border-border/40 pb-2 mb-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-foreground/70">
          {findDealLabel(dealStages, stage)}
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {formatAmount(totalAmount)} · {formatAmount(weightedAmount)}{" "}
          {translate("resources.deals.weighted_short")}
        </p>
      </div>
      <Droppable droppableId={stage}>
        {(droppableProvided, snapshot) => (
          <div
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
            className={`flex flex-col rounded-xl gap-2 transition-colors ${
              snapshot.isDraggingOver ? "bg-primary/5" : ""
            }`}
          >
            {deals.map((deal, index) => (
              <DealCard key={deal.id} deal={deal} index={index} />
            ))}
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
