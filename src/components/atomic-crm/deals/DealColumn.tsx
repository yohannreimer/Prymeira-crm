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
    <div className="flex-1 pb-8">
      <div className="flex flex-col items-center">
        <h3 className="text-base font-medium">
          {findDealLabel(dealStages, stage)}
        </h3>
        <p className="text-sm text-muted-foreground">
          {formatAmount(totalAmount)} / {formatAmount(weightedAmount)}{" "}
          {translate("resources.deals.weighted_short")}
        </p>
      </div>
      <Droppable droppableId={stage}>
        {(droppableProvided, snapshot) => (
          <div
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
            className={`flex flex-col rounded-2xl mt-2 gap-2 ${
              snapshot.isDraggingOver ? "bg-muted" : ""
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
