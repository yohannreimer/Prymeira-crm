import type { LeadStatus, LeadTemperature } from "../types";

export const leadStatuses: Array<{ value: LeadStatus; label: string }> = [
  { value: "new", label: "resources.leads.statuses.new" },
  { value: "contacted", label: "resources.leads.statuses.contacted" },
  { value: "qualified", label: "resources.leads.statuses.qualified" },
  { value: "converted", label: "resources.leads.statuses.converted" },
  { value: "discarded", label: "resources.leads.statuses.discarded" },
];

export const leadTemperatures: Array<{
  value: LeadTemperature;
  label: string;
}> = [
  { value: "cold", label: "resources.leads.temperatures.cold" },
  { value: "warm", label: "resources.leads.temperatures.warm" },
  { value: "hot", label: "resources.leads.temperatures.hot" },
];
