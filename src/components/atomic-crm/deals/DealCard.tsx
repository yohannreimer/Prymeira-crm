import { Draggable } from "@hello-pangea/dnd";
import { AlertCircle, CalendarClock } from "lucide-react";
import type { KeyboardEvent } from "react";
import {
  useLocaleState,
  useRedirect,
  RecordContextProvider,
  useTranslate,
} from "ra-core";
import { ReferenceField } from "@/components/admin/reference-field";
import { NumberField } from "@/components/admin/number-field";
import { SelectField } from "@/components/admin/select-field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { CompanyAvatar } from "../companies/CompanyAvatar";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { getDealRiskState, getWeightedAmount } from "./dealCommercialUtils";

export const DealCard = ({ deal, index }: { deal: Deal; index: number }) => {
  if (!deal) return null;

  return (
    <Draggable draggableId={String(deal.id)} index={index}>
      {(provided, snapshot) => (
        <DealCardContent provided={provided} snapshot={snapshot} deal={deal} />
      )}
    </Draggable>
  );
};

export const DealCardContent = ({
  provided,
  snapshot,
  deal,
}: {
  provided?: any;
  snapshot?: any;
  deal: Deal;
}) => {
  const { dealCategories, dealTypes, currency } = useConfigurationContext();
  const redirect = useRedirect();
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();
  const riskState = getDealRiskState(deal);
  const weightedAmount = getWeightedAmount(deal);
  const dealTypeLabel =
    dealTypes.find((type) => type.value === deal.deal_type)?.label ??
    deal.deal_type;
  const formattedWeightedAmount = weightedAmount.toLocaleString(locale, {
    notation: "compact",
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumSignificantDigits: 3,
  });
  const handleClick = () => {
    redirect(`/deals/${deal.id}/show`, undefined, undefined, undefined, {
      _scrollToTop: false,
    });
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    provided?.dragHandleProps?.onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`${translate("ra.action.show")} ${deal.name}`}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      ref={provided?.innerRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <RecordContextProvider value={deal}>
        <Card
          className={`py-3 transition-all duration-200 ${
            snapshot?.isDragging
              ? "opacity-90 transform rotate-1 shadow-lg"
              : "shadow-sm hover:shadow-md"
          }`}
        >
          <CardContent className="px-3 flex flex-col">
            <div className="flex-1 flex gap-2">
              <p className="flex-1 min-w-0 text-sm font-medium mb-2 truncate">
                <ReferenceField
                  source="company_id"
                  reference="companies"
                  link={false}
                />
                {" - "}
                {deal.name}
              </p>
              <ReferenceField
                source="company_id"
                reference="companies"
                link={false}
              >
                <CompanyAvatar width={20} height={20} />
              </ReferenceField>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              <NumberField
                source="amount"
                options={{
                  notation: "compact",
                  style: "currency",
                  currency,
                  currencyDisplay: "narrowSymbol",
                  minimumSignificantDigits: 3,
                }}
                locales={locale}
              />
              {deal.category && ", "}
              <SelectField
                source="category"
                choices={dealCategories}
                optionText="label"
                optionValue="value"
              />
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {deal.deal_type && (
                <Badge
                  variant="secondary"
                  className="max-w-full truncate px-1.5 font-normal"
                  title={dealTypeLabel}
                >
                  {dealTypeLabel}
                </Badge>
              )}
              {typeof deal.probability === "number" && (
                <Badge variant="outline" className="px-1.5 font-normal">
                  {deal.probability}%
                </Badge>
              )}
              <Badge variant="outline" className="px-1.5 font-normal">
                {translate("resources.deals.weighted_short_compact")}{" "}
                {formattedWeightedAmount}
              </Badge>
              {riskState === "missing_next_action" && (
                <Badge variant="destructive" className="px-1.5 font-normal">
                  <CalendarClock />
                  {translate("resources.deals.risk.no_next_action")}
                </Badge>
              )}
              {riskState === "stale" && (
                <Badge variant="outline" className="px-1.5 font-normal">
                  <AlertCircle />
                  {translate("resources.deals.risk.stale")}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </RecordContextProvider>
    </div>
  );
};
