import type { CreateParams, DataProvider } from "ra-core";
import {
  addWorkspaceToCreateParams,
  isTenantResource,
} from "../../prymeira/tenantResources";

export function withTenantDataProvider<T extends DataProvider>(
  baseDataProvider: T,
  getWorkspaceId: () => string | null | undefined,
): T {
  return {
    ...baseDataProvider,
    async create(resource: string, params: CreateParams) {
      if (!isTenantResource(resource)) {
        return baseDataProvider.create(resource, params);
      }
      const workspaceId = getWorkspaceId();
      if (!workspaceId) {
        throw new Error("Missing Prymeira workspace context");
      }
      return baseDataProvider.create(
        resource,
        addWorkspaceToCreateParams(resource, params, workspaceId),
      );
    },
  };
}
