import { useGetIdentity, useGetOne } from "ra-core";
import type { Identifier } from "ra-core";

import type { Sale } from "../types";

export const useDashboardScope = () => {
  const { identity, isPending: isPendingIdentity } = useGetIdentity();
  const hasIdentity = identity?.id != null;
  const { data: currentSale, isPending: isPendingCurrentSale } =
    useGetOne<Sale>(
      "sales",
      { id: identity?.id ?? "" },
      { enabled: hasIdentity },
    );

  const isAdmin = currentSale?.administrator === true;
  const salesId = identity?.id as Identifier | undefined;
  const salesFilter = !isAdmin && salesId != null ? { sales_id: salesId } : {};
  const ownRecordFilter = !isAdmin && salesId != null ? { id: salesId } : {};

  return {
    currentSale,
    identity,
    isAdmin,
    isPending: isPendingIdentity || (hasIdentity && isPendingCurrentSale),
    ownRecordFilter,
    salesFilter,
    salesId,
  };
};
