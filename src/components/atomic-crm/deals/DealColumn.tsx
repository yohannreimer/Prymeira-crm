import { Droppable } from "@hello-pangea/dnd";
import { useLocaleState, useTranslate } from "ra-core";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { getWeightedAmount } from "./dealCommercialUtils";
import { DealCard } from "./DealCard";

export const DealColumn = ({
  stage,
  deals,
  stageLabel,
  onDelete,
}: {
  stage: string;
  deals: Deal[];
  stageLabel?: string;
  onDelete?: () => void;
}) => {
  const totalAmount = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const weightedAmount = deals.reduce(
    (sum, deal) => sum + getWeightedAmount(deal),
    0,
  );
  const { currency } = useConfigurationContext();
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

  const label = stageLabel ?? stage;

  return (
    <div className="flex-1 min-w-[220px] pb-8">
      <div className="border-b border-border/40 pb-2 mb-3">
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-foreground/70">
            {label}
          </h3>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-muted-foreground hover:text-destructive transition-colors text-[12px] leading-none flex-shrink-0"
              title="Remover coluna"
            >
              ×
            </button>
          )}
        </div>
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
              deals.length === 0
                ? "min-h-28 border border-dashed border-border/40 bg-muted/10 p-2"
                : ""
            } ${snapshot.isDraggingOver ? "bg-primary/5" : ""}`}
          >
            {deals.length === 0 && (
              <div className="flex flex-1 items-center justify-center rounded-lg text-[12px] text-muted-foreground">
                Sem negócios nesta coluna
              </div>
            )}
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
