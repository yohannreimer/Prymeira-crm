import type { CreateParams } from "ra-core";

export const tenantResources = [
  "companies",
  "contacts",
  "contact_notes",
  "pipelines",
  "deals",
  "deal_notes",
  "leads",
  "sales",
  "sales_goals",
  "tags",
  "automation_runs",
  "proposal_templates",
  "proposal_template_items",
  "proposals",
  "proposal_items",
  "automation_rules",
  "tasks",
  "configuration",
  "favicons_excluded_domains",
] as const;

const tenantResourceSet = new Set<string>(tenantResources);

export function isTenantResource(resource: string) {
  return tenantResourceSet.has(resource);
}

export function addWorkspaceToCreateParams<TData extends Record<string, any>>(
  resource: string,
  params: CreateParams<TData>,
  workspaceId: string,
): CreateParams<TData> {
  if (!isTenantResource(resource)) return params;
  if (params.data.workspace_id) return params;

  return {
    ...params,
    data: {
      ...params.data,
      workspace_id: workspaceId,
    },
  };
}
